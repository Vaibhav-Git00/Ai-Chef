import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Upload as UploadIcon, Loader } from "lucide-react";
import axios from "axios";
import authService from "../services/authService";
import API_BASE from "../config/api";
import GlobalLayout from "../layouts/GlobalLayout";
import LoadingSpinner from "../components/LoadingSpinner";
import { useToast } from "../contexts/ToastContext";

const Upload = () => {
  const navigate = useNavigate();
  const { success, error: showError } = useToast();
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Reset result when selecting new image
      setResult(null);
      setError("");
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async () => {
    if (!image) {
      setError("Please select an image first");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("image", image);

      // Upload image
      console.log("📤 Step 1: Uploading image...");
      const uploadRes = await axios.post(
        `${API_BASE}/image/upload`,
        formData
      );

      const imageUrl = uploadRes.data.imageUrl;
      console.log("✅ Image uploaded:", imageUrl);

      // Detect ingredients and dishes
      console.log("🧠 Step 2: Detecting ingredients and generating dishes...");
      const aiRes = await axios.post(
        `${API_BASE}/smart/from-image`,
        { imageUrl }
      );

      console.log("✅ Detection successful:", aiRes.data);

      // Get nutrition info for first dish
      const firstDish = aiRes.data.suggestedDishes.split("\n")[0];
      console.log("📊 Step 3: Getting nutrition info for:", firstDish);
      
      const nutriRes = await axios.post(
        `${API_BASE}/nutrition/get-nutrition`,
        { dish: firstDish }
      );

      console.log("✅ Nutrition info retrieved");

      // Save to history
      const token = authService.getToken();
      if (token) {
        try {
          console.log("💾 Saving to history...");
          await axios.post(
            "http://localhost:8000/api/history/save",
            {
              imageUrl,
              ingredients: aiRes.data.detectedIngredients,
              dish: firstDish,
              nutrition: nutriRes.data.nutrition,
            },
            { headers: { Authorization: `Bearer ${token}` } }
          );
          console.log("✅ Saved to history");
        } catch (historyErr) {
          console.error("⚠️ Error saving to history:", historyErr);
          // Don't block the user, history saving is optional
        }
      }

      setResult({
        imageUrl,
        ingredients: aiRes.data.detectedIngredients,
        dishes: aiRes.data.suggestedDishes,
        nutrition: nutriRes.data.nutrition,
      });
      
      success("🎉 Dish detection complete! Ready to generate recipes");
    } catch (err) {
      console.error("❌ Upload error:", err);

      // Extract meaningful error message
      let errorMessage = "Error detecting dish. Please try again.";
      
      if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
        
        // Add details if available
        if (err.response.data.details) {
          errorMessage += ` (${err.response.data.details})`;
        }

        // Add step information if available
        if (err.response.data.step) {
          errorMessage = `Step ${err.response.data.step}: ${errorMessage}`;
        }
      } else if (err.message) {
        errorMessage = err.message;
      }

      setError(errorMessage);
      showError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

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
          <h1 className="text-4xl font-bold text-white mb-2">📸 Dish Detection</h1>
          <p className="text-white/60">Upload food photo to detect dishes and get nutrition info</p>
        </motion.div>

        {!result ? (
          <motion.div
            variants={itemVariants}
            className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-8"
          >
            {/* Upload Area */}
            <div className="mb-8">
              <label className="block">
                <div className="border-2 border-dashed border-white/30 rounded-xl p-8 text-center cursor-pointer hover:border-purple-500 hover:bg-white/5 transition-all">
                  <UploadIcon className="w-12 h-12 text-purple-400 mx-auto mb-3" />
                  <p className="text-white font-semibold mb-1">Click to upload or drag & drop</p>
                  <p className="text-white/60 text-sm">PNG, JPG, GIF up to 10MB</p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="hidden"
                  />
                </div>
              </label>
            </div>

            {/* Preview */}
            {preview && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
                <div className="relative group">
                  {/* Professional Frame with Shadow */}
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-pink-500/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-300"></div>
                  
                  {/* Image Container */}
                  <div className="relative h-96 lg:h-[500px] rounded-3xl overflow-hidden border-2 border-white/20 shadow-2xl hover:shadow-purple-500/30 transition-all duration-300 bg-black/40 flex items-center justify-center">
                    <img 
                      src={preview} 
                      alt="Preview" 
                      className="w-full h-full object-contain p-2" 
                    />
                    
                    {/* Overlay corner accent */}
                    <div className="absolute top-4 right-4 w-12 h-12 border-2 border-white/30 rounded-full"></div>
                    <div className="absolute bottom-4 left-4 w-8 h-8 border-2 border-white/20 rounded-full"></div>
                    
                    {/* Shine effect on hover */}
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 mb-6 text-red-200"
              >
                {error}
              </motion.div>
            )}

            {/* Upload Button */}
            <motion.button
              onClick={handleUpload}
              disabled={!image || loading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-all shadow-lg"
            >
              {loading ? (
                <Loader className="w-5 h-5 animate-spin mx-auto" />
              ) : (
                "Detect Dish"
              )}
            </motion.button>
          </motion.div>
        ) : (
          <motion.div
            variants={itemVariants}
            className="space-y-8"
          >
            {/* Results Header */}
            <motion.div className="text-center">
              <h2 className="text-3xl font-bold text-white mb-2">🎉 Detection Complete!</h2>
              <p className="text-white/60">Here's what we found in your image</p>
            </motion.div>

            {/* Main Results Grid */}
            <motion.div
              className="grid grid-cols-1 lg:grid-cols-3 gap-8"
            >
              {/* Large Image - Left Side (takes 2 rows on desktop) */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="lg:row-span-2 group relative"
              >
                {/* Gradient background glow */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-pink-500/20 rounded-3xl blur-2xl group-hover:blur-3xl transition-all duration-300"></div>
                
                {/* Image Frame */}
                <div className="relative backdrop-blur-xl bg-black/40 border-2 border-white/30 rounded-3xl overflow-hidden shadow-2xl hover:shadow-purple-500/40 transition-all duration-300 flex items-center justify-center min-h-[400px]">
                  <img src={result.imageUrl} alt="Detected" className="w-full h-full object-contain p-4" />
                  
                  {/* Professional corner accents */}
                  <div className="absolute top-6 left-6 w-16 h-16 border-2 border-white/40 rounded-full blur-sm"></div>
                  <div className="absolute bottom-8 right-8 w-12 h-12 border-2 border-white/30 rounded-full blur-sm"></div>
                  
                  {/* Lighting glow on hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-purple-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                </div>
              </motion.div>

              {/* Detected Dishes Card - Top Right */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="backdrop-blur-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/30 rounded-3xl p-8 hover:border-blue-500/60 transition-all"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-blue-500/30 p-3 rounded-xl">
                    <span className="text-2xl">🍽️</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-blue-300">Detected Dishes</h3>
                    <p className="text-white/40 text-sm">AI identified these dishes</p>
                  </div>
                </div>
                <div className="space-y-2">
                  {result.dishes.split("\n").filter(d => d.trim()).slice(0, 5).map((dish, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 + i * 0.05 }}
                      className="bg-blue-500/10 p-3 rounded-xl border border-blue-500/20 hover:bg-blue-500/20 transition-all"
                    >
                      <p className="text-white/80 font-medium">{i + 1}. {dish.replace(/^\d+\.\s*/, "").trim()}</p>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* Ingredients Card - Middle Right */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="backdrop-blur-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-3xl p-8 hover:border-purple-500/60 transition-all"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-purple-500/30 p-3 rounded-xl">
                    <span className="text-2xl">🧠</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-purple-300">Ingredients</h3>
                    <p className="text-white/40 text-sm">Detected components</p>
                  </div>
                </div>
                <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
                  {result.ingredients.split(",").map((ing, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + i * 0.05 }}
                      className="flex items-center gap-2 p-2 text-white/80 hover:text-white transition-colors"
                    >
                      <span className="text-purple-400 text-lg">✓</span>
                      <span className="text-sm">{ing.trim()}</span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* Nutrition Card - Bottom Right */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="backdrop-blur-xl bg-gradient-to-br from-orange-500/20 to-red-500/20 border border-orange-500/30 rounded-3xl p-8 hover:border-orange-500/60 transition-all"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-orange-500/30 p-3 rounded-xl">
                    <span className="text-2xl">🥗</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-orange-300">Nutrition</h3>
                    <p className="text-white/40 text-sm">Health information</p>
                  </div>
                </div>
                <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                  <p className="text-white/80 text-sm whitespace-pre-wrap leading-relaxed">
                    {result.nutrition}
                  </p>
                </div>
              </motion.div>
            </motion.div>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="flex gap-4 flex-wrap"
            >
              <motion.button
                onClick={() => {
                  setImage(null);
                  setPreview(null);
                  setResult(null);
                  setError("");
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex-1 min-w-64 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold py-4 rounded-xl transition-all shadow-lg transform hover:shadow-xl"
              >
                📸 Detect Another Dish
              </motion.button>
              <motion.button
                onClick={() => navigate("/recipes", { state: { ingredients: result.ingredients } })}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex-1 min-w-64 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-4 rounded-xl transition-all shadow-lg transform hover:shadow-xl"
              >
                👨‍🍳 Get Recipe
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </motion.div>
    </GlobalLayout>
  );
};

export default Upload;
