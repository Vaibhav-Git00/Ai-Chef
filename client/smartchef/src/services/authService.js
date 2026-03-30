import axios from "axios";
import API_BASE from "../config/api";

const authService = {
  // OTP Flow
  sendOTP: (phone) => {
    return axios.post(`${API_BASE}/auth/send-otp`, { phone });
  },

  verifyOTP: (phone, otp) => {
    return axios.post(`${API_BASE}/auth/verify-otp`, { phone, otp });
  },

  // Sign up
  signup: (data) => {
    return axios.post(`${API_BASE}/auth/signup`, data);
  },

  // Login with OTP
  loginWithOTP: (phone, otp) => {
    return axios.post(`${API_BASE}/auth/login-otp`, { phone, otp });
  },

  // Login (backward compatible)
  login: (email, password) => {
    return axios.post(`${API_BASE}/auth/login`, { email, password });
  },

  // Get current user from API
  fetchCurrentUser: async () => {
    try {
      const token = authService.getToken();
      if (!token) return null;
      
      const response = await axios.get(`${API_BASE}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const userData = response.data.user;
      // Cache user in localStorage
      localStorage.setItem("user", JSON.stringify(userData));
      return userData;
    } catch (error) {
      console.error("Error fetching user:", error);
      authService.clearToken(); // Clear invalid token
      return null;
    }
  },

  // Get current user (from cache or API)
  getCurrentUser: () => {
    try {
      const cachedUser = localStorage.getItem("user");
      return cachedUser ? JSON.parse(cachedUser) : null;
    } catch (error) {
      return null;
    }
  },

  // Update profile
  updateProfile: (profileData) => {
    const token = authService.getToken();
    return axios.put(`${API_BASE}/auth/profile`, profileData, {
      headers: { Authorization: `Bearer ${token}` }
    });
  },

  // Update preferences
  updatePreferences: (preferences) => {
    const token = authService.getToken();
    return axios.put(`${API_BASE}/auth/preferences`, preferences, {
      headers: { Authorization: `Bearer ${token}` }
    });
  },

  // Save preferences (backward compatible)
  savePreferences: (email, preferences) => {
    return axios.post(`${API_BASE}/auth/save-preferences`, {
      email,
      ...preferences
    });
  },

  // Store token and cache user
  setToken: (token, userData = null) => {
    localStorage.setItem("token", token);
    if (userData) {
      localStorage.setItem("user", JSON.stringify(userData));
    }
  },

  // Get token
  getToken: () => {
    return localStorage.getItem("token");
  },

  // Clear token and user cache
  clearToken: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  },

  // Logout (calls clearToken and can be used for API logout if needed)
  logout: () => {
    authService.clearToken();
  },

  // Check if authenticated
  isAuthenticated: () => {
    return !!localStorage.getItem("token");
  }
};

export default authService;
