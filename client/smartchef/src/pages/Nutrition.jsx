import React, { useState } from "react";
import { motion } from "framer-motion";
import { Loader, Search } from "lucide-react";
import axios from "axios";
import API_BASE from "../config/api";
import GlobalLayout from "../layouts/GlobalLayout";

const Nutrition = () => {
  const [dish, setDish] = useState("");
  const [nutrition, setNutrition] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!dish.trim()) {
      setError("Please enter a dish name");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await axios.post(
        `${API_BASE}/nutrition/get-nutrition`,
        { dish }
      );

      setNutrition(response.data.nutrition);
    } catch (err) {
      setError(
        err.response?.data?.error || "Error fetching nutrition info. Please try again."
      );
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const parseNutrition = (text) => {
    if (!text) return null;

    const lines = text.split("\n").filter((l) => l.trim());
    const result = {
      calories: "N/A",
      protein: "N/A",
      carbs: "N/A",
      fat: "N/A",
      pros: [],
      cons: [],
      other: [],
    };

    let currentSection = "other";

    lines.forEach((line) => {
      const lower = line.toLowerCase();

      if (lower.includes("calorie")) {
        result.calories = line;
      } else if (lower.includes("protein")) {
        result.protein = line;
      } else if (lower.includes("carb")) {
        result.carbs = line;
      } else if (lower.includes("fat")) {
        result.fat = line;
      } else if (lower.includes("pros") || lower.includes("benefit")) {
        currentSection = "pros";
      } else if (lower.includes("cons") || lower.includes("drawback")) {
        currentSection = "cons";
      } else if (currentSection === "pros") {
        result.pros.push(line);
      } else if (currentSection === "cons") {
        result.cons.push(line);
      } else {
        result.other.push(line);
      }
    });

    return result;
  };

  const parsed = nutrition ? parseNutrition(nutrition) : null;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <GlobalLayout>
      <motion.div
        className="space-y-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header */}
        <motion.div variants={itemVariants}>
          <h1 className="text-4xl font-bold text-white mb-2">🥗 Nutrition Insights</h1>
          <p className="text-white/60">Get detailed nutrition information for any dish</p>
        </motion.div>

        {/* Search Form */}
        <motion.div
          variants={itemVariants}
          className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-8"
        >
          <form onSubmit={handleSearch} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Dish Name
              </label>
              <input
                type="text"
                value={dish}
                onChange={(e) => setDish(e.target.value)}
                placeholder="e.g., Grilled Chicken Salad"
                className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-purple-500 focus:bg-white/10 transition-all"
              />
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 text-red-200"
              >
                {error}
              </motion.div>
            )}

            <motion.button
              type="submit"
              disabled={loading || !dish}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Search className="w-5 h-5" />
                  Get Nutrition Info
                </>
              )}
            </motion.button>
          </form>
        </motion.div>

        {/* Results */}
        {parsed && (
          <motion.div variants={itemVariants} className="space-y-6">
            {/* Macros */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "Calories", value: parsed.calories, icon: "🔥", color: "orange" },
                { label: "Protein", value: parsed.protein, icon: "💪", color: "red" },
                { label: "Carbs", value: parsed.carbs, icon: "⚡", color: "yellow" },
                { label: "Fat", value: parsed.fat, icon: "🧈", color: "amber" },
              ].map((macro) => (
                <motion.div
                  key={macro.label}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={`backdrop-blur-xl bg-${macro.color}-500/10 border border-${macro.color}-500/30 rounded-xl p-4 text-center hover:border-${macro.color}-500/50 transition-all`}
                >
                  <p className="text-2xl mb-2">{macro.icon}</p>
                  <p className="text-sm text-white/60 mb-1">{macro.label}</p>
                  <p className="text-white font-semibold text-sm whitespace-pre-wrap">
                    {macro.value}
                  </p>
                </motion.div>
              ))}
            </div>

            {/* Health Pros */}
            {parsed.pros && parsed.pros.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="backdrop-blur-xl bg-green-500/10 border border-green-500/30 rounded-2xl p-6"
              >
                <h3 className="text-xl font-bold text-green-400 mb-4">✅ Health Benefits</h3>
                <ul className="space-y-2">
                  {parsed.pros.map((pro, idx) => (
                    <li key={idx} className="flex gap-3 text-white/80 text-sm">
                      <span className="text-green-400 font-bold">•</span>
                      <span>{pro}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            )}

            {/* Health Cons */}
            {parsed.cons && parsed.cons.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="backdrop-blur-xl bg-red-500/10 border border-red-500/30 rounded-2xl p-6"
              >
                <h3 className="text-xl font-bold text-red-400 mb-4">⚠️ Things to Watch</h3>
                <ul className="space-y-2">
                  {parsed.cons.map((con, idx) => (
                    <li key={idx} className="flex gap-3 text-white/80 text-sm">
                      <span className="text-red-400 font-bold">•</span>
                      <span>{con}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            )}

            {/* Other Info */}
            {parsed.other && parsed.other.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6"
              >
                <h3 className="text-xl font-bold text-white mb-4">📊 Additional Info</h3>
                <div className="space-y-2">
                  {parsed.other.map((info, idx) => (
                    <p key={idx} className="text-white/80 text-sm">{info}</p>
                  ))}
                </div>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* Empty State */}
        {!nutrition && !loading && dish === "" && (
          <motion.div
            variants={itemVariants}
            className="min-h-96 backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl flex items-center justify-center"
          >
            <div className="text-center">
              <p className="text-6xl mb-4">🥗</p>
              <p className="text-white/60">Search for a dish to see nutrition info</p>
            </div>
          </motion.div>
        )}
      </motion.div>
    </GlobalLayout>
  );
};

export default Nutrition;
