const express = require("express");
const router = express.Router();
const { saveHistory, getHistory, getUserHistory, getHistoryItem, deleteHistoryItem } = require("../controllers/historyController");
const { verifyToken, optionalAuth } = require("../middlewares/auth");

router.post("/save", optionalAuth, saveHistory);
router.post("/get", optionalAuth, getHistory);

// New JWT-based routes
router.get("/user", verifyToken, getUserHistory);
router.get("/:historyId", verifyToken, getHistoryItem);
router.delete("/:historyId", verifyToken, deleteHistoryItem);

module.exports = router;
