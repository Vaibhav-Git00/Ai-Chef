const express = require("express");
const router = express.Router();
const { generateMealPlan, getUserMealPlan, updateMealPlan } = require("../controllers/mealPlanController");
const { verifyToken } = require("../middlewares/auth");

// Require auth for all routes
router.use(verifyToken);

router.post("/generate", generateMealPlan);
router.get("/user", getUserMealPlan);
router.put("/update", updateMealPlan);

module.exports = router;
