-- Create the Database
CREATE DATABASE IF NOT EXISTS news_aggregator;
USE news_aggregator;

-- 🚀 Table: queries (Stores user search queries)
CREATE TABLE queries (
    id INT AUTO_INCREMENT PRIMARY KEY,
    query VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 🚀 Table: results (Stores extracted news articles and summaries)
CREATE TABLE results (
    id INT AUTO_INCREMENT PRIMARY KEY,
    query_id INT NOT NULL,
    url VARCHAR(2083) NOT NULL UNIQUE, -- Ensures no duplicate URLs
    extracted_text TEXT NOT NULL,
    smart_response TEXT, -- Summarized text from AI
    detect_result ENUM('Real', 'Fake', 'Unknown') DEFAULT 'Unknown', -- Fake-News-BERT result
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (query_id) REFERENCES queries(id) ON DELETE CASCADE
);

-- 🚀 Indexes for Faster Search
CREATE INDEX idx_query ON queries(query);
CREATE INDEX idx_query_id ON results(query_id);

-- 🚀 Sample Data (Optional)
INSERT INTO queries (query) VALUES ('Latest AI News'), ('Stock Market Trends');
INSERT INTO results (query_id, url, extracted_text, smart_response, detect_result)
VALUES 
(1, 'https://example.com/ai-news', 'AI is advancing...', 'AI is growing rapidly.', 'Real'),
(2, 'https://example.com/stocks', 'Stock market is volatile...', 'Markets are fluctuating.', 'Unknown');

-- 🚀 View Query Results
SELECT q.id AS query_id, q.query, r.url, r.extracted_text, r.smart_response, r.detect_result
FROM queries q
LEFT JOIN results r ON q.id = r.query_id
ORDER BY q.created_at DESC;
