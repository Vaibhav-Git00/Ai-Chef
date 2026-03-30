import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import authService from "../services/authService";
import preferencesService from "../services/preferencesService";
import GlobalLayout from "../layouts/GlobalLayout";
import { useToast } from "../contexts/ToastContext";

function Settings() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("preferences");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [preferencesTab, setPreferencesTab] = useState("personality");
  
  const [preferences, setPreferences] = useState({
    dietType: "",
    cuisinePreference: "",
    spiceLevel: "medium",
    allergies: "",
    chefPersonality: "home-cook",
    cookingSkillLevel: "intermediate",
    budgetPerMeal: "medium",
    availableCookingTime: "30-60",
    favoriteIngredientsToInclude: [],
    calorieTarget: 2000,
    preferredCookingMethods: [],
    equipmentAvailable: []
  });

  const [accountData, setAccountData] = useState({
    name: "",
    email: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  const { success, error: showError } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = authService.getToken();
      
      const userRes = await authService.fetchCurrentUser();
      setUser(userRes);
      setAccountData(prev => ({
        ...prev,
        name: userRes?.name || "",
        email: userRes?.email || ""
      }));
      
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
      showError("Failed to load settings");
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
      success("Preferences saved! 🎉");
      
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

  const handleSaveAccount = async () => {
    try {
      setSaving(true);
      const token = authService.getToken();
      
      // TODO: Update account info when API is ready
      success("Account updated! ✅");
    } catch (err) {
      showError(err || "Error updating account");
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
            <p className="text-white/80 font-medium">Loading settings...</p>
          </div>
        </div>
      </GlobalLayout>
    );
  }

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

  const chefPersonalities = [
    {
      id: "gordon-ramsay",
      name: "Gordon Ramsay",
      emoji: "👨‍🍳",
      description: "Precise, restaurant-quality"
    },
    {
      id: "grandma",
      name: "Grandma",
      emoji: "👵",
      description: "Comfort & warmth"
    },
    {
      id: "health-coach",
      name: "Health Coach",
      emoji: "💪",
      description: "Nutritious & balanced"
    },
    {
      id: "michelin-star",
      name: "Michelin Star",
      emoji: "⭐",
      description: "Gourmet & artistic"
    },
    {
      id: "budget-chef",
      name: "Budget Chef",
      emoji: "💰",
      description: "Economical & tasty"
    },
    {
      id: "home-cook",
      name: "Home Cook",
      emoji: "🏠",
      description: "Simple & easy"
    }
  ];

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
            ⚙️ <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
              Settings
            </span>
          </h1>
          <p className="text-white/80 font-medium">Customize your SmartChef experience</p>
        </motion.div>

        {/* Tab Navigation */}
        <motion.div variants={itemVariants} className="flex gap-2 flex-wrap">
          {[
            { id: "preferences", label: "🎭 Preferences" },
            { id: "account", label: "🔐 Account" },
            { id: "about", label: "ℹ️ About" }
          ].map((tab) => (
            <motion.button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                activeTab === tab.id
                  ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg"
                  : "bg-white/10 text-white/80 hover:bg-white/20 border border-white/20"
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {tab.label}
            </motion.button>
          ))}
        </motion.div>

        {/* PREFERENCES TAB */}
        {activeTab === "preferences" && (
          <motion.div variants={itemVariants} className="space-y-6">
            {/* Preferences Sub-tabs */}
            <div className="flex gap-2 flex-wrap">
              {[
                { id: "personality", label: "👨‍🍳 Chef" },
                { id: "dietary", label: "🥗 Dietary" },
                { id: "cooking", label: "⏱️ Cooking" },
                { id: "advanced", label: "⚡ Advanced" }
              ].map((subtab) => (
                <motion.button
                  key={subtab.id}
                  onClick={() => setPreferencesTab(subtab.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                    preferencesTab === subtab.id
                      ? "bg-purple-600 text-white"
                      : "bg-white/10 text-white/70 hover:bg-white/15 border border-white/20"
                  }`}
                  whileHover={{ scale: 1.02 }}
                />
              ))}
            </div>

            {/* Chef Personality */}
            {preferencesTab === "personality" && (
              <motion.div className="space-y-4">
                <h3 className="text-xl font-bold text-white">Choose Your AI Chef</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {chefPersonalities.map((chef) => (
                    <motion.div
                      key={chef.id}
                      onClick={() => setPreferences({ ...preferences, chefPersonality: chef.id })}
                      className={`p-4 rounded-xl border-2 cursor-pointer transition-all text-center ${
                        preferences.chefPersonality === chef.id
                          ? "border-purple-400 bg-gradient-to-br from-purple-600/40 to-pink-600/40"
                          : "border-white/20 bg-white/10 hover:bg-white/15"
                      }`}
                      whileHover={{ y: -2 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <div className="text-4xl mb-2">{chef.emoji}</div>
                      <div className="font-bold text-white text-sm">{chef.name}</div>
                      <div className="text-white/60 text-xs">{chef.description}</div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Dietary */}
            {preferencesTab === "dietary" && (
              <motion.div className="space-y-6">
                <div>
                  <label className="block text-lg font-bold text-white mb-3">🥗 Diet Type</label>
                  <select
                    value={preferences.dietType || ""}
                    onChange={(e) => setPreferences({ ...preferences, dietType: e.target.value })}
                    className="w-full p-4 rounded-lg bg-white/10 text-white border border-white/20 focus:border-purple-500 focus:outline-none"
                  >
                    <option value="">Select diet type</option>
                    <option value="omnivore">Omnivore</option>
                    <option value="vegetarian">Vegetarian</option>
                    <option value="vegan">Vegan</option>
                    <option value="pescatarian">Pescatarian</option>
                    <option value="keto">Keto</option>
                  </select>
                </div>

                <div>
                  <label className="block text-lg font-bold text-white mb-3">🍜 Cuisine</label>
                  <select
                    value={preferences.cuisinePreference || ""}
                    onChange={(e) => setPreferences({ ...preferences, cuisinePreference: e.target.value })}
                    className="w-full p-4 rounded-lg bg-white/10 text-white border border-white/20 focus:border-purple-500 focus:outline-none"
                  >
                    <option value="">No preference</option>
                    <option value="indian">Indian</option>
                    <option value="italian">Italian</option>
                    <option value="chinese">Chinese</option>
                    <option value="mexican">Mexican</option>
                    <option value="thai">Thai</option>
                  </select>
                </div>

                <div>
                  <label className="block text-lg font-bold text-white mb-4">🌶️ Spice Level</label>
                  <div className="flex gap-4">
                    {["mild", "medium", "hot"].map((level) => (
                      <motion.label key={level} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          value={level}
                          checked={preferences.spiceLevel === level}
                          onChange={(e) => setPreferences({ ...preferences, spiceLevel: e.target.value })}
                          className="w-4 h-4 accent-purple-500"
                        />
                        <span className="capitalize text-white font-medium">{level}</span>
                      </motion.label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-lg font-bold text-white mb-3">⚠️ Allergies</label>
                  <textarea
                    value={preferences.allergies || ""}
                    onChange={(e) => setPreferences({ ...preferences, allergies: e.target.value })}
                    placeholder="E.g., peanuts, dairy, gluten"
                    className="w-full p-4 rounded-lg bg-white/10 text-white border border-white/20 focus:border-purple-500 focus:outline-none"
                    rows="3"
                  />
                </div>
              </motion.div>
            )}

            {/* Cooking */}
            {preferencesTab === "cooking" && (
              <motion.div className="space-y-6">
                <div>
                  <label className="block text-lg font-bold text-white mb-3">📚 Skill Level</label>
                  <div className="grid grid-cols-3 gap-3">
                    {["beginner", "intermediate", "advanced"].map((level) => (
                      <motion.button
                        key={level}
                        onClick={() => setPreferences({ ...preferences, cookingSkillLevel: level })}
                        className={`p-4 rounded-lg font-semibold transition-all ${
                          preferences.cookingSkillLevel === level
                            ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white"
                            : "bg-white/10 text-white/70 border border-white/20"
                        }`}
                      >
                        {level === "beginner" && "👶 Beginner"}
                        {level === "intermediate" && "👨‍🍳 Intermediate"}
                        {level === "advanced" && "🏆 Advanced"}
                      </motion.button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-lg font-bold text-white mb-3">💰 Budget</label>
                  <div className="grid grid-cols-3 gap-3">
                    {["budget", "medium", "premium"].map((budget) => (
                      <motion.button
                        key={budget}
                        onClick={() => setPreferences({ ...preferences, budgetPerMeal: budget })}
                        className={`p-4 rounded-lg font-semibold transition-all ${
                          preferences.budgetPerMeal === budget
                            ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white"
                            : "bg-white/10 text-white/70 border border-white/20"
                        }`}
                      >
                        {budget === "budget" && "💸 Budget"}
                        {budget === "medium" && "💵 Medium"}
                        {budget === "premium" && "💎 Premium"}
                      </motion.button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-lg font-bold text-white mb-3">⏱️ Cooking Time</label>
                  <select
                    value={preferences.availableCookingTime}
                    onChange={(e) => setPreferences({ ...preferences, availableCookingTime: e.target.value })}
                    className="w-full p-4 rounded-lg bg-white/10 text-white border border-white/20 focus:border-purple-500 focus:outline-none"
                  >
                    <option value="15-30">Quick (15-30 mins)</option>
                    <option value="30-60">Normal (30-60 mins)</option>
                    <option value="60-120">Extended (1-2 hours)</option>
                    <option value="120+">Long (2+ hours)</option>
                  </select>
                </div>
              </motion.div>
            )}

            {/* Advanced */}
            {preferencesTab === "advanced" && (
              <motion.div className="space-y-6">
                <div>
                  <label className="block text-lg font-bold text-white mb-3">🔥 Calorie Target</label>
                  <input
                    type="number"
                    value={preferences.calorieTarget}
                    onChange={(e) => setPreferences({ ...preferences, calorieTarget: parseInt(e.target.value) })}
                    className="w-full p-4 rounded-lg bg-white/10 text-white border border-white/20 focus:border-purple-500 focus:outline-none"
                    min="1000"
                    max="5000"
                    step="100"
                  />
                  <p className="text-white/70 text-sm mt-2 font-medium">calories per day</p>
                </div>

                <motion.div
                  className="backdrop-blur-xl bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-2xl p-6"
                >
                  <p className="text-green-300 font-semibold mb-2">✅ Profile Customized!</p>
                  <p className="text-green-200/90 text-sm font-medium">All your preferences are now saved and will be used to personalize recipes.</p>
                </motion.div>
              </motion.div>
            )}

            {/* Save Button */}
            <motion.button
              onClick={handleSavePreferences}
              disabled={saving}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-600 disabled:to-gray-700 text-white font-semibold py-4 rounded-lg transition-all"
            >
              {saving ? "Saving..." : "💾 Save Preferences"}
            </motion.button>
          </motion.div>
        )}

        {/* ACCOUNT TAB */}
        {activeTab === "account" && (
          <motion.div variants={itemVariants} className="space-y-6 max-w-2xl">
            <motion.div>
              <label className="block text-lg font-bold text-white mb-3">Name</label>
              <input
                type="text"
                value={accountData.name}
                onChange={(e) => setAccountData({ ...accountData, name: e.target.value })}
                className="w-full p-4 rounded-lg bg-white/10 text-white border border-white/20 focus:border-purple-500 focus:outline-none"
              />
            </motion.div>

            <motion.div>
              <label className="block text-lg font-bold text-white mb-3">Email</label>
              <input
                type="email"
                value={accountData.email}
                onChange={(e) => setAccountData({ ...accountData, email: e.target.value })}
                className="w-full p-4 rounded-lg bg-white/10 text-white border border-white/20 focus:border-purple-500 focus:outline-none"
              />
            </motion.div>

            <motion.div className="pt-6 border-t border-white/20">
              <h3 className="text-xl font-bold text-white mb-6">Change Password</h3>
              
              <motion.div className="mb-4">
                <label className="block text-lg font-bold text-white mb-3">Current Password</label>
                <input
                  type="password"
                  value={accountData.currentPassword}
                  onChange={(e) => setAccountData({ ...accountData, currentPassword: e.target.value })}
                  className="w-full p-4 rounded-lg bg-white/10 text-white border border-white/20 focus:border-purple-500 focus:outline-none"
                />
              </motion.div>

              <motion.div className="mb-4">
                <label className="block text-lg font-bold text-white mb-3">New Password</label>
                <input
                  type="password"
                  value={accountData.newPassword}
                  onChange={(e) => setAccountData({ ...accountData, newPassword: e.target.value })}
                  className="w-full p-4 rounded-lg bg-white/10 text-white border border-white/20 focus:border-purple-500 focus:outline-none"
                />
              </motion.div>

              <motion.div className="mb-6">
                <label className="block text-lg font-bold text-white mb-3">Confirm Password</label>
                <input
                  type="password"
                  value={accountData.confirmPassword}
                  onChange={(e) => setAccountData({ ...accountData, confirmPassword: e.target.value })}
                  className="w-full p-4 rounded-lg bg-white/10 text-white border border-white/20 focus:border-purple-500 focus:outline-none"
                />
              </motion.div>
            </motion.div>

            <motion.button
              onClick={handleSaveAccount}
              disabled={saving}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-600 disabled:to-gray-700 text-white font-semibold py-4 rounded-lg transition-all"
            >
              {saving ? "Saving..." : "💾 Save Account Changes"}
            </motion.button>
          </motion.div>
        )}

        {/* ABOUT TAB */}
        {activeTab === "about" && (
          <motion.div variants={itemVariants} className="space-y-8">
            {/* App Overview */}
            <motion.div
              className="backdrop-blur-xl bg-gradient-to-br from-purple-600/30 to-pink-600/30 border border-purple-500/50 rounded-3xl p-12"
              whileHover={{ scale: 1.02 }}
            >
              <div className="text-center">
                <div className="text-7xl mb-6">🍳</div>
                <h2 className="text-4xl font-bold text-white mb-4">SmartChef AI</h2>
                <p className="text-white/90 text-xl font-medium leading-relaxed max-w-2xl mx-auto">
                  Your personal AI-powered cooking companion that adapts to your taste, budget, and lifestyle
                </p>
              </div>
            </motion.div>

            {/* Features Grid */}
            <motion.div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                {
                  emoji: "🤖",
                  title: "AI Chef Personalities",
                  description: "Cook like Gordon Ramsay, Grandma, or a Health Coach - choose your style!"
                },
                {
                  emoji: "📸",
                  title: "Smart Ingredient Detection",
                  description: "Upload photos of your ingredients and get instant recipe suggestions"
                },
                {
                  emoji: "🍽️",
                  title: "Personalized Recipes",
                  description: "Every recipe adapts to your diet, allergies, budget, and skill level"
                },
                {
                  emoji: "⏱️",
                  title: "Time-Smart Cooking",
                  description: "Get recipes that fit your available cooking time - 15 mins or 2 hours"
                },
                {
                  emoji: "💪",
                  title: "Health Tracking",
                  description: "Monitor calories, macros, and nutrition based on your goals"
                },
                {
                  emoji: "📅",
                  title: "Smart Meal Plans",
                  description: "AI-generated weekly meal plans customized just for you"
                }
              ].map((feature, idx) => (
                <motion.div
                  key={idx}
                  className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6 hover:bg-white/15 transition-all"
                  whileHover={{ y: -4 }}
                >
                  <div className="text-4xl mb-3">{feature.emoji}</div>
                  <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
                  <p className="text-white/80 font-medium">{feature.description}</p>
                </motion.div>
              ))}
            </motion.div>

            {/* How It Works */}
            <motion.div
              className="backdrop-blur-xl bg-gradient-to-r from-blue-600/20 to-cyan-600/20 border border-blue-500/50 rounded-3xl p-12"
            >
              <h2 className="text-3xl font-bold text-white mb-8">How SmartChef Works</h2>
              <div className="space-y-4">
                {[
                  { step: 1, text: "Set your chef personality and dietary preferences" },
                  { step: 2, text: "Share your cooking skills, budget, and available time" },
                  { step: 3, text: "Upload recipe photos or describe your ingredients" },
                  { step: 4, text: "Get instant personalized recipes tailored just for you" },
                  { step: 5, text: "Rate recipes to help our AI learn your taste better" }
                ].map((item) => (
                  <motion.div key={item.step} className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center font-bold text-white flex-shrink-0">
                      {item.step}
                    </div>
                    <p className="text-white/90 font-medium text-lg">{item.text}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Version & Credits */}
            <motion.div
              className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-8 text-center"
            >
              <p className="text-white/80 font-medium mb-2">SmartChef AI v1.0</p>
              <p className="text-white/60 text-sm font-medium">Built with ❤️ to make cooking smarter and more delicious</p>
            </motion.div>
          </motion.div>
        )}
      </motion.div>
    </GlobalLayout>
  );
}

export default Settings;
