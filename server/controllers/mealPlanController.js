const axios = require("axios");
const MealPlan = require("../models/MealPlan");
const User = require("../models/User");

/**
 * Generate weekly meal plan
 */
exports.generateMealPlan = async (req, res) => {
    try {
        const userId = req.userId;

        if (!userId) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        // Get user's preferences
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        const { dietType, cuisinePreference, allergies } = user.preferences || {};
        
        // Get start of current week (Monday)
        const today = new Date();
        const weekStartDate = new Date(today.setDate(today.getDate() - today.getDay() + 1));

        // Call AI to generate meal plan
        const prompt = `Generate a complete weekly meal plan with breakfast, lunch, and dinner for each day (Monday to Sunday).

Preferences:
- Diet Type: ${dietType || "omnivore"}
- Cuisine: ${cuisinePreference || "mixed"}
- Avoid: ${allergies?.join(", ") || "none"}

Return ONLY as JSON in this format:
{
  "Monday": {"breakfast": "...", "lunch": "...", "dinner": "..."},
  "Tuesday": {"breakfast": "...", "lunch": "...", "dinner": "..."},
  "Wednesday": {"breakfast": "...", "lunch": "...", "dinner": "..."},
  "Thursday": {"breakfast": "...", "lunch": "...", "dinner": "..."},
  "Friday": {"breakfast": "...", "lunch": "...", "dinner": "..."},
  "Saturday": {"breakfast": "...", "lunch": "...", "dinner": "..."},
  "Sunday": {"breakfast": "...", "lunch": "...", "dinner": "..."}
}`;

        const response = await axios.post(
            "https://openrouter.ai/api/v1/chat/completions",
            {
                model: "openai/gpt-4o-mini",
                messages: [
                    {
                        role: "user",
                        content: prompt
                    }
                ]
            },
            {
                headers: {
                    Authorization: `Bearer ${process.env.OPENROUTER_KEY}`,
                    "Content-Type": "application/json"
                },
                timeout: 60000
            }
        );

        const mealPlanContent = response.data.choices[0].message.content;
        const mealPlanData = JSON.parse(mealPlanContent);

        // Save meal plan to database
        const mealPlan = new MealPlan({
            userId,
            weekStartDate,
            meals: mealPlanData
        });

        await mealPlan.save();

        res.json({
            success: true,
            message: "Meal plan generated successfully",
            mealPlan: {
                weekStartDate,
                meals: mealPlanData
            }
        });

    } catch (error) {
        console.error("❌ Meal Plan Generation Error:", error.message);
        let errorMsg = "Failed to generate meal plan";
        
        if (error.response?.status === 401) {
            errorMsg = "API authentication failed. Please check your API key.";
        } else if (error.response?.status === 429) {
            errorMsg = "Rate limit exceeded. Please try again later.";
        }
        
        res.status(500).json({ 
            error: errorMsg,
            details: error.message
        });
    }
};

/**
 * Get user's meal plan
 */
exports.getUserMealPlan = async (req, res) => {
    try {
        const userId = req.userId;
        const { weekStartDate } = req.query;

        if (!userId) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        let query = { userId };
        
        if (weekStartDate) {
            const startDate = new Date(weekStartDate);
            const endDate = new Date(startDate.getTime() + 7 * 24 * 60 * 60 * 1000);
            query.weekStartDate = { $gte: startDate, $lt: endDate };
        }

        const mealPlan = await MealPlan.findOne(query).sort({ weekStartDate: -1 });

        if (!mealPlan) {
            return res.json({ 
                success: false,
                message: "No meal plan found",
                mealPlan: null
            });
        }

        res.json({
            success: true,
            mealPlan: {
                _id: mealPlan._id,
                weekStartDate: mealPlan.weekStartDate,
                meals: mealPlan.meals
            }
        });

    } catch (error) {
        console.error("Error fetching meal plan:", error);
        res.status(500).json({ error: error.message });
    }
};

/**
 * Update meal plan
 */
exports.updateMealPlan = async (req, res) => {
    try {
        const { mealPlanId, day, meal, value } = req.body;
        const userId = req.userId;

        if (!userId) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const mealPlan = await MealPlan.findOne({
            _id: mealPlanId,
            userId
        });

        if (!mealPlan) {
            return res.status(404).json({ error: "Meal plan not found" });
        }

        // Update specific meal
        if (!mealPlan.meals[day]) {
            mealPlan.meals[day] = {};
        }

        mealPlan.meals[day][meal] = value; // breakfast, lunch, or dinner
        mealPlan.updatedAt = new Date();

        await mealPlan.save();

        res.json({
            message: "Meal plan updated successfully",
            mealPlan: {
                weekStartDate: mealPlan.weekStartDate,
                meals: Object.fromEntries(mealPlan.meals)
            }
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
