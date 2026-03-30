import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import mealPlanService from "../services/mealPlanService";
import authService from "../services/authService";
import GlobalLayout from "../layouts/GlobalLayout";
import { useToast } from "../contexts/ToastContext";

function MealPlanner() {
  const [user, setUser] = useState(null);
  const [mealPlan, setMealPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const { success, error: showError } = useToast();
  const [editingDay, setEditingDay] = useState(null);

  useEffect(() => {
    initializePage();
  }, []);

  const initializePage = async () => {
    try {
      setLoading(true);
      const token = authService.getToken();
      const userRes = await authService.fetchCurrentUser();
      setUser(userRes);

      const mealRes = await mealPlanService.getUserMealPlan(token);
      if (mealRes?.mealPlan) {
        setMealPlan(mealRes.mealPlan);
      }
    } catch (err) {
      console.error(err);
      showError("Error loading meal plan");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateMealPlan = async () => {
    try {
      setLoading(true);
      const token = authService.getToken();

      const response = await mealPlanService.generateMealPlan(token);

      setMealPlan(response.mealPlan);
      success("Meal plan generated! 🎉");
    } catch (err) {
      console.error(err);
      showError(err || "Failed to generate meal plan");
    } finally {
      setLoading(false);
    }
  };

  if (loading && !mealPlan) {
    return (
      <GlobalLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-white/60">Loading meal planner...</p>
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
            📅 <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-400">Weekly Meal Planner</span>
          </h1>
          <p className="text-white/60">
            {mealPlan
              ? "Your personalized meal plan for the week"
              : "Create your personalized meal plan"}
          </p>
        </motion.div>

        {/* Error Message */}
        {error && (
          <motion.div
            variants={itemVariants}
            className="backdrop-blur-xl bg-red-500/20 border border-red-500/50 rounded-2xl p-6"
          >
            <p className="text-red-300 flex items-center gap-2">
              ⚠️ {error}
            </p>
          </motion.div>
        )}

        {/* No Meal Plan State */}
        {!mealPlan ? (
          <motion.div
            variants={itemVariants}
            className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-12 text-center"
          >
            <div className="text-6xl mb-4">🍽️</div>
            <h2 className="text-2xl font-bold text-white mb-3">
              No Meal Plan Yet
            </h2>
            <p className="text-white/60 mb-6 max-w-md mx-auto">
              Generate a personalized meal plan based on your preferences and
              dietary restrictions
            </p>
            <motion.button
              onClick={handleGenerateMealPlan}
              disabled={loading}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 disabled:from-gray-600 disabled:to-gray-700 text-white font-semibold px-8 py-4 rounded-lg transition-all disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <span className="inline-block animate-spin mr-2">⚙️</span>
                  Generating...
                </>
              ) : (
                "🎯 Generate Meal Plan"
              )}
            </motion.button>
          </motion.div>
        ) : (
          <>
            {/* Action Buttons */}
            <motion.div
              variants={itemVariants}
              className="flex gap-4 flex-wrap"
            >
              <motion.button
                onClick={handleGenerateMealPlan}
                disabled={loading}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 disabled:from-gray-600 disabled:to-gray-700 text-white font-semibold px-6 py-2 rounded-lg transition-all disabled:cursor-not-allowed"
              >
                🔄 Regenerate Plan
              </motion.button>
            </motion.div>

            {/* Meals Grid */}
            <motion.div
              variants={itemVariants}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
            >
              {Object.entries(mealPlan.meals).map(([day, meals], i) => (
                <MealDayCard
                  key={day}
                  day={day}
                  meals={meals}
                  index={i}
                />
              ))}
            </motion.div>
          </>
        )}
      </motion.div>
    </GlobalLayout>
  );
}

function MealDayCard({ day, meals, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ y: -5 }}
      className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6 hover:border-orange-500/50 transition-all"
    >
      <h3 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-400 mb-4">
        {day}
      </h3>
      <div className="space-y-3">
        <MealItem
          label="🥣 Breakfast"
          value={meals.breakfast}
        />
        <MealItem
          label="🍽️ Lunch"
          value={meals.lunch}
        />
        <MealItem label="🌙 Dinner" value={meals.dinner} />
      </div>
    </motion.div>
  );
}

function MealItem({ label, value }) {
  return (
    <motion.div
      className="p-3 bg-white/5 rounded-lg border border-white/10 hover:border-white/20 transition-all"
      whileHover={{ backgroundColor: "rgba(255, 255, 255, 0.08)" }}
    >
      <p className="text-white/60 text-sm font-medium">{label}</p>
      <p className="text-white font-medium">{value}</p>
    </motion.div>
  );
}

export default MealPlanner;
