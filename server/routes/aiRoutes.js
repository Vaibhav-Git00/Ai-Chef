const express = require("express");
const router = express.Router();
const { detectIngredients } = require("../controllers/aiController");

router.post("/detect-ingredients", detectIngredients);

module.exports = router;
