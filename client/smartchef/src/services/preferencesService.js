import axios from "axios";
import API_BASE from "../config/api";

const preferencesService = {
  // Get user preferences
  getPreferences: async (token) => {
    try {
      const response = await axios.get(`${API_BASE}/users/preferences`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data?.error || "Failed to fetch preferences";
    }
  },

  // Update user preferences
  updatePreferences: async (token, preferences) => {
    try {
      const response = await axios.put(
        `${API_BASE}/users/preferences`,
        preferences,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data?.error || "Failed to update preferences";
    }
  }
};

export default preferencesService;
