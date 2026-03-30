import axios from "axios";
import API_BASE from "../config/api";

const historyService = {
  // Save history (with JWT auth)
  saveHistory: (historyData) => {
    const token = localStorage.getItem("token");
    const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
    return axios.post(`${API_BASE}/history/save`, historyData, config);
  },

  // Get user history
  getUserHistory: () => {
    const token = localStorage.getItem("token");
    return axios.get(`${API_BASE}/history/user`, {
      headers: { Authorization: `Bearer ${token}` }
    });
  },

  // Get history (backward compatible)
  getHistory: (email) => {
    const token = localStorage.getItem("token");
    return axios.post(`${API_BASE}/history/get`, { email }, {
      headers: { Authorization: `Bearer ${token}` }
    });
  },

  // Get single history item
  getHistoryItem: (historyId) => {
    const token = localStorage.getItem("token");
    return axios.get(`${API_BASE}/history/${historyId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
  },

  // Delete history item
  deleteHistoryItem: (historyId) => {
    const token = localStorage.getItem("token");
    return axios.delete(`${API_BASE}/history/${historyId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }
};

const mealPlanService = {
  // Generate meal plan
  generateMealPlan: () => {
    const token = localStorage.getItem("token");
    return axios.post(
      `${API_BASE}/mealplan/generate`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );
  },

  // Get user meal plan
  getUserMealPlan: (weekStartDate) => {
    const token = localStorage.getItem("token");
    const query = weekStartDate ? `?weekStartDate=${weekStartDate}` : "";
    return axios.get(`${API_BASE}/mealplan/user${query}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
  },

  // Update meal plan
  updateMealPlan: (mealPlanId, day, meal, value) => {
    const token = localStorage.getItem("token");
    return axios.put(
      `${API_BASE}/mealplan/update`,
      { mealPlanId, day, meal, value },
      { headers: { Authorization: `Bearer ${token}` } }
    );
  }
};

export { historyService, mealPlanService };
export default historyService;
