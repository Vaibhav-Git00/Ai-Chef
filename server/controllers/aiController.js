const axios = require("axios");

exports.detectIngredients = async (req, res) => {
  try {
    const { imageUrl } = req.body;

    if (!imageUrl) {
      return res.status(400).json({ error: "Image URL required" });
    }

    // Verify OpenRouter API key
    if (!process.env.OPENROUTER_KEY) {
      console.error("OPENROUTER_KEY not configured");
      return res.status(500).json({
        error: "OpenRouter API key not configured",
        details: "Missing OPENROUTER_KEY in environment variables"
      });
    }

    console.log("📸 Detecting ingredients from image:", imageUrl.substring(0, 50) + "...");
    console.log("🔑 Using OpenRouter API Key:", process.env.OPENROUTER_KEY.substring(0, 20) + "...");

    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "openai/gpt-4o-mini",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Look at this food image and list all ingredients visible. Only return ingredient names separated by commas."
              },
              {
                type: "image_url",
                image_url: { url: imageUrl }
              }
            ]
          }
        ]
      },
      {
        headers: {
          "Authorization": `Bearer ${process.env.OPENROUTER_KEY}`,
          "Content-Type": "application/json"
        },
        timeout: 180000 // 3 minute timeout for OpenRouter API (can be slow)
      }
    );

    console.log("✅ OpenRouter API Response Status:", response.status);

    const result = response.data.choices[0].message.content;

    console.log("🧠 Detected ingredients:", result);

    res.json({
      success: true,
      ingredients: result
    });

  } catch (error) {
    console.error("❌ AI DETECTION ERROR:");
    console.error("Message:", error.message);
    console.error("Status:", error.response?.status);
    console.error("Data:", error.response?.data);
    console.error("Full Error:", error);

    // Provide specific error messages
    let errorMessage = "AI detection failed";
    let details = error.message;

    if (error.response?.status === 401) {
      errorMessage = "OpenRouter API authentication failed";
      details = "Invalid or expired API key";
    } else if (error.response?.status === 429) {
      errorMessage = "OpenRouter API rate limit exceeded";
      details = "Too many requests, please try again later";
    } else if (error.response?.status === 400) {
      errorMessage = "Invalid request to OpenRouter API";
      details = error.response?.data?.error?.message || "Bad request format";
    } else if (error.code === 'ECONNREFUSED') {
      errorMessage = "Cannot connect to OpenRouter API";
      details = "Network connection failed";
    }

    res.status(500).json({
      error: errorMessage,
      details: details,
      fullError: error.response?.data || error.message
    });
  }
};
