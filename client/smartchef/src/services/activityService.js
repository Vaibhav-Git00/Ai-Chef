import axios from "axios";
import API_BASE from "../config/api";

const activityService = {
  // Record that user cooked a recipe
  recordCookedRecipe: async (token, dishData) => {
    return axios.post(`${API_BASE}/activity/record-cooked-recipe`, dishData, {
      headers: { Authorization: `Bearer ${token}` }
    });
  },

  // Record recipe generation
  recordRecipeGenerated: async (token, recipeName) => {
    return axios.post(
      `${API_BASE}/activity/record-recipe-generated`,
      { recipeName },
      { headers: { Authorization: `Bearer ${token}` } }
    );
  },

  // Get dashboard stats
  getDashboardStats: async (token) => {
    return axios.get(`${API_BASE}/activity/dashboard-stats`, {
      headers: { Authorization: `Bearer ${token}` }
    });
  },

  // Update daily streak
  updateDailyStreak: async (token) => {
    return axios.post(
      `${API_BASE}/activity/update-daily-streak`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );
  },

  // Add skill points
  addSkillPoints: async (token, points, action) => {
    return axios.post(
      `${API_BASE}/activity/add-skill-points`,
      { points, action },
      { headers: { Authorization: `Bearer ${token}` } }
    );
  }
};

export default activityService;
