const express = require("express");
const router = express.Router();
const { getRecipeDetail, generateRecipe } = require("../controllers/recipeDetailController");

router.post("/detail", getRecipeDetail);
router.post("/generate", generateRecipe);

module.exports = router;
