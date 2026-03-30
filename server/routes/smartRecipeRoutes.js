const express = require("express");
const router = express.Router();
const { getDishFromImage } = require("../controllers/smartRecipeController");

router.post("/from-image", getDishFromImage);

module.exports = router;
