const axios = require("axios");

exports.getNutrition = async (req, res) => {
  try {
    const { dish } = req.body;

    if (!dish) {
      return res.status(400).json({ error: "Dish required" });
    }

    if (!process.env.OPENROUTER_KEY) {
      console.error("OPENROUTER_KEY not configured");
      return res.status(500).json({
        error: "OpenRouter API key not configured",
        details: "Missing OPENROUTER_KEY in environment variables"
      });
    }

    console.log("🥗 Fetching nutrition info for:", dish);

    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "openai/gpt-4o-mini",
        messages: [
          {
            role: "user",
            content: `
Give nutrition details for ${dish}.

Include:
- Protein grams
- Calories
- Carbs
- Fat
- Pros
- Cons

Return short and clean.
`
          }
        ]
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_KEY}`,
          "Content-Type": "application/json"
        },
        timeout: 60000
      }
    );

    console.log("✅ Nutrition API response received");

    const result = response.data.choices[0].message.content;

    res.json({
      success: true,
      nutrition: result
    });

  } catch (error) {
    console.error("❌ NUTRITION ERROR:");
    console.error("Message:", error.message);
    console.error("Status:", error.response?.status);
    console.error("Data:", error.response?.data);

    let errorMessage = "Nutrition lookup failed";
    
    if (error.response?.status === 401) {
      errorMessage = "OpenRouter API authentication failed";
    } else if (error.response?.status === 429) {
      errorMessage = "OpenRouter API rate limit exceeded";
    }

    res.status(500).json({
      error: errorMessage,
      details: error.response?.data || error.message
    });
  }
};
