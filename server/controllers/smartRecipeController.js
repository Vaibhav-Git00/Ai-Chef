const axios = require("axios");

// 🔥 image → ingredients → dishes
exports.getDishFromImage = async (req, res) => {
  try {
    const { imageUrl } = req.body;

    if (!imageUrl) {
      return res.status(400).json({ error: "Image URL required" });
    }

    console.log("🍽️ Starting dish detection from image:", imageUrl.substring(0, 50) + "...");

    // STEP 1: detect ingredients from image
    console.log("📍 STEP 1: Detecting ingredients from image...");
    let detectRes;
    try {
      detectRes = await axios.post(
        "http://localhost:8000/api/ai/detect-ingredients",
        { imageUrl },
        { timeout: 180000 } // 3 minute timeout for AI processing
      );
    } catch (stepError) {
      console.error("❌ STEP 1 FAILED - Ingredient detection error:");
      console.error("Error:", stepError.message);
      if (stepError.response?.data) {
        console.error("Response data:", stepError.response.data);
      }
      return res.status(500).json({
        error: "Failed to detect ingredients from image",
        details: stepError.response?.data || stepError.message,
        step: 1
      });
    }

    const ingredients = detectRes.data.ingredients;

    if (!ingredients) {
      console.error("❌ No ingredients detected - response was:", detectRes.data);
      return res.status(500).json({
        error: "No ingredients could be detected from the image",
        details: "The AI could not identify any ingredients in the image",
        step: 1
      });
    }

    console.log("✅ STEP 1 SUCCESS - Ingredients detected:", ingredients.substring(0, 100) + "...");

    // STEP 2: get dishes from ingredients
    console.log("📍 STEP 2: Generating dish suggestions from ingredients...");

    if (!process.env.OPENROUTER_KEY) {
      console.error("❌ OPENROUTER_KEY not configured");
      return res.status(500).json({
        error: "OpenRouter API key not configured",
        details: "Missing OPENROUTER_KEY in environment variables",
        step: 2
      });
    }

    let recipeRes;
    try {
      recipeRes = await axios.post(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          model: "openai/gpt-4o-mini",
          messages: [
            {
              role: "user",
              content: `I have these ingredients: ${ingredients}.
Suggest 5 dishes I can make.
Return only dish names in list format.`
            }
          ]
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.OPENROUTER_KEY}`,
            "Content-Type": "application/json"
          },
          timeout: 180000 // 3 minute timeout
        }
      );
    } catch (stepError) {
      console.error("❌ STEP 2 FAILED - OpenRouter API error:");
      console.error("Status:", stepError.response?.status);
      console.error("Error:", stepError.message);
      if (stepError.response?.data) {
        console.error("Response data:", stepError.response.data);
      }

      let userMessage = "Failed to generate dish suggestions";
      let details = "Please try uploading a clearer image.";
      
      if (stepError.response?.status === 401) {
        userMessage = "OpenRouter API authentication failed";
        details = "Invalid or expired API key. Please check your OPENROUTER_KEY in .env file.";
      } else if (stepError.response?.status === 429) {
        userMessage = "OpenRouter API rate limit exceeded";
        details = "Please try again in a few moments.";
      } else if (stepError.response?.status === 400) {
        userMessage = "Invalid request format";
        details = stepError.response?.data?.error?.message || "Please try with a different image.";
      }

      return res.status(500).json({
        error: userMessage,
        details: stepError.response?.data || stepError.message,
        step: 2
      });
    }

    const dishes = recipeRes.data.choices[0].message.content;

    if (!dishes) {
      console.error("❌ No dishes generated - response was:", recipeRes.data);
      return res.status(500).json({
        error: "No dishes could be generated",
        details: "The AI failed to generate dish suggestions",
        step: 2
      });
    }

    console.log("✅ STEP 2 SUCCESS - Dishes generated:", dishes.substring(0, 100) + "...");

    console.log("✅ DISH DETECTION COMPLETE!");

    res.json({
      success: true,
      detectedIngredients: ingredients,
      suggestedDishes: dishes
    });

  } catch (error) {
    console.error("❌ UNEXPECTED ERROR in getDishFromImage:");
    console.error("Message:", error.message);
    console.error("Stack:", error.stack);

    res.status(500).json({
      error: "Smart recipe detection failed",
      details: error.message
    });
  }
};
