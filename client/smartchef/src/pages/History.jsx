import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { historyService } from "../services/historyService";
import authService from "../services/authService";
import GlobalLayout from "../layouts/GlobalLayout";
import LoadingSpinner from "../components/LoadingSpinner";

function History() {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchHistoryData = async () => {
      try {
        const token = authService.getToken();
        if (!token) {
          navigate("/");
          return;
        }

        // Fetch user data
        const userRes = await authService.getCurrentUser(token);
        setUser(userRes.data.user);

        // Fetch history using new service with JWT
        const historyRes = await historyService.getUserHistory(token);
        setData(historyRes.data || []);
      } catch (err) {
        console.error("Error fetching history:", err);
        setError("Failed to load history");
      } finally {
        setLoading(false);
      }
    };

    fetchHistoryData();
  }, [navigate]);

  if (loading) {
    return (
      <GlobalLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-white/60">Loading history...</p>
          </div>
        </div>
      </GlobalLayout>
    );
  }

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
          <h1 className="text-5xl font-bold text-white mb-2">
            📊 <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">Detection History</span>
          </h1>
          <p className="text-white/60 text-lg">View all your dish detections</p>
        </motion.div>

        {/* Error Message */}
        {error && (
          <motion.div
            variants={itemVariants}
            className="backdrop-blur-xl bg-red-500/20 border border-red-500/50 rounded-2xl p-6"
          >
            <p className="text-red-300 flex items-center gap-2">⚠️ {error}</p>
          </motion.div>
        )}

        {/* Empty State */}
        {data.length === 0 ? (
          <motion.div
            variants={itemVariants}
            className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-12 text-center"
          >
            <div className="text-6xl mb-4">📸</div>
            <h2 className="text-2xl font-bold text-white mb-3">
              No Detection History
            </h2>
            <p className="text-white/60 mb-6">
              Upload an image to start detecting dishes and building your history!
            </p>
            <motion.button
              onClick={() => navigate("/upload")}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-semibold px-8 py-4 rounded-lg transition-all"
            >
              🚀 Start Detecting
            </motion.button>
          </motion.div>
        ) : (
          /* History Grid */
          <motion.div
            variants={itemVariants}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {data.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl overflow-hidden hover:border-cyan-500/50 transition-all"
              >
                {/* Image Preview */}
                {item.imageUrl && (
                  <div className="relative h-48 bg-black/50 overflow-hidden group">
                    <img
                      src={item.imageUrl}
                      alt={item.dish}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/50 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                )}

                {/* Content */}
                <div className="p-6">
                  {/* Dish Name */}
                  <h3 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400 mb-4">
                    🍽️ {item.dish}
                  </h3>

                  {/* Ingredients */}
                  <div className="mb-4">
                    <p className="text-white/80 text-sm font-semibold mb-2">
                      🧠 Ingredients
                    </p>
                    <p className="text-white/60 text-sm line-clamp-3">
                      {item.ingredients}
                    </p>
                  </div>

                  {/* Nutrition */}
                  <div className="mb-4">
                    <p className="text-white/80 text-sm font-semibold mb-2">
                      🥗 Nutrition
                    </p>
                    <p className="text-white/60 text-sm line-clamp-2">
                      {item.nutrition}
                    </p>
                  </div>

                  {/* Timestamp */}
                  <p className="text-white/40 text-xs border-t border-white/10 pt-4 mt-4">
                    {new Date(item.createdAt).toLocaleDateString()} at{" "}
                    {new Date(item.createdAt).toLocaleTimeString()}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </motion.div>
    </GlobalLayout>
  );
}

export default History;
