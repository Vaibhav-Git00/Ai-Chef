const axios = require("axios");

// Generate a full recipe for a dish
exports.generateRecipe = async (req, res) => {
  try {
    const { dish } = req.body;

    if (!dish || !dish.trim()) {
      return res.status(400).json({ error: "Dish name required" });
    }

    if (!process.env.OPENROUTER_KEY) {
      console.error("❌ OPENROUTER_KEY not configured");
      return res.status(500).json({
        error: "OpenRouter API key not configured",
        details: "Missing OPENROUTER_KEY in environment variables"
      });
    }

    console.log("👨‍🍳 Generating recipe for:", dish);

    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "openai/gpt-4o-mini",
        messages: [
          {
            role: "user",
            content: `Generate a complete recipe for "${dish}". 

Include the following sections in your response:
1. Ingredients: (list each ingredient with quantity on a new line)
2. Cooking Time: (total time needed)
3. Difficulty: (Easy/Medium/Hard)
4. Servings: (number of people)
5. Steps: (numbered cooking steps)
6. Tips: (helpful cooking tips)

Format each section clearly with the section name followed by the content.`
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

    console.log("✅ Recipe generated successfully");

    const recipeText = response.data.choices[0].message.content;

    // Parse the recipe text to extract sections
    const parsedRecipe = parseRecipe(recipeText, dish);

    res.json({
      success: true,
      recipe: parsedRecipe
    });

  } catch (error) {
    console.error("❌ RECIPE GENERATION ERROR:");
    console.error("Message:", error.message);
    console.error("Status:", error.response?.status);
    console.error("Data:", error.response?.data);

    let errorMessage = "Failed to generate recipe";
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

// Helper function to parse recipe text
function parseRecipe(text, dishName) {
  const recipe = {
    dish: dishName,
    ingredients: [],
    cookingTime: "Not specified",
    difficulty: "Not specified",
    servings: "Not specified",
    steps: [],
    tips: "",
    fullText: text
  };

  const lines = text.split("\n");
  let currentSection = "";

  for (let line of lines) {
    const trimmedLine = line.trim();

    // Identify section headers
    if (trimmedLine.toLowerCase().includes("ingredients")) {
      currentSection = "ingredients";
    } else if (trimmedLine.toLowerCase().includes("cooking time")) {
      currentSection = "cookingTime";
    } else if (trimmedLine.toLowerCase().includes("difficulty")) {
      currentSection = "difficulty";
    } else if (trimmedLine.toLowerCase().includes("servings")) {
      currentSection = "servings";
    } else if (trimmedLine.toLowerCase().includes("steps") || trimmedLine.toLowerCase().includes("instructions")) {
      currentSection = "steps";
    } else if (trimmedLine.toLowerCase().includes("tips")) {
      currentSection = "tips";
    } else if (trimmedLine.length > 0 && !trimmedLine.includes(":")) {
      // Process content for each section
      if (currentSection === "ingredients" && (trimmedLine.startsWith("-") || trimmedLine.startsWith("•") || /^\d+\./.test(trimmedLine))) {
        recipe.ingredients.push(trimmedLine.replace(/^[-•\d+.]\s*/, "").trim());
      } else if (currentSection === "cookingTime") {
        recipe.cookingTime = trimmedLine;
      } else if (currentSection === "difficulty") {
        recipe.difficulty = trimmedLine;
      } else if (currentSection === "servings") {
        recipe.servings = trimmedLine;
      } else if (currentSection === "steps" && (trimmedLine.startsWith("-") || trimmedLine.startsWith("•") || /^\d+\./.test(trimmedLine))) {
        recipe.steps.push(trimmedLine.replace(/^[-•\d+.]\s*/, "").trim());
      } else if (currentSection === "tips") {
        recipe.tips += (recipe.tips ? " " : "") + trimmedLine;
      }
    }
  }

  // If parsing didn't work well, return the full text
  if (recipe.ingredients.length === 0 && recipe.steps.length === 0) {
    recipe.ingredients = [];
    recipe.steps = [];
    recipe.fullText = text;
  }

  return recipe;
}

// Get recipe detail (legacy endpoint)
exports.getRecipeDetail = async (req, res) => {
  try {
    const { dish } = req.body;

    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "openai/gpt-4o-mini",
        messages: [
          {
            role: "user",
            content: `Give full cooking recipe for ${dish}.
Include:
- Ingredients
- Step by step cooking
- Cooking time
- Tips`
          }
        ]
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    const result = response.data.choices[0].message.content;

    res.json({ recipe: result });

  } catch (error) {
    console.log(error.response?.data || error.message);
    res.status(500).json({ error: "Recipe fetch failed" });
  }
};
