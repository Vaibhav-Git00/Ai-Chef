const express = require("express");
const router = express.Router();
const { generateGroceryList, generateGroceryListFromRecipe } = require("../controllers/groceryController");

router.post("/generate", generateGroceryList);
router.post("/from-recipe", generateGroceryListFromRecipe);

module.exports = router;
