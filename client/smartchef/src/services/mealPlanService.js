import axios from "axios";
import API_BASE from "../config/api";

const mealPlanService = {
  // Generate weekly meal plan
  generateMealPlan: async (token) => {
    try {
      const response = await axios.post(
        `${API_BASE}/mealplan/generate`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data?.error || "Failed to generate meal plan";
    }
  },

  // Get user's meal plan
  getUserMealPlan: async (token) => {
    try {
      const response = await axios.get(`${API_BASE}/mealplan/user`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data?.error || "Failed to fetch meal plan";
    }
  },

  // Update meal plan
  updateMealPlan: async (token, mealPlan) => {
    try {
      const response = await axios.put(
        `${API_BASE}/mealplan/update`,
        mealPlan,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data?.error || "Failed to update meal plan";
    }
  }
};

export default mealPlanService;
