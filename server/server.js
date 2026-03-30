const express = require("express");
const cors = require("cors");
require("dotenv").config();
const mongoose = require("mongoose");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const fileUpload = require("express-fileupload");
const aiRoutes = require("./routes/aiRoutes");
const recipeRoutes = require("./routes/recipeRoutes");
const smartRecipeRoutes = require("./routes/smartRecipeRoutes");
const nutritionRoutes = require("./routes/nutritionRoutes");
const historyRoutes = require("./routes/historyRoutes");
const recipeDetailRoutes = require("./routes/recipeDetailRoutes");
const imageRoutes = require("./routes/imageRoutes");
const mealPlanRoutes = require("./routes/mealPlanRoutes");
const groceryRoutes = require("./routes/groceryRoutes");
const activityRoutes = require("./routes/activityRoutes");

const app = express();

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URL)
.then(() => console.log("MongoDB connected 🔥"))
.catch(err => console.log(err));

app.use(fileUpload({
  useTempFiles: true
}));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/recipe", recipeRoutes);
app.use("/api/recipe", recipeDetailRoutes);
app.use("/api/smart", smartRecipeRoutes);
app.use("/api/nutrition", nutritionRoutes);
app.use("/api/history", historyRoutes);
app.use("/api/image", imageRoutes);
app.use("/api/mealplan", mealPlanRoutes);
app.use("/api/grocery", groceryRoutes);
app.use("/api/activity", activityRoutes);

app.get("/", (req, res) => {
  res.send("SmartChef AI backend running 🔥");
});

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
