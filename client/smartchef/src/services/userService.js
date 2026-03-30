import axios from "axios";
import API_BASE from "../config/api";

const userService = {
  // Get current user profile
  getProfile: async (token) => {
    try {
      const response = await axios.get(`${API_BASE}/users/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data?.error || "Failed to fetch profile";
    }
  },

  // Update user profile
  updateProfile: async (token, profileData) => {
    try {
      const response = await axios.put(
        `${API_BASE}/users/profile`,
        profileData,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data?.error || "Failed to update profile";
    }
  },

  // Upload profile picture
  uploadProfilePicture: async (token, file) => {
    try {
      const formData = new FormData();
      formData.append("profilePicture", file);
      const response = await axios.post(
        `${API_BASE}/users/profile-picture`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data"
          }
        }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data?.error || "Failed to upload profile picture";
    }
  }
};

export default userService;
