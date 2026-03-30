const express = require("express");
const router = express.Router();
const {
  getProfile,
  updateProfile,
  uploadProfilePicture,
  getPreferences,
  updatePreferences
} = require("../controllers/userController");
const { verifyToken } = require("../middlewares/auth");

// All routes require authentication
router.use(verifyToken);

// Profile routes
router.get("/profile", getProfile);
router.put("/profile", updateProfile);
router.post("/profile-picture", uploadProfilePicture);

// Preferences routes
router.get("/preferences", getPreferences);
router.put("/preferences", updatePreferences);

module.exports = router;
