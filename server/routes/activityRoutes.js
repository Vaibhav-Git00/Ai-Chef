const express = require("express");
const { verifyToken } = require("../middlewares/auth");
const activityService = require("../services/activityService");
const User = require("../models/User");

const router = express.Router();

// Record that user cooked a recipe
router.post("/record-cooked-recipe", verifyToken, async (req, res) => {
  try {
    const userId = req.userId;
    const { dishName, cookTime, satisfaction, notes, estimatedTimeSaved } = req.body;

    if (!dishName) {
      return res.status(400).json({ error: "Dish name is required" });
    }

    const user = await activityService.recordCookedRecipe(userId, {
      dishName,
      cookTime: cookTime || 30, // default 30 minutes
      satisfaction: satisfaction || 5,
      notes: notes || "",
      estimatedTimeSaved: estimatedTimeSaved || 45 // default 45 mins saved
    });

    res.json({
      message: "Recipe recorded successfully!",
      user,
      stats: await activityService.getUserDashboardStats(userId)
    });
  } catch (error) {
    console.error("Error recording recipe:", error);
    res.status(500).json({ error: "Failed to record recipe" });
  }
});

// Record recipe generation
router.post("/record-recipe-generated", verifyToken, async (req, res) => {
  try {
    const userId = req.userId;
    const { recipeName } = req.body;

    if (!recipeName) {
      return res.status(400).json({ error: "Recipe name is required" });
    }

    const user = await activityService.recordRecipeGenerated(userId, recipeName);

    res.json({
      message: "Recipe generation recorded!",
      user,
      stats: await activityService.getUserDashboardStats(userId)
    });
  } catch (error) {
    console.error("Error recording recipe generation:", error);
    res.status(500).json({ error: "Failed to record recipe generation" });
  }
});

// Get dashboard stats
router.get("/dashboard-stats", verifyToken, async (req, res) => {
  try {
    const userId = req.userId;
    const stats = await activityService.getUserDashboardStats(userId);

    if (!stats) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ stats });
  } catch (error) {
    console.error("Error getting stats:", error);
    res.status(500).json({ error: "Failed to get dashboard stats" });
  }
});

// Update daily streak manually
router.post("/update-daily-streak", verifyToken, async (req, res) => {
  try {
    const userId = req.userId;
    const user = await activityService.updateDailyStreak(userId);

    res.json({
      message: "Daily streak updated!",
      user,
      stats: await activityService.getUserDashboardStats(userId)
    });
  } catch (error) {
    console.error("Error updating streak:", error);
    res.status(500).json({ error: "Failed to update streak" });
  }
});

// Add skill points
router.post("/add-skill-points", verifyToken, async (req, res) => {
  try {
    const userId = req.userId;
    const { points, action } = req.body;

    if (!points || points < 0) {
      return res.status(400).json({ error: "Valid points value required" });
    }

    const user = await activityService.addSkillPoints(userId, points, action);

    res.json({
      message: "Skill points added!",
      user,
      stats: await activityService.getUserDashboardStats(userId)
    });
  } catch (error) {
    console.error("Error adding skill points:", error);
    res.status(500).json({ error: "Failed to add skill points" });
  }
});

module.exports = router;
