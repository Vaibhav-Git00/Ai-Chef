const History = require("../models/History");

/**
 * Save history entry
 */
exports.saveHistory = async (req, res) => {
  try {
    const { email, imageUrl, ingredients, dish, nutrition, recipe } = req.body;
    const userId = req.userId;

    const newHistory = new History({
      userId: userId || null,
      email,
      imageUrl,
      ingredients,
      dish,
      nutrition,
      recipe
    });

    await newHistory.save();

    res.json({ message: "History saved" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * Get user history (new way with JWT)
 */
exports.getUserHistory = async (req, res) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const data = await History.find({ userId }).sort({ createdAt: -1 });

    res.json(data);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * Get history (backward compatible - old way with email)
 */
exports.getHistory = async (req, res) => {
  try {
    const { email } = req.body;
    const userId = req.userId;

    let query = {};
    
    if (userId) {
      query.userId = userId;
    } else if (email) {
      query.email = email;
    } else {
      return res.status(400).json({ error: "User not identified" });
    }

    const data = await History.find(query).sort({ createdAt: -1 });

    res.json(data);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * Get single history item
 */
exports.getHistoryItem = async (req, res) => {
  try {
    const { historyId } = req.params;
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const history = await History.findOne({ _id: historyId, userId });

    if (!history) {
      return res.status(404).json({ error: "History item not found" });
    }

    res.json(history);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * Delete history item
 */
exports.deleteHistoryItem = async (req, res) => {
  try {
    const { historyId } = req.params;
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const history = await History.findOne({ _id: historyId, userId });

    if (!history) {
      return res.status(404).json({ error: "History item not found" });
    }

    await History.deleteOne({ _id: historyId });

    res.json({ message: "History item deleted successfully" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
