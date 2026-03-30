const mongoose = require("mongoose");

const historySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  email: String,
  imageUrl: String,
  ingredients: String,
  dish: String,
  nutrition: String,
  recipe: String,
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  }
});

// Index for userId queries
historySchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model("History", historySchema);
