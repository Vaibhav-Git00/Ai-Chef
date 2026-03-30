const axios = require("axios");
const User = require("../models/User");

/**
 * Build personalized recipe prompt based on user preferences
 */
const buildPersonalizedPrompt = (userPrefs, basePrompt) => {
  let personalizedPrompt = basePrompt;
  
  if (!userPrefs) return personalizedPrompt;

  // Add chef personality style
  const chefStyles = {
    "gordon-ramsay": "with precision and restaurant-quality techniques. Ensure fresh quality ingredients and exact measurements.",
    "grandma": "as comfort food focusing on simple, time-tested ingredients that create warmth and satisfaction.",
    "health-coach": "prioritizing nutrition and balanced macros. Include calorie and macro estimates.",
    "michelin-star": "with sophisticated techniques, artistic presentation, and gourmet ingredients for an elegant experience.",
    "budget-chef": "using affordable, budget-friendly ingredients without compromising on flavor.",
    "home-cook": "in a simple, approachable way that anyone can execute on a weeknight."
  };

  const style = chefStyles[userPrefs.chefPersonality] || chefStyles["home-cook"];
  personalizedPrompt += `\n\nGenerate the recipe ${style}`;

  // Add cooking skill level
  if (userPrefs.cookingSkillLevel) {
    if (userPrefs.cookingSkillLevel === "beginner") {
      personalizedPrompt += "\nKeep techniques simple and provide detailed step-by-step guidance.";
    } else if (userPrefs.cookingSkillLevel === "advanced") {
      personalizedPrompt += "\nInclude advanced techniques, temperature control tips, and professional tricks.";
    }
  }

  // Add budget constraint
  if (userPrefs.budgetPerMeal === "budget") {
    personalizedPrompt += "\nFocus on affordable ingredients available in regular grocery stores.";
  } else if (userPrefs.budgetPerMeal === "premium") {
    personalizedPrompt += "\nInclude quality/premium ingredients for best results.";
  }

  // Add cooking time constraint
  if (userPrefs.availableCookingTime === "15-30") {
    personalizedPrompt += "\nKeep total cooking time under 30 minutes.";
  } else if (userPrefs.availableCookingTime === "120+") {
    personalizedPrompt += "\nCan include slow-cooking methods and longer preparation times.";
  }

  // Add diet and allergies
  if (userPrefs.dietType && userPrefs.dietType !== "omnivore") {
    personalizedPrompt += `\nEnsure the recipe is suitable for a ${userPrefs.dietType} diet.`;
  }

  if (userPrefs.allergies && userPrefs.allergies.length > 0) {
    personalizedPrompt += `\nAbsolutely avoid these ingredients: ${userPrefs.allergies.join(", ")}.`;
  }

  if (userPrefs.cuisinePreference) {
    personalizedPrompt += `\nPrefer ${userPrefs.cuisinePreference} cuisine style.`;
  }

  if (userPrefs.spiceLevel) {
    const spiceMap = {
      "mild": "Keep the spice level very mild and gentle.",
      "medium": "Use moderate spice levels.",
      "hot": "Include bold, spicy flavors throughout."
    };
    personalizedPrompt += `\n${spiceMap[userPrefs.spiceLevel]}`;
  }

  // Add calorie target
  if (userPrefs.calorieTarget) {
    personalizedPrompt += `\nEach serving should be around ${Math.round(userPrefs.calorieTarget / 3)} calories (daily target: ${userPrefs.calorieTarget}).`;
  }

  return personalizedPrompt;
};

exports.getRecipes = async (req, res) => {
  try {
    const { ingredients } = req.body;
    const userId = req.userId; // From auth middleware
    
    if (!ingredients) {
      return res.status(400).json({ error: "Ingredients required" });
    }

    if (!process.env.OPENROUTER_KEY) {
      return res.status(500).json({ 
        error: "API key not configured",
        details: "Missing OPENROUTER_KEY in environment variables"
      });
    }

    // Fetch user preferences if authenticated
    let userPrefs = null;
    if (userId) {
      try {
        const user = await User.findById(userId);
        userPrefs = user?.preferences;
      } catch (err) {
        console.log("Could not fetch user preferences:", err.message);
      }
    }

    let basePrompt = `I have these ingredients: ${ingredients}.
Suggest 5 dishes I can make.
Return only dish names in list format, one per line.`;

    const prompt = buildPersonalizedPrompt(userPrefs, basePrompt);

    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "openai/gpt-4o-mini",
        messages: [{ role: "user", content: prompt }]
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_KEY}`,
          "Content-Type": "application/json"
        },
        timeout: 60000
      }
    );

    const result = response.data.choices[0].message.content;

    res.json({
      success: true,
      dishes: result
    });

  } catch (error) {
    console.error("Recipe AI error:", error.message);
    
    let errorMsg = "Recipe service failed";
    if (error.response?.status === 401) {
      errorMsg = "API authentication failed";
    } else if (error.response?.status === 429) {
      errorMsg = "Rate limit exceeded";
    } else if (error.code === 'ECONNREFUSED') {
      errorMsg = "Cannot connect to recipe service";
    }
    
    res.status(500).json({ 
      error: errorMsg,
      details: error.message
    });
  }
};

exports.generateRecipeByDish = async (req, res) => {
  try {
    const { dish } = req.body;
    
    if (!dish) {
      return res.status(400).json({ error: "Dish name required" });
    }

    if (!process.env.OPENROUTER_KEY) {
      return res.status(500).json({ 
        error: "API key not configured",
        details: "Missing OPENROUTER_KEY in environment variables"
      });
    }

    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "openai/gpt-4o-mini",
        messages: [
          {
            role: "user",
            content: `Generate a detailed recipe for: ${dish}.
Provide:
1. Dish name
2. Ingredients list (with quantities)
3. Cooking time
4. Difficulty level (Easy/Medium/Hard)
5. Step-by-step instructions
6. Serving size
7. Tips and variations (optional)

Format as a JSON object with these exact keys: dish, ingredients, cookingTime, difficultyLevel, instructions, servingSize, tips.`
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

    const result = response.data.choices[0].message.content;
    
    try {
      // Clean up markdown formatting if present (```json...\n...\n```)
      let cleanedResult = result;
      if (result.includes('```')) {
        cleanedResult = result
          .replace(/```json\n?/g, '')
          .replace(/```\n?/g, '')
          .trim();
      }
      
      const recipe = JSON.parse(cleanedResult);
      res.json({
        success: true,
        recipes: [recipe]
      });
    } catch (parseError) {
      console.error("JSON Parse Error:", parseError.message);
      console.error("Result was:", result.substring(0, 200));
      
      // If JSON parsing fails, return raw text as recipe
      res.json({
        success: true,
        recipes: [{ 
          dish: dish,
          text: result
        }]
      });
    }

  } catch (error) {
    console.error("Generate recipe by dish error:", error.message);
    
    let errorMsg = "Recipe service failed";
    if (error.response?.status === 401) {
      errorMsg = "API authentication failed";
    } else if (error.response?.status === 429) {
      errorMsg = "Rate limit exceeded";
    } else if (error.code === 'ECONNREFUSED') {
      errorMsg = "Cannot connect to recipe service";
    }
    
    res.status(500).json({ 
      error: errorMsg,
      details: error.message
    });
  }
};

exports.getRecipesFromIngredients = async (req, res) => {
  try {
    const { ingredients } = req.body;
    
    if (!ingredients) {
      return res.status(400).json({ error: "Ingredients required" });
    }

    if (!process.env.OPENROUTER_KEY) {
      return res.status(500).json({ 
        error: "API key not configured",
        details: "Missing OPENROUTER_KEY in environment variables"
      });
    }

    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "openai/gpt-4o-mini",
        messages: [
          {
            role: "user",
            content: `I have these ingredients: ${ingredients}.
Generate 5 complete recipes I can make.
For each recipe, provide:
1. Recipe name (dish)
2. Ingredients (use the ones I provided + any common pantry items)
3. Cooking time (e.g., "30 minutes")
4. Difficulty level (Easy/Medium/Hard)
5. Step-by-step instructions (numbered steps)
6. Serving size (e.g., "Serves 4")
7. Pro tips (optional cooking tips)

Format as JSON array with these exact keys for each item: dish, ingredients, cookingTime, difficultyLevel, instructions, servingSize, tips.
For ingredients, use array format with objects like [{name: "item", quantity: "amount"}, ...].
For instructions, use array of strings for each step.
For tips, use array of strings or a single string.`
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

    const result = response.data.choices[0].message.content;
    
    try {
      // Clean up markdown formatting if present (```json...\n...\n```)
      let cleanedResult = result;
      if (result.includes('```')) {
        cleanedResult = result
          .replace(/```json\n?/g, '')
          .replace(/```\n?/g, '')
          .trim();
      }
      
      const recipes = JSON.parse(cleanedResult);
      res.json({
        success: true,
        recipes: Array.isArray(recipes) ? recipes : [recipes]
      });
    } catch (parseError) {
      console.error("JSON Parse Error:", parseError.message);
      console.error("Result was:", result.substring(0, 200));
      
      // If JSON parsing fails, return raw text as recipes
      res.json({
        success: true,
        recipes: [{ text: result }]
      });
    }

  } catch (error) {
    console.error("Recipe from ingredients error:", error.message);
    
    let errorMsg = "Recipe service failed";
    if (error.response?.status === 401) {
      errorMsg = "API authentication failed";
    } else if (error.response?.status === 429) {
      errorMsg = "Rate limit exceeded";
    } else if (error.code === 'ECONNREFUSED') {
      errorMsg = "Cannot connect to recipe service";
    }
    
    res.status(500).json({ 
      error: errorMsg,
      details: error.message
    });
  }
};
