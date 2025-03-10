Backend is completed with working database and Frontend will be updated soon.
# AI News Aggregator

This project is an AI-driven news aggregator that uses FastAPI, React, and MySQL (XAMPP). It fetches accurate search results using Google Search API, extracts data with Selenium, BeautifulSoup, and Newspaper3k, and summarizes news using advanced NLP models like BERT.

## Folder Structure

- **model**: Contains model-related files and dependencies.
- **backend**: Contains the FastAPI backend code.
- **frontend**: Contains the React frontend code.
- **XAMPP**: Contains SQL files for MySQL setup in XAMPP.

---

## Setup

### 1. **Model Folder**

Inside the `model` folder, run the following command to install necessary Python dependencies:

```bash
pip install fastapi uvicorn torch transformers
```

### 2. **Backend Folder**

Inside the `backend` folder, run the following command to install necessary Node.js dependencies:

```bash
npm install
```

### 3. **Frontend Folder**

Inside the `frontend` folder, run the following command to install necessary Node.js dependencies:

```bash
npm install
```

---

## XAMPP Setup

1. **Install XAMPP** and start MySQL.

2. **SQL Code**: Use the following SQL to set up the necessary database and tables for the project.

```sql
CREATE DATABASE ai_news_aggregator;

USE ai_news_aggregator;

-- Table to store queries
CREATE TABLE queries (
    query_id INT AUTO_INCREMENT PRIMARY KEY,
    query TEXT NOT NULL,
    dateandtime TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table to store responses
CREATE TABLE responses (
    response_id INT AUTO_INCREMENT PRIMARY KEY,
    query_id INT,
    response TEXT,
    smart_response TEXT,
    dateandtime TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (query_id) REFERENCES queries(query_id)
);

-- Table to track search history
CREATE TABLE search_history (
    search_id INT AUTO_INCREMENT PRIMARY KEY,
    query_id INT,
    dateandtime TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (query_id) REFERENCES queries(query_id)
);
```

---

## Run the Project

### 1. **Backend**

To run the FastAPI backend:

```bash
uvicorn main:app --reload
```

### 2. **Frontend**

To run the React frontend:

```bash
npm start
```

---

## Additional Notes

- The AI news aggregator uses Google Search API for fetching search results.
- The data is extracted using Selenium, BeautifulSoup, and Newspaper3k.
- The query classification is handled by a BERT-based model to improve accuracy.

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
