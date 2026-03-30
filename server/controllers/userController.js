const User = require("../models/User");
const cloudinary = require("../config/cloudinary");

/**
 * Get user profile
 */
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password");

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        phone: user.phone,
        email: user.email,
        profilePicture: user.profilePicture,
        bio: user.bio,
        preferences: user.preferences,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        isPhoneVerified: user.isPhoneVerified
      }
    });
  } catch (error) {
    console.error("Error fetching profile:", error);
    res.status(500).json({ error: "Failed to fetch profile" });
  }
};

/**
 * Update user profile
 */
exports.updateProfile = async (req, res) => {
  try {
    const { name, email, bio, profilePicture } = req.body;

    // Validate email if provided
    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ error: "Invalid email format" });
      }

      // Check if email is already used by another user
      const existingUser = await User.findOne({ email, _id: { $ne: req.userId } });
      if (existingUser) {
        return res.status(400).json({ error: "Email already in use" });
      }
    }

    const updateData = {
      updatedAt: new Date()
    };

    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (bio !== undefined) updateData.bio = bio;
    if (profilePicture) updateData.profilePicture = profilePicture;

    const user = await User.findByIdAndUpdate(req.userId, updateData, {
      new: true
    }).select("-password");

    res.json({
      success: true,
      message: "Profile updated successfully",
      user: {
        _id: user._id,
        name: user.name,
        phone: user.phone,
        email: user.email,
        profilePicture: user.profilePicture,
        bio: user.bio,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ error: "Failed to update profile" });
  }
};

/**
 * Upload profile picture
 */
exports.uploadProfilePicture = async (req, res) => {
  try {
    if (!req.files || !req.files.profilePicture) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const file = req.files.profilePicture;

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(file.tempFilePath, {
      folder: "smartchef/profiles",
      resource_type: "auto"
    });

    // Update user with new profile picture
    const user = await User.findByIdAndUpdate(
      req.userId,
      {
        profilePicture: result.secure_url,
        updatedAt: new Date()
      },
      { new: true }
    ).select("-password");

    res.json({
      success: true,
      message: "Profile picture uploaded successfully",
      profilePicture: result.secure_url,
      user
    });
  } catch (error) {
    console.error("Error uploading profile picture:", error);
    res.status(500).json({ error: "Failed to upload profile picture" });
  }
};

/**
 * Get user preferences
 */
exports.getPreferences = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("preferences");

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({
      success: true,
      preferences: user.preferences || {
        dietType: "omnivore",
        cuisinePreference: "",
        spiceLevel: "medium",
        allergies: [],
        healthGoal: ""
      }
    });
  } catch (error) {
    console.error("Error fetching preferences:", error);
    res.status(500).json({ error: "Failed to fetch preferences" });
  }
};

/**
 * Update user preferences
 */
exports.updatePreferences = async (req, res) => {
  try {
    const { 
      dietType, 
      cuisinePreference, 
      spiceLevel, 
      allergies, 
      healthGoal,
      chefPersonality,
      cookingSkillLevel,
      budgetPerMeal,
      availableCookingTime,
      favoriteIngredientsToInclude,
      calorieTarget,
      preferredCookingMethods,
      equipmentAvailable
    } = req.body;

    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Update dietary preferences
    if (dietType) user.preferences.dietType = dietType;
    if (cuisinePreference !== undefined) user.preferences.cuisinePreference = cuisinePreference;
    if (spiceLevel) user.preferences.spiceLevel = spiceLevel;
    if (allergies !== undefined) user.preferences.allergies = Array.isArray(allergies) ? allergies : [];
    if (healthGoal !== undefined) user.preferences.healthGoal = healthGoal;
    
    // Update chef personality preferences
    if (chefPersonality) user.preferences.chefPersonality = chefPersonality;
    if (cookingSkillLevel) user.preferences.cookingSkillLevel = cookingSkillLevel;
    if (budgetPerMeal) user.preferences.budgetPerMeal = budgetPerMeal;
    if (availableCookingTime) user.preferences.availableCookingTime = availableCookingTime;
    
    // Update advanced preferences
    if (favoriteIngredientsToInclude !== undefined) {
      user.preferences.favoriteIngredientsToInclude = Array.isArray(favoriteIngredientsToInclude) ? favoriteIngredientsToInclude : [];
    }
    if (calorieTarget) user.preferences.calorieTarget = calorieTarget;
    if (preferredCookingMethods !== undefined) {
      user.preferences.preferredCookingMethods = Array.isArray(preferredCookingMethods) ? preferredCookingMethods : [];
    }
    if (equipmentAvailable !== undefined) {
      user.preferences.equipmentAvailable = Array.isArray(equipmentAvailable) ? equipmentAvailable : [];
    }
    
    user.updatedAt = new Date();
    await user.save();

    res.json({
      success: true,
      message: "Preferences updated successfully",
      preferences: user.preferences
    });
  } catch (error) {
    console.error("Error updating preferences:", error);
    res.status(500).json({ error: "Failed to update preferences" });
  }
};
