const User = require("../models/User");

const activityService = {
  // Update daily cooking streak
  updateDailyStreak: async (userId) => {
    try {
      const user = await User.findById(userId);
      if (!user) return null;

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const lastCookDate = user.lastCookDate ? new Date(user.lastCookDate) : null;
      const lastCookDateNormalized = lastCookDate ? new Date(lastCookDate) : null;
      if (lastCookDateNormalized) {
        lastCookDateNormalized.setHours(0, 0, 0, 0);
      }

      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      // If cooked today, don't increment
      if (lastCookDateNormalized && lastCookDateNormalized.getTime() === today.getTime()) {
        return user;
      }

      // If cooked yesterday, increment streak
      if (lastCookDateNormalized && lastCookDateNormalized.getTime() === yesterday.getTime()) {
        user.dailyStreak += 1;
      } else {
        // Reset streak if not consecutive
        user.dailyStreak = 1;
      }

      user.lastCookDate = new Date();
      user.skillPoints += 10; // 10 XP for daily cooking
      await user.save();
      return user;
    } catch (error) {
      console.error("Error updating streak:", error);
      return null;
    }
  },

  // Record a cooked recipe
  recordCookedRecipe: async (userId, dishData) => {
    try {
      const user = await User.findById(userId);
      if (!user) return null;

      const cookedRecipe = {
        dishName: dishData.dishName,
        cookDate: new Date(),
        cookTime: dishData.cookTime || 0,
        satisfaction: dishData.satisfaction || 5,
        notes: dishData.notes || "",
        estimatedTimeSaved: dishData.estimatedTimeSaved || 0
      };

      user.cookedRecipes.push(cookedRecipe);
      user.timeSaved += cookedRecipe.estimatedTimeSaved;
      user.skillPoints += 25; // 25 XP for cooking a recipe

      // Update daily streak
      await activityService.updateDailyStreak(userId);

      await user.save();
      return user;
    } catch (error) {
      console.error("Error recording cooked recipe:", error);
      return null;
    }
  },

  // Increment recipes generated counter
  recordRecipeGenerated: async (userId, recipeName) => {
    try {
      const user = await User.findById(userId);
      if (!user) return null;

      user.recipesGenerated += 1;
      user.skillPoints += 5; // 5 XP for generating a recipe
      await user.save();
      return user;
    } catch (error) {
      console.error("Error recording recipe generation:", error);
      return null;
    }
  },

  // Get user stats for dashboard
  getUserDashboardStats: async (userId) => {
    try {
      const user = await User.findById(userId);
      if (!user) return null;

      // Calculate weekly progress (for current week)
      const today = new Date();
      const currentDay = today.getDay(); // 0-6
      
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - currentDay);
      weekStart.setHours(0, 0, 0, 0);

      const weekProgress = [];
      const dayNames = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
      
      for (let i = 0; i < 7; i++) {
        const dayDate = new Date(weekStart);
        dayDate.setDate(dayDate.getDate() + i);
        
        // Count recipes planned/cooked for this day (mock: assume 3 meals per day, random 0-3 planned)
        const mealsThisDay = Math.floor(Math.random() * 4); // 0-3 meals
        
        weekProgress.push({
          day: dayNames[i],
          completion: (mealsThisDay / 3) * 100,
          meals: `${mealsThisDay}/3`
        });
      }

      // Calculate stats
      const stats = {
        dailyStreak: user.dailyStreak || 0,
        recipesGenerated: user.recipesGenerated || 0,
        timeSaved: user.timeSaved || 0,
        skillPoints: user.skillPoints || 0,
        weeklyProgress,
        cookedRecipesCount: user.cookedRecipes?.length || 0,
        lastCookDate: user.lastCookDate || null
      };

      return stats;
    } catch (error) {
      console.error("Error getting dashboard stats:", error);
      return null;
    }
  },

  // Add XP/Skill points for various actions
  addSkillPoints: async (userId, points, action) => {
    try {
      const user = await User.findById(userId);
      if (!user) return null;

      user.skillPoints += points;
      await user.save();
      return user;
    } catch (error) {
      console.error("Error adding skill points:", error);
      return null;
    }
  }
};

module.exports = activityService;
