import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Settings, LogOut } from "lucide-react";
import authService from "../services/authService";
import preferencesService from "../services/preferencesService";
import GlobalLayout from "../layouts/GlobalLayout";
import { useToast } from "../contexts/ToastContext";
import { useNavigate } from "react-router-dom";

function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [preferences, setPreferences] = useState(null);
  const [loading, setLoading] = useState(true);
  const { success, error: showError } = useToast();

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      const token = authService.getToken();
      
      const userRes = await authService.fetchCurrentUser();
      setUser(userRes);
      
      const prefRes = await preferencesService.getPreferences(token);
      setPreferences(prefRes.preferences || {});
    } catch (err) {
      console.error("Error:", err);
      showError("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    authService.logout();
    navigate("/auth");
    success("Logged out successfully!");
  };

  if (loading) {
    return (
      <GlobalLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-white/80">Loading your profile...</p>
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

  const chefEmojis = {
    "gordon-ramsay": "👨‍🍳",
    "grandma": "👵",
    "health-coach": "💪",
    "michelin-star": "⭐",
    "budget-chef": "💰",
    "home-cook": "🏠"
  };

  const dietEmojis = {
    "omnivore": "🍖",
    "vegetarian": "🥗",
    "vegan": "🌱",
    "pescatarian": "🐟",
    "keto": "🥓",
    "paleo": "🍖",
    "gluten-free": "🌾"
  };

  return (
    <GlobalLayout>
      <motion.div
        className="space-y-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header with Settings Button */}
        <motion.div variants={itemVariants} className="flex items-center justify-between">
          <div>
            <h1 className="text-5xl font-bold text-white mb-2">
              👤 <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                Your Profile
              </span>
            </h1>
            <p className="text-white/80 font-medium">View your cooking profile and preferences</p>
          </div>
          <div className="flex gap-3">
            <motion.button
              onClick={() => navigate("/settings")}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-lg transition-all shadow-lg"
            >
              <Settings className="w-5 h-5" />
              Settings
            </motion.button>
          </div>
        </motion.div>

        {/* Basic Profile Card */}
        <motion.div
          variants={itemVariants}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {/* Name Card */}
          <motion.div
            className="backdrop-blur-xl bg-gradient-to-br from-purple-600/40 to-pink-600/40 border border-white/20 rounded-2xl p-8"
            whileHover={{ y: -4 }}
          >
            <div className="text-white/90 text-sm font-medium mb-2">Name</div>
            <div className="text-3xl font-bold text-white mb-4">{user?.name || "N/A"}</div>
            <div className="h-1 w-20 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full"></div>
          </motion.div>

          {/* Phone Card */}
          <motion.div
            className="backdrop-blur-xl bg-gradient-to-br from-blue-600/40 to-cyan-600/40 border border-white/20 rounded-2xl p-8"
            whileHover={{ y: -4 }}
          >
            <div className="text-white/90 text-sm font-medium mb-2">Phone</div>
            <div className="text-2xl font-bold text-white mb-4 break-all">{user?.phone || "N/A"}</div>
            <div className="h-1 w-20 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full"></div>
          </motion.div>

          {/* Email Card */}
          <motion.div
            className="backdrop-blur-xl bg-gradient-to-br from-green-600/40 to-emerald-600/40 border border-white/20 rounded-2xl p-8"
            whileHover={{ y: -4 }}
          >
            <div className="text-white/90 text-sm font-medium mb-2">Email</div>
            <div className="text-lg font-bold text-white mb-4 break-all">{user?.email || "Not set"}</div>
            <div className="h-1 w-20 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full"></div>
          </motion.div>
        </motion.div>

        {/* Chef Personality Section */}
        {preferences?.chefPersonality && (
          <motion.div variants={itemVariants}>
            <h2 className="text-2xl font-bold text-white mb-6">👨‍🍳 Your AI Chef</h2>
            <motion.div
              className="backdrop-blur-xl bg-gradient-to-br from-orange-600/30 to-red-600/30 border border-orange-500/50 rounded-3xl p-10 text-center"
              whileHover={{ scale: 1.02 }}
            >
              <div className="text-7xl mb-4">{chefEmojis[preferences.chefPersonality] || "👨‍🍳"}</div>
              <h3 className="text-3xl font-bold text-white mb-2 capitalize">
                {preferences.chefPersonality.replace("-", " ")}
              </h3>
              <p className="text-white/90 text-lg">This is your cooking style preference</p>
            </motion.div>
          </motion.div>
        )}

        {/* Dietary Preferences Grid */}
        {preferences && (
          <motion.div variants={itemVariants}>
            <h2 className="text-2xl font-bold text-white mb-6">🍽️ Dietary Profile</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Diet Type */}
              {preferences.dietType && (
                <motion.div
                  className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6 hover:bg-white/15 transition-all"
                  whileHover={{ y: -2 }}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-4xl">{dietEmojis[preferences.dietType] || "🍖"}</span>
                    <div className="text-white/90 text-sm font-medium">Diet Type</div>
                  </div>
                  <div className="text-xl font-bold text-white capitalize">
                    {preferences.dietType}
                  </div>
                </motion.div>
              )}

              {/* Cuisine */}
              {preferences.cuisinePreference && (
                <motion.div
                  className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6 hover:bg-white/15 transition-all"
                  whileHover={{ y: -2 }}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-4xl">🍜</span>
                    <div className="text-white/90 text-sm font-medium">Cuisine</div>
                  </div>
                  <div className="text-xl font-bold text-white capitalize">
                    {preferences.cuisinePreference}
                  </div>
                </motion.div>
              )}

              {/* Spice Level */}
              {preferences.spiceLevel && (
                <motion.div
                  className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6 hover:bg-white/15 transition-all"
                  whileHover={{ y: -2 }}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-4xl">🌶️</span>
                    <div className="text-white/90 text-sm font-medium">Spice Level</div>
                  </div>
                  <div className="text-xl font-bold text-white capitalize">
                    {preferences.spiceLevel}
                  </div>
                </motion.div>
              )}

              {/* Cooking Skill */}
              {preferences.cookingSkillLevel && (
                <motion.div
                  className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6 hover:bg-white/15 transition-all"
                  whileHover={{ y: -2 }}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-4xl">📚</span>
                    <div className="text-white/90 text-sm font-medium">Skill Level</div>
                  </div>
                  <div className="text-xl font-bold text-white capitalize">
                    {preferences.cookingSkillLevel}
                  </div>
                </motion.div>
              )}

              {/* Budget */}
              {preferences.budgetPerMeal && (
                <motion.div
                  className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6 hover:bg-white/15 transition-all"
                  whileHover={{ y: -2 }}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-4xl">💰</span>
                    <div className="text-white/90 text-sm font-medium">Budget</div>
                  </div>
                  <div className="text-xl font-bold text-white capitalize">
                    {preferences.budgetPerMeal} per meal
                  </div>
                </motion.div>
              )}

              {/* Cooking Time */}
              {preferences.availableCookingTime && (
                <motion.div
                  className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6 hover:bg-white/15 transition-all"
                  whileHover={{ y: -2 }}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-4xl">⏱️</span>
                    <div className="text-white/90 text-sm font-medium">Cooking Time</div>
                  </div>
                  <div className="text-xl font-bold text-white">
                    {preferences.availableCookingTime} mins
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}

        {/* Allergies Section */}
        {preferences?.allergies && preferences.allergies.length > 0 && (
          <motion.div variants={itemVariants}>
            <h2 className="text-2xl font-bold text-white mb-6">⚠️ Allergies & Restrictions</h2>
            <motion.div className="backdrop-blur-xl bg-red-500/20 border border-red-500/50 rounded-2xl p-8">
              <div className="flex flex-wrap gap-3">
                {preferences.allergies.map((allergy, idx) => (
                  <motion.span
                    key={idx}
                    className="px-6 py-3 bg-red-600/40 border border-red-500/60 rounded-full text-white font-semibold text-lg"
                    whileHover={{ scale: 1.05 }}
                  >
                    🚫 {allergy}
                  </motion.span>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Advanced Stats */}
        {preferences && (
          <motion.div variants={itemVariants}>
            <h2 className="text-2xl font-bold text-white mb-6">⚡ Advanced Profile</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Calorie Target */}
              {preferences.calorieTarget && (
                <motion.div
                  className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-8"
                  whileHover={{ y: -2 }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-white/90 font-semibold">Daily Calorie Goal</div>
                    <span className="text-3xl">🔥</span>
                  </div>
                  <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-400">
                    {preferences.calorieTarget}
                  </div>
                  <div className="text-white/70 text-sm mt-2 font-medium">calories per day</div>
                </motion.div>
              )}

              {/* Cooking Methods */}
              {preferences.preferredCookingMethods?.length > 0 && (
                <motion.div
                  className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-8"
                  whileHover={{ y: -2 }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-white/90 font-semibold">Preferred Methods</div>
                    <span className="text-3xl">🍳</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {preferences.preferredCookingMethods.map((method, idx) => (
                      <span key={idx} className="px-3 py-1 bg-white/20 rounded-full text-white/90 text-sm capitalize font-medium">
                        {method}
                      </span>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}

        {/* Account Actions */}
        <motion.div variants={itemVariants} className="flex gap-4">
          <motion.button
            onClick={handleLogout}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-8 py-3 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white font-semibold rounded-lg transition-all shadow-lg flex items-center gap-2"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </motion.button>
        </motion.div>
      </motion.div>
    </GlobalLayout>
  );
}

export default Profile;
