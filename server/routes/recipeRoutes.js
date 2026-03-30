const express = require("express");
const router = express.Router();
const { getRecipes, getRecipesFromIngredients, generateRecipeByDish } = require("../controllers/recipeController");

// Route for getting full recipes from ingredients (primary endpoint used by frontend)
router.post("/", getRecipesFromIngredients);

// Legacy routes for backward compatibility
router.post("/get-recipes", getRecipes);
router.post("/from-ingredients", getRecipesFromIngredients);

// Route for generating detailed recipe by dish name
router.post("/generate", generateRecipeByDish);

module.exports = router;
