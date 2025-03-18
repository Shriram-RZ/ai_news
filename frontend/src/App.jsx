import React, { useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";

export default function App() {
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const sendQuery = async () => {
    if (!query.trim()) return;
    
    const newMessages = [...messages, { role: "user", content: query }];
    setMessages(newMessages);
    setQuery("");
    setLoading(true);

    try {
      const response = await axios.post("http://localhost:3000/search", { query });
      const queryId = response.data.queryId;

      let result = null;
      for (let i = 0; i < 5; i++) {
        await new Promise((r) => setTimeout(r, 3000));
        const res = await axios.get(`http://localhost:3000/results/${queryId}`);
        if (res.data.results) {
          result = res.data.results[0];
          break;
        }
      }

      if (result) {
        const detectResponse = await axios.post(`http://localhost:3000/detect/${result.id}`);
        result.detect_result = detectResponse.data.detectResult;
      }

      setMessages([...newMessages, { role: "system", content: result ? formatResponse(result) : "No relevant news found." }]);
    } catch (error) {
      setMessages([...newMessages, { role: "system", content: "Error fetching results." }]);
    } finally {
      setLoading(false);
    }
  };

  const formatResponse = (result) => {
    return `🌍 **Source:** ${result.url}\n📝 **Extracted Text:** ${result.extracted_text.slice(0, 200)}...\n🤖 **AI Summary:** ${result.smart_response}\n🛑 **Fake News Check:** ${result.detect_result.toUpperCase()}`;
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-white p-4">
      <div className="w-full max-w-2xl border border-gray-700 rounded-lg p-4 bg-gray-800 shadow-lg">
        <h1 className="text-xl font-bold text-center mb-4">📰 AI News Aggregator</h1>
        <div className="h-96 overflow-y-auto space-y-3 p-2">
          {messages.map((msg, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} 
              className={`p-3 rounded-lg text-sm max-w-[80%] ${msg.role === "user" ? "bg-blue-600 self-end" : "bg-gray-700 self-start"}`}>
              {msg.content.split("\n").map((line, index) => (
                <p key={index}>{line}</p>
              ))}
            </motion.div>
          ))}
          {loading && <motion.div className="p-3 bg-gray-700 rounded-lg max-w-[80%]">⌛ Fetching results...</motion.div>}
        </div>
        <div className="flex items-center mt-3">
          <input type="text" value={query} onChange={(e) => setQuery(e.target.value)}
            className="flex-1 p-2 bg-gray-700 border border-gray-600 rounded-l-lg outline-none text-white" placeholder="Enter a news topic..." />
          <button onClick={sendQuery} className="p-2 bg-blue-600 hover:bg-blue-500 rounded-r-lg">🔍</button>
        </div>
      </div>
    </div>
  );
}
