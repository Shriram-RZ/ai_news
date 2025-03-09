import { useState } from "react";
import { motion } from "framer-motion";

function App() {
  const [query, setQuery] = useState("");

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white p-6">
      <motion.h1
        className="text-4xl font-bold text-blue-400 mb-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        AI News Aggregator
      </motion.h1>

      <div className="flex gap-4 w-full max-w-md">
        <input
          type="text"
          className="w-full px-4 py-2 rounded-lg bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter your query..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button className="px-6 py-2 bg-blue-500 rounded-lg hover:bg-blue-600 transition">
          Search
        </button>
      </div>
    </div>
  );
}

export default App;
