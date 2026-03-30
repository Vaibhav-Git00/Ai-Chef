import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Flame, TrendingUp, Clock, Award, ChefHat, Zap } from "lucide-react";
import authService from "../services/authService";
import activityService from "../services/activityService";
import GlobalLayout from "../layouts/GlobalLayout";
import { useToast } from "../contexts/ToastContext";

export default function Dashboard() {
  const navigate = useNavigate();
  const { success, error: showError } = useToast();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentRecipeIndex, setCurrentRecipeIndex] = useState(0);
  const [preferences, setPreferences] = useState(null);
  const [dashStats, setDashStats] = useState(null);
  const [showMarkAsMadeModal, setShowMarkAsMadeModal] = useState(false);
  const [madeRecipeData, setMadeRecipeData] = useState({
    dishName: "",
    cookTime: 30,
    satisfaction: 5,
    notes: "",
    estimatedTimeSaved: 45
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const userData = authService.getCurrentUser();
        if (!userData) {
          navigate("/");
          return;
        }
        setUser(userData);
        
        // Fetch preferences
        try {
          const token = authService.getToken();
          const response = await fetch(
            `${import.meta.env.VITE_API_BASE_URL}/auth/preferences`,
            {
              headers: { Authorization: `Bearer ${token}` }
            }
          );
          if (response.ok) {
            const data = await response.json();
            setPreferences(data.preferences || {});
          }
        } catch (err) {
          console.log("Could not fetch preferences");
        }

        // Fetch dashboard stats
        try {
          const token = authService.getToken();
          const statsRes = await activityService.getDashboardStats(token);
          setDashStats(statsRes.data.stats);
        } catch (err) {
          console.log("Could not fetch dashboard stats:", err);
          // Set default stats
          setDashStats({
            dailyStreak: 0,
            recipesGenerated: 0,
            timeSaved: 0,
            skillPoints: 0,
            weeklyProgress: [
              { day: "Monday", completion: 0, meals: "0/3" },
              { day: "Tuesday", completion: 0, meals: "0/3" },
              { day: "Wednesday", completion: 0, meals: "0/3" },
              { day: "Thursday", completion: 0, meals: "0/3" },
              { day: "Friday", completion: 0, meals: "0/3" },
              { day: "Saturday", completion: 0, meals: "0/3" },
              { day: "Sunday", completion: 0, meals: "0/3" }
            ]
          });
        }
      } catch (err) {
        console.error("Error:", err);
        navigate("/");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  const handleMarkAsMade = async () => {
    try {
      if (!madeRecipeData.dishName.trim()) {
        showError("Please enter a dish name");
        return;
      }

      setSubmitting(true);
      const token = authService.getToken();
      const response = await activityService.recordCookedRecipe(token, madeRecipeData);

      success("🎉 Recipe recorded! You earned skill points!");
      
      // Update dashboard stats
      setDashStats(response.data.stats);
      
      // Reset modal
      setShowMarkAsMadeModal(false);
      setMadeRecipeData({
        dishName: "",
        cookTime: 30,
        satisfaction: 5,
        notes: "",
        estimatedTimeSaved: 45
      });
    } catch (err) {
      console.error("Error recording recipe:", err);
      showError(err.response?.data?.error || "Failed to record recipe");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white/60">Loading...</p>
        </div>
      </div>
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

  const actionCards = [
    {
      icon: "📸",
      title: "Upload Photo",
      description: "Detect dishes from photos",
      action: () => navigate("/upload"),
      gradient: "from-blue-500 to-cyan-500",
    },
    {
      icon: "👨‍🍳",
      title: "Recipes",
      description: "Get cooking instructions",
      action: () => navigate("/recipes"),
      gradient: "from-purple-500 to-pink-500",
    },
    {
      icon: "📅",
      title: "Meal Planner",
      description: "Plan your week",
      action: () => navigate("/meal-planner"),
      gradient: "from-orange-500 to-red-500",
    },
    {
      icon: "📊",
      title: "Nutrition",
      description: "Track health details",
      action: () => navigate("/nutrition"),
      gradient: "from-green-500 to-emerald-500",
    },
  ];

  const chefPersonalities = {
    "gordon-ramsay": { emoji: "👨‍🍳", name: "Gordon Ramsay", style: "Precision & Excellence" },
    "grandma": { emoji: "👵", name: "Grandma", style: "Comfort & Love" },
    "health-coach": { emoji: "💪", name: "Health Coach", style: "Nutrition & Wellness" },
    "michelin-star": { emoji: "⭐", name: "Michelin Star", style: "Gourmet & Artistic" },
    "budget-chef": { emoji: "💰", name: "Budget Chef", style: "Smart & Economical" },
    "home-cook": { emoji: "🏠", name: "Home Cook", style: "Simple & Easy" },
  };

  const currentChef = chefPersonalities[preferences?.chefPersonality] || chefPersonalities["home-cook"];

  const stats = [
    {
      icon: Zap,
      label: "Daily Streak",
      value: `${dashStats?.dailyStreak || 0} days`,
      subtitle: "Keep it going!",
      gradient: "from-yellow-500 to-orange-500",
      color: "yellow"
    },
    {
      icon: TrendingUp,
      label: "Recipes Generated",
      value: `${dashStats?.recipesGenerated || 0}`,
      subtitle: "This month",
      gradient: "from-green-500 to-emerald-500",
      color: "green"
    },
    {
      icon: Clock,
      label: "Time Saved",
      value: `${dashStats?.timeSaved || 0}m`,
      subtitle: "Planning meals",
      gradient: "from-blue-500 to-cyan-500",
      color: "blue"
    },
    {
      icon: Award,
      label: "Skill Points",
      value: `${dashStats?.skillPoints || 0} XP`,
      subtitle: "Chef rank: Pro",
      gradient: "from-purple-500 to-pink-500",
      color: "purple"
    }
  ];

  const featuredRecipes = [
    {
      id: 1,
      name: "Grilled Salmon Delight",
      rating: "4.8",
      time: "30 mins",
      emoji: "🐟",
      badge: "Trending"
    },
    {
      id: 2,
      name: "Spicy Thai Curry",
      rating: "4.9",
      time: "40 mins",
      emoji: "🌶️",
      badge: "Top Rated"
    },
    {
      id: 3,
      name: "Creamy Mushroom Pasta",
      rating: "4.7",
      time: "25 mins",
      emoji: "🍝",
      badge: "Popular"
    },
  ];

  const nextRecipe = () => {
    setCurrentRecipeIndex((prev) => (prev + 1) % featuredRecipes.length);
  };

  const prevRecipe = () => {
    setCurrentRecipeIndex((prev) => (prev - 1 + featuredRecipes.length) % featuredRecipes.length);
  };

  return (
    <GlobalLayout>
      <motion.div
        className="space-y-12"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Greeting Section */}
        <motion.div variants={itemVariants}>
          <h1 className="text-5xl font-bold text-white mb-2">
            Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">{user?.name?.split(" ")[0]}</span>! 👋
          </h1>
          <p className="text-white/80 text-lg font-medium">
            Ready to explore amazing recipes? Let's get cooking!
          </p>
        </motion.div>

        {/* Action Cards Grid */}
        <motion.div
          variants={itemVariants}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {actionCards.map((card, i) => (
            <motion.button
              key={i}
              onClick={card.action}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.95 }}
              className={`backdrop-blur-xl bg-gradient-to-br ${card.gradient} bg-opacity-10 border border-white/20 rounded-2xl p-6 text-center hover:border-white/40 hover:shadow-2xl transition-all group cursor-pointer`}
            >
              <motion.div
                className="text-5xl mb-4 group-hover:scale-110 transition-transform"
                whileHover={{ rotate: 10 }}
              >
                {card.icon}
              </motion.div>
              <h3 className="text-xl font-bold text-white mb-2 group-hover:text-purple-300 transition-colors">
                {card.title}
              </h3>
              <p className="text-white/80 group-hover:text-white/90 transition-colors">
                {card.description}
              </p>
            </motion.button>
          ))}
        </motion.div>

        {/* Chef Personality Card */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <motion.div
            className="lg:col-span-1 backdrop-blur-xl bg-gradient-to-br from-purple-600/40 to-pink-600/40 border border-purple-500/50 rounded-3xl p-8 text-center"
            whileHover={{ scale: 1.02 }}
          >
            <div className="text-7xl mb-4">{currentChef.emoji}</div>
            <h2 className="text-2xl font-bold text-white mb-1">{currentChef.name}</h2>
            <p className="text-purple-200 font-medium mb-6">{currentChef.style}</p>
            <div className="bg-white/10 rounded-lg p-3">
              <p className="text-white/70 text-sm">Your AI Chef Personality</p>
            </div>
          </motion.div>

          {/* Quick Stats */}
          <motion.div className="lg:col-span-2 grid grid-cols-2 gap-4">
            {stats.map((stat, i) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={i}
                  className={`backdrop-blur-xl bg-gradient-to-br ${stat.gradient} bg-opacity-10 border border-white/20 rounded-2xl p-6 hover:border-white/40 transition-all`}
                  whileHover={{ y: -5 }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <Icon className="w-6 h-6 text-white/80" />
                    <div className={`w-10 h-10 bg-gradient-to-br ${stat.gradient} rounded-lg flex items-center justify-center text-white font-bold`}>
                      ✨
                    </div>
                  </div>
                  <p className="text-white/70 text-sm font-medium">{stat.label}</p>
                  <p className="text-2xl font-bold text-white mt-2">{stat.value}</p>
                  <p className="text-white/60 text-xs mt-1">{stat.subtitle}</p>
                </motion.div>
              );
            })}
          </motion.div>
        </motion.div>

        {/* Featured Recipe Carousel */}
        <motion.div variants={itemVariants}>
          <h2 className="text-3xl font-bold text-white mb-6">🌟 Featured Recipe of the Day</h2>
          <div className="relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentRecipeIndex}
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
                className="backdrop-blur-xl bg-gradient-to-r from-blue-600/30 to-purple-600/30 border border-white/20 rounded-3xl p-10"
              >
                <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-6">
                  <div className="flex items-center gap-4">
                    <span className="text-7xl">{featuredRecipes[currentRecipeIndex].emoji}</span>
                    <div>
                      <h3 className="text-3xl font-bold text-white">{featuredRecipes[currentRecipeIndex].name}</h3>
                      <div className="flex gap-4 mt-2">
                        <span className="flex items-center gap-1 text-white/80">
                          ⭐ {featuredRecipes[currentRecipeIndex].rating}
                        </span>
                        <span className="flex items-center gap-1 text-white/80">
                          ⏱️ {featuredRecipes[currentRecipeIndex].time}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gradient-to-r from-yellow-500 to-orange-500 px-4 py-2 rounded-full">
                    <p className="text-white font-bold text-sm">{featuredRecipes[currentRecipeIndex].badge}</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <motion.button
                    onClick={() => navigate("/recipes")}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold py-3 rounded-xl transition-all"
                  >
                    View Full Recipe →
                  </motion.button>
                  <motion.button
                    onClick={() => setShowMarkAsMadeModal(true)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex-1 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold py-3 rounded-xl transition-all"
                  >
                    ✅ Mark as Made
                  </motion.button>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Carousel Controls */}
            <div className="flex justify-between items-center mt-6">
              <motion.button
                onClick={prevRecipe}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="w-12 h-12 bg-white/10 hover:bg-white/20 border border-white/20 rounded-full flex items-center justify-center text-white transition-all"
              >
                ←
              </motion.button>
              <div className="flex gap-2">
                {featuredRecipes.map((_, i) => (
                  <motion.button
                    key={i}
                    onClick={() => setCurrentRecipeIndex(i)}
                    className={`w-3 h-3 rounded-full transition-all ${
                      i === currentRecipeIndex ? "bg-purple-500 w-8" : "bg-white/40 hover:bg-white/60"
                    }`}
                    whileHover={{ scale: 1.2 }}
                  />
                ))}
              </div>
              <motion.button
                onClick={nextRecipe}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="w-12 h-12 bg-white/10 hover:bg-white/20 border border-white/20 rounded-full flex items-center justify-center text-white transition-all"
              >
                →
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Meal Plan Progress */}
        <motion.div variants={itemVariants} className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <span>📅 This Week's Progress</span>
          </h2>
          <div className="space-y-4">
            {dashStats?.weeklyProgress?.map((item, i) => (
              <motion.div key={i} className="space-y-2">
                <div className="flex justify-between items-center">
                  <p className="text-white font-medium">{item.day}</p>
                  <span className="text-white/60 text-sm">{item.meals} meals planned</span>
                </div>
                <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden border border-white/20">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${item.completion}%` }}
                    transition={{ duration: 0.8, delay: i * 0.1 }}
                    className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Quick Tips */}
        <motion.div
          variants={itemVariants}
          className="backdrop-blur-xl bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-white/20 rounded-2xl p-8"
        >
          <h3 className="text-xl font-bold text-white mb-4">💡 Pro Tips</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-white/90">
            <div className="flex gap-3">
              <span>✨</span>
              <p>Upload a food photo to detect dishes instantly</p>
            </div>
            <div className="flex gap-3">
              <span>🎯</span>
              <p>Your {currentChef.name} style guides every recipe</p>
            </div>
            <div className="flex gap-3">
              <span>📅</span>
              <p>Create personalized meal plans for the whole week</p>
            </div>
            <div className="flex gap-3">
              <span>🥗</span>
              <p>Mark recipes as made to track your progress</p>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Mark as Made Modal */}
      <AnimatePresence>
        {showMarkAsMadeModal && (
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowMarkAsMadeModal(false)}
          >
            <motion.div
              className="backdrop-blur-xl bg-gradient-to-br from-slate-900 to-purple-900 border border-white/20 rounded-3xl p-8 max-w-md w-full"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-3xl font-bold text-white mb-6">✅ Mark Recipe as Made</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-white font-medium mb-2">Dish Name</label>
                  <input
                    type="text"
                    value={madeRecipeData.dishName}
                    onChange={(e) => setMadeRecipeData({ ...madeRecipeData, dishName: e.target.value })}
                    placeholder="E.g., Grilled Salmon"
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/40 focus:border-purple-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-white font-medium mb-2">Cooking Time (minutes)</label>
                  <input
                    type="number"
                    value={madeRecipeData.cookTime}
                    onChange={(e) => setMadeRecipeData({ ...madeRecipeData, cookTime: parseInt(e.target.value) })}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:border-purple-500 focus:outline-none"
                    min="5"
                    max="300"
                  />
                </div>

                <div>
                  <label className="block text-white font-medium mb-2">Satisfaction (1-5 stars)</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <motion.button
                        key={star}
                        onClick={() => setMadeRecipeData({ ...madeRecipeData, satisfaction: star })}
                        className={`text-3xl ${star <= madeRecipeData.satisfaction ? "opacity-100" : "opacity-30"}`}
                        whileHover={{ scale: 1.2 }}
                      >
                        ⭐
                      </motion.button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-white font-medium mb-2">Notes (optional)</label>
                  <textarea
                    value={madeRecipeData.notes}
                    onChange={(e) => setMadeRecipeData({ ...madeRecipeData, notes: e.target.value })}
                    placeholder="How did it taste? Any notes?"
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/40 focus:border-purple-500 focus:outline-none"
                    rows="3"
                  />
                </div>

                <div>
                  <label className="block text-white font-medium mb-2">Time Saved (minutes)</label>
                  <input
                    type="number"
                    value={madeRecipeData.estimatedTimeSaved}
                    onChange={(e) => setMadeRecipeData({ ...madeRecipeData, estimatedTimeSaved: parseInt(e.target.value) })}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:border-purple-500 focus:outline-none"
                    min="0"
                    max="300"
                  />
                </div>
              </div>

              <div className="flex gap-4 mt-8">
                <motion.button
                  onClick={() => setShowMarkAsMadeModal(false)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex-1 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold py-3 rounded-lg transition-all"
                >
                  Cancel
                </motion.button>
                <motion.button
                  onClick={handleMarkAsMade}
                  disabled={submitting}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 disabled:opacity-50 text-white font-semibold py-3 rounded-lg transition-all"
                >
                  {submitting ? "Saving..." : "Save Recipe ✓"}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </GlobalLayout>
  );
}
