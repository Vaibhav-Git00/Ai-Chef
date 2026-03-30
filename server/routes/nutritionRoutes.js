const express = require("express");
const router = express.Router();
const { getNutrition } = require("../controllers/nutritionController");

router.post("/get-nutrition", getNutrition);

module.exports = router;
