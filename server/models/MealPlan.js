const mongoose = require("mongoose");

const mealPlanSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    weekStartDate: {
        type: Date,
        required: true
    },
    meals: {
        type: Map,
        of: new mongoose.Schema({
            breakfast: String,
            lunch: String,
            dinner: String
        }, { _id: false }),
        default: new Map()
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("MealPlan", mealPlanSchema);
