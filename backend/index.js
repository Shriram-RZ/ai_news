const express = require("express");
const mysql = require("mysql2");
const axios = require("axios");
const cheerio = require("cheerio");
const bodyParser = require("body-parser");
const randomUseragent = require("random-useragent");

const app = express();
app.use(bodyParser.json());

// Database Configuration
const db = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "",
  database: "news_aggregator",
});

// API Keys
const GOOGLE_API_KEY = "AIzaSyCN4fXMOnYAWiidCwIk4YAVH9r2sywg7dg";
const GOOGLE_CX = "a12e2e3d2891e4a2d";
const GEMINI_API_KEY = "AIzaSyDKI3hi1z0Ol871S5VLXH3x2BX4hivhVMQ";

// 🔹 Google Custom Search API
const searchNews = async (query, attempts = 3) => {
  try {
    const encodedQuery = encodeURIComponent(query);
    const url = `https://www.googleapis.com/customsearch/v1?q=${encodedQuery}&cx=${GOOGLE_CX}&key=${GOOGLE_API_KEY}&num=2`;
    const response = await axios.get(url);
    const links = response.data.items?.map((item) => item.link) || [];

    if (links.length === 0 && attempts > 0) {
      console.log(`No results for "${query}". Retrying...`);
      return searchNews(`latest news on ${query}`, attempts - 1);
    }

    return links;
  } catch (error) {
    console.error("Google Search API Error:", error);
    return [];
  }
};

// 🔹 Extract page content using Cheerio
const fetchPageContent = async (url) => {
  try {
    const headers = { "User-Agent": randomUseragent.getRandom() };
    const response = await axios.get(url, { headers });
    const $ = cheerio.load(response.data);

    let extractedText = "";
    $("p").each((i, elem) => {
      extractedText += $(elem).text() + " ";
    });

    return extractedText.trim() || "Content extraction failed.";
  } catch (error) {
    console.error(`Error fetching content from ${url}:`, error);
    return "Content extraction failed.";
  }
};

// 🔹 Summarize using Gemini AI
const summarizeText = async (query, text) => {
  try {
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        contents: [
          {
            parts: [
              {
                text: `Given the query: "${query}", extract the most relevant key points from this article: ${text}`,
              },
            ],
          },
        ],
      },
      { headers: { "Content-Type": "application/json" } }
    );

    return response.data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "Summary not available.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Summary not available.";
  }
};

// 🔹 Check Fake News using Fake-News-BERT
const checkFakeNews = async (text) => {
  try {
    const response = await axios.post("http://localhost:8000/predict", { text });
    return response.data.credibility; // "Real" or "Fake"
  } catch (error) {
    console.error("Fake-News-BERT API Error:", error.message);
    return "unknown"; // Fallback
  }
};

// 🔹 Store results in MySQL
const dbInsert = (queryId, url, extractedText, smartResponse) => {
  console.log(`📝 Attempting to insert result for queryId: ${queryId}`);

  db.query(
    "INSERT INTO results (query_id, url, extracted_text, smart_response, detect_result) VALUES (?, ?, ?, ?, NULL)",
    [queryId, url, extractedText, smartResponse],
    (err, result) => {
      if (err) {
        console.error("❌ Database Insert Error:", err);
      } else {
        console.log(`✅ Successfully inserted resultId: ${result.insertId} for queryId: ${queryId}`);
      }
    }
  );
};


// 🔹 Process a Query (Main Logic)
const processQuery = async (query, queryId) => {
  console.log(`🔍 Processing query: ${query}`);

  const urls = await searchNews(query);
  for (const url of urls) {
    console.log(`🌍 Fetching content from: ${url}`);

    const extractedText = await fetchPageContent(url);
    console.log(`📄 Extracted Text Length: ${extractedText.length}`);

    if (extractedText === "Content extraction failed.") {
      console.warn("⚠️ Skipping this result due to extraction failure.");
      continue;
    }

    const smartResponse = await summarizeText(query, extractedText);
    dbInsert(queryId, url, extractedText, smartResponse);

    console.log(`✅ News stored!`);
    return;
  }

  console.log("❌ No relevant news found.");
};


// 🔹 API to handle search queries
app.post("/search", (req, res) => {
  const { query } = req.body;
  if (!query) return res.status(400).json({ error: "Query is required" });

  db.query("INSERT INTO queries (query) VALUES (?)", [query], (err, results) => {
    if (err) return res.status(500).json({ error: "Database error" });

    const queryId = results.insertId;
    processQuery(query, queryId);
    res.json({ message: "Query is being processed", queryId });
  });
});

// 🔹 API to fetch stored results
app.get("/results/:queryId", (req, res) => {
  const queryId = req.params.queryId;

  db.query(
    "SELECT id, url, extracted_text, smart_response, detect_result FROM results WHERE query_id = ?",
    [queryId],
    (err, rows) => {
      if (err) return res.status(500).json({ error: "Failed to fetch results" });
      if (rows.length === 0) return res.json({ message: "No results found" });
      res.json({ queryId, results: rows });
    }
  );
});

app.post("/detect/:resultId", async (req, res) => {
  const resultId = req.params.resultId;
  console.log(`🔍 Checking for resultId: ${resultId}`);

  db.query("SELECT smart_response FROM results WHERE id = ?", [resultId], async (err, rows) => {
    if (err) {
      console.error("❌ Database error:", err);
      return res.status(500).json({ error: "Database error" });
    }

    if (rows.length === 0) {
      console.warn(`⚠️ No result found for id: ${resultId}`);
      return res.status(404).json({ error: "Result not found" });
    }

    const summaryText = rows[0].smart_response;
    if (!summaryText) {
      console.warn(`⚠️ No summary available for id: ${resultId}`);
      return res.status(400).json({ error: "No summary available for detection" });
    }

    try {
      const response = await axios.post("http://localhost:8000/predict", { text: summaryText });
      const detectResult = response.data.credibility;

      db.query("UPDATE results SET detect_result = ? WHERE id = ?", [detectResult, resultId], (err) => {
        if (err) {
          console.error("❌ Failed to update detect result:", err);
          return res.status(500).json({ error: "Failed to update detect result" });
        }
        console.log(`✅ Detection complete for id: ${resultId} -> ${detectResult}`);
        res.json({ message: "Detection completed", resultId, detectResult });
      });
    } catch (error) {
      console.error("❌ Fake-News-BERT Detection Error:", error);
      res.status(500).json({ error: "Detection failed" });
    }
  });
});


// 🔹 Start Server
app.listen(3000, () => console.log("✅ Server running on port 3000"));
