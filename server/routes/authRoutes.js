const express = require("express");
const router = express.Router();
const { 
    sendOTP, 
    verifyOTPCode, 
    signup, 
    loginWithOTP, 
    login, 
    getCurrentUser,
    updateProfile,
    updatePreferences,
    savePreferences 
} = require("../controllers/authcontroller");
const { verifyToken } = require("../middlewares/auth");

// OTP authentication
router.post("/send-otp", sendOTP);
router.post("/verify-otp", verifyOTPCode);

// Authentication
router.post("/signup", signup);
router.post("/login-otp", loginWithOTP);
router.post("/login", login);

// Preferences
router.post("/save-preferences", savePreferences);

// Protected routes (require JWT)
router.get("/me", verifyToken, getCurrentUser);
router.put("/profile", verifyToken, updateProfile);
router.put("/preferences", verifyToken, updatePreferences);

module.exports = router;
