const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        unique: true,
        required: true
    },
    email: {
        type: String,
        unique: true,
        sparse: true
    },
    password: {
        type: String,
        default: null
    },
    isPhoneVerified: {
        type: Boolean,
        default: false
    },
    
    // Preferences
    preferences: {
        dietType: { type: String, default: "omnivore" }, // omnivore, vegetarian, vegan
        cuisinePreference: { type: String, default: "" },
        spiceLevel: { type: String, default: "medium" }, // mild, medium, spicy
        allergies: [String], // array of allergies
        healthGoal: { type: String, default: "" },
        
        // New: Chef Personality System
        chefPersonality: { 
            type: String, 
            default: "home-cook",
            enum: ["gordon-ramsay", "grandma", "health-coach", "michelin-star", "budget-chef", "home-cook"]
        },
        
        // New: Cooking Preferences
        cookingSkillLevel: { 
            type: String, 
            default: "intermediate",
            enum: ["beginner", "intermediate", "advanced"]
        },
        
        budgetPerMeal: { 
            type: String, 
            default: "medium",
            enum: ["budget", "medium", "premium"]
        },
        
        availableCookingTime: {
            type: String,
            default: "30-60",
            enum: ["15-30", "30-60", "60-120", "120+"]
        },
        
        favoriteIngredientsToInclude: [String],
        
        calorieTarget: {
            type: Number,
            default: 2000
        },
        
        preferredCookingMethods: [String], // baking, grilling, stir-fry, slow-cook, etc.
        
        equipmentAvailable: [String], // blender, oven, air-fryer, etc.
        
        // Rating history for taste profile learning
        ratedRecipes: [{
            dishName: String,
            rating: Number,
            feedback: String,
            timestamp: { type: Date, default: Date.now }
        }]
    },

    // Profile
    profilePicture: { type: String, default: null },
    bio: { type: String, default: "" },

    // Activity Tracking & Gamification
    dailyStreak: {
        type: Number,
        default: 0
    },
    lastCookDate: {
        type: Date,
        default: null
    },
    recipesGenerated: {
        type: Number,
        default: 0
    },
    timeSaved: {
        type: Number,
        default: 0  // in minutes
    },
    skillPoints: {
        type: Number,
        default: 0  // XP system
    },
    
    // Cooked Recipes History
    cookedRecipes: [{
        dishName: String,
        cookDate: { type: Date, default: Date.now },
        cookTime: Number, // actual time spent cooking in minutes
        satisfaction: { type: Number, min: 1, max: 5 },  // 1-5 stars
        notes: String,
        estimatedTimeSaved: Number  // time saved vs manual cooking
    }],
    
    // Weekly Meal Progress (0-6 for days of week)
    weeklyMealsPlanned: [{
        dayOfWeek: { type: Number, min: 0, max: 6 }, // 0-6 for Mon-Sun
        mealsPlanned: { type: Number, default: 0 },
        totalMeals: { type: Number, default: 3 }
    }],

    // Account
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("User", userSchema);
