const User = require("../models/User");
const { sendOTP, verifyOTP, cleanupOTP } = require("../services/otpService");
const { generateToken } = require("../services/jwtService");
const { validatePhone, validateEmail, validatePassword } = require("../utils/validators");
const bcrypt = require("bcryptjs");

/**
 * Send OTP to phone
 */
exports.sendOTP = async (req, res) => {
    try {
        const { phone } = req.body;

        if (!phone || !validatePhone(phone)) {
            return res.status(400).json({ error: "Invalid phone number" });
        }

        const result = await sendOTP(phone);
        res.json(result);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

/**
 * Verify OTP
 */
exports.verifyOTPCode = async (req, res) => {
    try {
        const { phone, otp } = req.body;

        if (!phone || !otp) {
            return res.status(400).json({ error: "Phone and OTP required" });
        }

        const result = await verifyOTP(phone, otp);
        res.json(result);

    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

/**
 * Signup with phone OTP
 */
exports.signup = async (req, res) => {
    try {
        const { name, phone, email, password, preferences } = req.body;

        // Validate required fields
        if (!name || !phone) {
            return res.status(400).json({ error: "Name and phone are required" });
        }

        if (!validatePhone(phone)) {
            return res.status(400).json({ error: "Invalid phone number" });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ phone });
        if (existingUser) {
            return res.status(400).json({ error: "User already exists with this phone" });
        }

        // Hash password if provided
        let hashedPassword = null;
        if (password) {
            if (!validatePassword(password)) {
                return res.status(400).json({ 
                    error: "Password requirements: At least 8 characters, 1 uppercase, 1 lowercase, 1 number" 
                });
            }
            hashedPassword = await bcrypt.hash(password, 10);
        }

        // Create new user
        const user = new User({
            name,
            phone,
            email: email || null,
            password: hashedPassword,
            isPhoneVerified: true,
            preferences: {
                dietType: preferences?.dietType || "omnivore",
                cuisinePreference: preferences?.cuisinePreference || "",
                spiceLevel: preferences?.spiceLevel || "medium",
                allergies: preferences?.allergies || [],
                healthGoal: preferences?.healthGoal || ""
            }
        });

        await user.save();

        // Generate JWT token
        const token = generateToken(user._id, user.phone);

        // Cleanup OTP after successful signup
        await cleanupOTP(phone);

        res.json({
            message: "User created successfully 🔥",
            token,
            user: {
                _id: user._id,
                name: user.name,
                phone: user.phone,
                email: user.email,
                preferences: user.preferences
            }
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

/**
 * Login with phone OTP
 */
exports.loginWithOTP = async (req, res) => {
    try {
        const { phone, otp } = req.body;

        if (!phone || !otp) {
            return res.status(400).json({ error: "Phone and OTP required" });
        }

        // Verify OTP
        await verifyOTP(phone, otp);

        // Find user
        const user = await User.findOne({ phone });
        if (!user) {
            return res.status(401).json({ error: "User not found. Please signup first." });
        }

        // Generate JWT token
        const token = generateToken(user._id, user.phone);

        // Cleanup OTP after successful login
        await cleanupOTP(phone);

        res.json({
            message: "Login successful 🔥",
            token,
            user: {
                _id: user._id,
                name: user.name,
                phone: user.phone,
                email: user.email,
                preferences: user.preferences
            }
        });

    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

/**
 * Backward compatible login (old method)
 */
exports.login = async (req, res) => {
    try {
        const { email, password, phone, otp } = req.body;

        // OTP login
        if (phone && otp) {
            return exports.loginWithOTP(req, res);
        }

        // Password login
        if (email && password) {
            const user = await User.findOne({ email });

            if (!user || !(await bcryptjs.compare(password, user.password))) {
                return res.status(401).json({ message: "Invalid email or password" });
            }

            const token = generateToken(user._id, user.phone);

            res.json({
                message: "Login successful 🔥",
                token,
                user
            });
        } else {
            return res.status(400).json({ error: "Please provide phone+otp or email+password" });
        }

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

/**
 * Get current user
 */
exports.getCurrentUser = async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        res.json({
            user: {
                _id: user._id,
                name: user.name,
                phone: user.phone,
                email: user.email,
                profilePicture: user.profilePicture,
                bio: user.bio,
                preferences: user.preferences,
                createdAt: user.createdAt
            }
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

/**
 * Update user profile
 */
exports.updateProfile = async (req, res) => {
    try {
        const { name, email, bio, profilePicture, preferences } = req.body;

        const user = await User.findByIdAndUpdate(
            req.userId,
            {
                ...(name && { name }),
                ...(email && { email }),
                ...(bio && { bio }),
                ...(profilePicture && { profilePicture }),
                ...(preferences && { preferences }),
                updatedAt: new Date()
            },
            { returnDocument: "after" }
        );

        res.json({
            message: "Profile updated successfully",
            user: {
                _id: user._id,
                name: user.name,
                phone: user.phone,
                email: user.email,
                preferences: user.preferences
            }
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

/**
 * Update preferences
 */
exports.updatePreferences = async (req, res) => {
    try {
        const { dietType, cuisinePreference, spiceLevel, allergies, healthGoal } = req.body;

        const user = await User.findById(req.userId);
        
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        // Update only the fields that were provided
        if (dietType !== undefined) user.preferences.dietType = dietType;
        if (cuisinePreference !== undefined) user.preferences.cuisinePreference = cuisinePreference;
        if (spiceLevel !== undefined) user.preferences.spiceLevel = spiceLevel;
        if (allergies !== undefined) user.preferences.allergies = allergies;
        if (healthGoal !== undefined) user.preferences.healthGoal = healthGoal;
        user.updatedAt = new Date();

        await user.save();

        res.json({
            message: "Preferences updated successfully",
            preferences: user.preferences
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

/**
 * Save preferences (backward compatible)
 */
exports.savePreferences = async (req, res) => {
    try {
        const { email, phone, spice, foodType, cuisine, healthGoal } = req.body;

        let user;
        
        if (req.userId) {
            // New way - using JWT auth
            user = await User.findById(req.userId);
            if (!user) {
                return res.status(404).json({ error: "User not found" });
            }
            
            user.preferences = {
                spiceLevel: spice || user.preferences.spiceLevel,
                dietType: foodType || user.preferences.dietType,
                cuisinePreference: cuisine || user.preferences.cuisinePreference,
                healthGoal: healthGoal || user.preferences.healthGoal
            };
            user.updatedAt = new Date();
            await user.save();
        } else if (email || phone) {
            // Old way - using email/phone
            user = await User.findOneAndUpdate(
                { ...(email && { email }), ...(phone && { phone }) },
                {
                    preferences: {
                        spiceLevel: spice || "medium",
                        dietType: foodType || "omnivore",
                        cuisinePreference: cuisine || "",
                        healthGoal: healthGoal || ""
                    },
                    updatedAt: new Date()
                },
                { new: true }
            );
            
            if (!user) {
                return res.status(404).json({ error: "User not found" });
            }
        } else {
            return res.status(400).json({ error: "Please provide userId or email/phone" });
        }

        res.json({
            message: "Preferences saved 🔥",
            preferences: user.preferences
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

