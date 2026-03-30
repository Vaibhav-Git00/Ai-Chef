import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import authService from "../services/authService";
import preferencesService from "../services/preferencesService";
import GlobalLayout from "../layouts/GlobalLayout";
import { useToast } from "../contexts/ToastContext";

function Preferences() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("personality");
  const [preferences, setPreferences] = useState({
    // Dietary
    dietType: "",
    cuisinePreference: "",
    spiceLevel: "medium",
    allergies: "",
    
    // Chef Personality
    chefPersonality: "home-cook",
    
    // Cooking Preferences
    cookingSkillLevel: "intermediate",
    budgetPerMeal: "medium",
    availableCookingTime: "30-60",
    
    // Advanced
    favoriteIngredientsToInclude: [],
    calorieTarget: 2000,
    preferredCookingMethods: [],
    equipmentAvailable: []
  });
  const { success, error: showError } = useToast();

  useEffect(() => {
    fetchUserPreferences();
  }, []);

  const fetchUserPreferences = async () => {
    try {
      setLoading(true);
      const token = authService.getToken();
      
      const userRes = await authService.fetchCurrentUser();
      setUser(userRes);
      
      const prefRes = await preferencesService.getPreferences(token);
      const prefs = prefRes.preferences || {};
      
      setPreferences({
        dietType: prefs.dietType || "",
        cuisinePreference: prefs.cuisinePreference || "",
        spiceLevel: prefs.spiceLevel || "medium",
        allergies: Array.isArray(prefs.allergies) ? prefs.allergies.join(", ") : "",
        chefPersonality: prefs.chefPersonality || "home-cook",
        cookingSkillLevel: prefs.cookingSkillLevel || "intermediate",
        budgetPerMeal: prefs.budgetPerMeal || "medium",
        availableCookingTime: prefs.availableCookingTime || "30-60",
        favoriteIngredientsToInclude: prefs.favoriteIngredientsToInclude || [],
        calorieTarget: prefs.calorieTarget || 2000,
        preferredCookingMethods: prefs.preferredCookingMethods || [],
        equipmentAvailable: prefs.equipmentAvailable || []
      });
    } catch (err) {
      console.error("Error:", err);
      showError("Failed to load preferences");
    } finally {
      setLoading(false);
    }
  };

  const handleSavePreferences = async () => {
    try {
      if (!preferences.chefPersonality) {
        showError("Please select a chef personality");
        return;
      }

      setSaving(true);
      const token = authService.getToken();
      
      const allergiesArray = preferences.allergies
        ? preferences.allergies.split(",").map((a) => a.trim()).filter(Boolean)
        : [];

      const prefsData = {
        dietType: preferences.dietType,
        cuisinePreference: preferences.cuisinePreference,
        spiceLevel: preferences.spiceLevel,
        allergies: allergiesArray,
        chefPersonality: preferences.chefPersonality,
        cookingSkillLevel: preferences.cookingSkillLevel,
        budgetPerMeal: preferences.budgetPerMeal,
        availableCookingTime: preferences.availableCookingTime,
        favoriteIngredientsToInclude: preferences.favoriteIngredientsToInclude,
        calorieTarget: preferences.calorieTarget,
        preferredCookingMethods: preferences.preferredCookingMethods,
        equipmentAvailable: preferences.equipmentAvailable
      };

      await preferencesService.updatePreferences(token, prefsData);
      success("Chef Profile saved! Your AI chef is ready! 🍳");
      
      setPreferences(prev => ({
        ...prev,
        allergies: Array.isArray(prefsData.allergies) ? prefsData.allergies.join(", ") : ""
      }));
    } catch (err) {
      console.error(err);
      showError(err || "Error saving preferences");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <GlobalLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-white/60">Loading your preferences...</p>
          </div>
        </div>
      </GlobalLayout>
    );
  }

  const chefPersonalities = [
    {
      id: "gordon-ramsay",
      name: "Gordon Ramsay",
      emoji: "👨‍🍳",
      description: "Bold, precise, no-nonsense cooking",
      style: "Precise techniques, quality ingredients, restaurant-quality results."
    },
    {
      id: "grandma",
      name: "Grandma's Kitchen",
      emoji: "👵",
      description: "Comfort food, simple & hearty",
      style: "Warm, cozy comfort food with simple ingredients."
    },
    {
      id: "health-coach",
      name: "Health Coach",
      emoji: "💪",
      description: "Nutritious, balanced, lean recipes",
      style: "Nutritious, balanced, designed for your fitness goals."
    },
    {
      id: "michelin-star",
      name: "Michelin Star",
      emoji: "⭐",
      description: "Gourmet, complex, restaurant-style",
      style: "Sophisticated flavors, artistic presentation, culinary innovation."
    },
    {
      id: "budget-chef",
      name: "Budget Chef",
      emoji: "💰",
      description: "Economical, maximum flavor",
      style: "Delicious recipes using affordable ingredients."
    },
    {
      id: "home-cook",
      name: "Home Cook",
      emoji: "🏠",
      description: "Easy, everyday recipes",
      style: "Simple, tasty recipes for busy people."
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.05 },
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
            👨‍🍳 <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
              Your AI Chef Profile
            </span>
          </h1>
          <p className="text-white/60 text-lg">
            Customize your cooking experience and let our AI chef match your style
          </p>
        </motion.div>

        {/* Tab Navigation */}
        <motion.div variants={itemVariants} className="flex gap-2 flex-wrap">
          {[
            { id: "personality", label: "👨‍🍳 Chef Personality", emoji: "🎭" },
            { id: "dietary", label: "🥗 Dietary", emoji: "🍽️" },
            { id: "cooking", label: "⏱️ Cooking", emoji: "🔥" },
            { id: "advanced", label: "⚡ Advanced", emoji: "🎯" }
          ].map((tab) => (
            <motion.button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                activeTab === tab.id
                  ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg"
                  : "bg-white/10 text-white/70 hover:bg-white/20 border border-white/20"
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {tab.emoji} {tab.label}
            </motion.button>
          ))}
        </motion.div>

        {/* Chef Personality Tab */}
        {activeTab === "personality" && (
          <motion.div variants={itemVariants} className="space-y-6">
            <h2 className="text-2xl font-bold text-white mb-6">Choose Your Chef's Personality</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {chefPersonalities.map((chef) => (
                <motion.div
                  key={chef.id}
                  onClick={() => setPreferences({ ...preferences, chefPersonality: chef.id })}
                  className={`p-6 rounded-2xl border-2 cursor-pointer transition-all ${
                    preferences.chefPersonality === chef.id
                      ? "border-purple-400 bg-gradient-to-br from-purple-600/40 to-pink-600/40 shadow-lg shadow-purple-500/20"
                      : "border-white/20 bg-white/10 hover:bg-white/15 hover:border-white/40"
                  }`}
                  whileHover={{ y: -4 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="text-5xl mb-3">{chef.emoji}</div>
                  <h3 className="text-xl font-bold text-white mb-2">{chef.name}</h3>
                  <p className="text-white/70 text-sm mb-3">{chef.description}</p>
                  <p className="text-white/60 text-xs italic">"{ chef.style}"</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Dietary Tab */}
        {activeTab === "dietary" && (
          <motion.div
            variants={itemVariants}
            className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-8 space-y-6"
          >
            {/* Diet Type */}
            <motion.div variants={itemVariants}>
              <label className="block text-lg font-bold text-white mb-3">🥗 Diet Type</label>
              <select
                value={preferences.dietType || ""}
                onChange={(e) => setPreferences({ ...preferences, dietType: e.target.value })}
                className="w-full p-4 rounded-lg bg-white/10 text-white border border-white/20 focus:border-purple-500 focus:outline-none transition-all"
              >
                <option value="">Select diet type</option>
                <option value="omnivore">Omnivore (Everything)</option>
                <option value="vegetarian">Vegetarian</option>
                <option value="vegan">Vegan</option>
                <option value="pescatarian">Pescatarian (Fish OK)</option>
                <option value="keto">Keto</option>
                <option value="paleo">Paleo</option>
                <option value="gluten-free">Gluten-Free</option>
              </select>
            </motion.div>

            {/* Cuisine Preference */}
            <motion.div variants={itemVariants}>
              <label className="block text-lg font-bold text-white mb-3">🍜 Cuisine Preference</label>
              <select
                value={preferences.cuisinePreference || ""}
                onChange={(e) => setPreferences({ ...preferences, cuisinePreference: e.target.value })}
                className="w-full p-4 rounded-lg bg-white/10 text-white border border-white/20 focus:border-purple-500 focus:outline-none transition-all"
              >
                <option value="">No preference</option>
                <option value="indian">Indian</option>
                <option value="italian">Italian</option>
                <option value="chinese">Chinese</option>
                <option value="mexican">Mexican</option>
                <option value="thai">Thai</option>
                <option value="japanese">Japanese</option>
                <option value="american">American</option>
                <option value="mediterranean">Mediterranean</option>
                <option value="korean">Korean</option>
                <option value="fusion">Fusion</option>
              </select>
            </motion.div>

            {/* Spice Level */}
            <motion.div variants={itemVariants}>
              <label className="block text-lg font-bold text-white mb-4">🌶️ Spice Level</label>
              <div className="flex gap-4 flex-wrap">
                {["mild", "medium", "hot"].map((level) => (
                  <motion.label key={level} className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="spiceLevel"
                      value={level}
                      checked={preferences.spiceLevel === level}
                      onChange={(e) => setPreferences({ ...preferences, spiceLevel: e.target.value })}
                      className="w-4 h-4 accent-purple-500"
                    />
                    <span className="capitalize text-white font-medium">{level}</span>
                  </motion.label>
                ))}
              </div>
            </motion.div>

            {/* Allergies */}
            <motion.div variants={itemVariants}>
              <label className="block text-lg font-bold text-white mb-3">⚠️ Allergies & Restrictions</label>
              <textarea
                value={preferences.allergies || ""}
                onChange={(e) => setPreferences({ ...preferences, allergies: e.target.value })}
                placeholder="E.g., peanuts, shellfish, dairy, gluten"
                className="w-full p-4 rounded-lg bg-white/10 text-white border border-white/20 focus:border-purple-500 focus:outline-none transition-all"
                rows="3"
              />
            </motion.div>
          </motion.div>
        )}

        {/* Cooking Tab */}
        {activeTab === "cooking" && (
          <motion.div
            variants={itemVariants}
            className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-8 space-y-6"
          >
            {/* Skill Level */}
            <motion.div variants={itemVariants}>
              <label className="block text-lg font-bold text-white mb-3">📚 Cooking Skill Level</label>
              <div className="grid grid-cols-3 gap-3">
                {["beginner", "intermediate", "advanced"].map((level) => (
                  <motion.button
                    key={level}
                    onClick={() => setPreferences({ ...preferences, cookingSkillLevel: level })}
                    className={`p-4 rounded-lg font-semibold transition-all ${
                      preferences.cookingSkillLevel === level
                        ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white"
                        : "bg-white/10 text-white/70 border border-white/20 hover:bg-white/15"
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {level === "beginner" && "👶 Beginner"}
                    {level === "intermediate" && "👨‍🍳 Intermediate"}
                    {level === "advanced" && "🏆 Advanced"}
                  </motion.button>
                ))}
              </div>
            </motion.div>

            {/* Budget */}
            <motion.div variants={itemVariants}>
              <label className="block text-lg font-bold text-white mb-3">💰 Budget Per Meal</label>
              <div className="grid grid-cols-3 gap-3">
                {["budget", "medium", "premium"].map((budget) => (
                  <motion.button
                    key={budget}
                    onClick={() => setPreferences({ ...preferences, budgetPerMeal: budget })}
                    className={`p-4 rounded-lg font-semibold transition-all ${
                      preferences.budgetPerMeal === budget
                        ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white"
                        : "bg-white/10 text-white/70 border border-white/20 hover:bg-white/15"
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {budget === "budget" && "💸 Budget"}
                    {budget === "medium" && "💵 Medium"}
                    {budget === "premium" && "💎 Premium"}
                  </motion.button>
                ))}
              </div>
            </motion.div>

            {/* Cooking Time */}
            <motion.div variants={itemVariants}>
              <label className="block text-lg font-bold text-white mb-3">⏱️ Available Cooking Time</label>
              <select
                value={preferences.availableCookingTime}
                onChange={(e) => setPreferences({ ...preferences, availableCookingTime: e.target.value })}
                className="w-full p-4 rounded-lg bg-white/10 text-white border border-white/20 focus:border-purple-500 focus:outline-none transition-all"
              >
                <option value="15-30">Quick (15-30 mins)</option>
                <option value="30-60">Normal (30-60 mins)</option>
                <option value="60-120">Extended (1-2 hours)</option>
                <option value="120+">I love spending time! (2+ hours)</option>
              </select>
            </motion.div>
          </motion.div>
        )}

        {/* Advanced Tab */}
        {activeTab === "advanced" && (
          <motion.div
            variants={itemVariants}
            className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-8 space-y-6"
          >
            {/* Calorie Target */}
            <motion.div variants={itemVariants}>
              <label className="block text-lg font-bold text-white mb-3">🔥 Daily Calorie Target</label>
              <input
                type="number"
                value={preferences.calorieTarget}
                onChange={(e) => setPreferences({ ...preferences, calorieTarget: parseInt(e.target.value) })}
                className="w-full p-4 rounded-lg bg-white/10 text-white border border-white/20 focus:border-purple-500 focus:outline-none transition-all"
                min="1000"
                max="5000"
                step="100"
              />
              <p className="text-white/50 text-sm mt-2">We'll adjust recipe portions based on your goals</p>
            </motion.div>

            {/* Info Box */}
            <motion.div
              variants={itemVariants}
              className="backdrop-blur-xl bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-2xl p-6"
            >
              <p className="text-green-300 font-semibold mb-2">✅ Your AI Chef Profile is Ready!</p>
              <p className="text-green-200/80 text-sm">
                Your {preferences.chefPersonality?.replace('-', ' ').split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')} style will customize all recipe recommendations from now on.
              </p>
            </motion.div>
          </motion.div>
        )}

        {/* Save Button */}
        <motion.div variants={itemVariants} className="flex gap-4">
          <motion.button
            onClick={handleSavePreferences}
            disabled={saving}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-600 disabled:to-gray-700 text-white font-semibold py-4 rounded-lg transition-all disabled:cursor-not-allowed"
          >
            {saving ? (
              <>
                <span className="inline-block animate-spin mr-2">⚙️</span>
                Saving...
              </>
            ) : (
              "💾 Save Chef Profile"
            )}
          </motion.button>
        </motion.div>
      </motion.div>
    </GlobalLayout>
  );
}

export default Preferences;
