const axios = require("axios");

/**
 * Generate grocery list from ingredients
 */
exports.generateGroceryList = async (req, res) => {
    try {
        const { ingredients, dietType, allergies } = req.body;

        if (!ingredients) {
            return res.status(400).json({ error: "Ingredients required" });
        }

        const prompt = `From these ingredients/dishes: ${Array.isArray(ingredients) ? ingredients.join(", ") : ingredients}

Generate a organized grocery list with quantities.

${dietType ? `Diet Type: ${dietType}` : ""}
${allergies && allergies.length > 0 ? `Avoid: ${allergies.join(", ")}` : ""}

Format as:
VEGETABLES:
- Item1 (quantity) - estimated price
- Item2 (quantity) - estimated price

PROTEINS:
- ...

DAIRY:
- ...

GRAINS:
- ...

OTHER:
- ...

TOTAL ESTIMATED COST: $XX

Include quantities and approximate prices.`;

        const response = await axios.post(
            "https://openrouter.ai/api/v1/chat/completions",
            {
                model: "openai/gpt-4o-mini",
                messages: [
                    {
                        role: "user",
                        content: prompt
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

        const groceryList = response.data.choices[0].message.content;

        res.json({
            success: true,
            groceryList
        });

    } catch (error) {
        console.log(error.response?.data || error.message);
        res.status(500).json({ error: "Failed to generate grocery list" });
    }
};

/**
 * Generate grocery list from recipe
 */
exports.generateGroceryListFromRecipe = async (req, res) => {
    try {
        const { recipe, dietType, allergies } = req.body;

        if (!recipe) {
            return res.status(400).json({ error: "Recipe required" });
        }

        const prompt = `From this recipe:
${recipe}

Generate a organized grocery list with quantities for shopping.

${dietType ? `Diet Type: ${dietType}` : ""}
${allergies && allergies.length > 0 ? `Avoid: ${allergies.join(", ")}` : ""}

Format as:
VEGETABLES:
- Item1 (quantity needed) - [$price estimate]
- Item2 (quantity needed) - [$price estimate]

PROTEINS:
- ...

DAIRY:
- ...

GRAINS:
- ...

SPICES & SEASONINGS:
- ...

OTHER:
- ...

TOTAL ESTIMATED COST: $XX

Make it organized and easy to follow while shopping.`;

        const response = await axios.post(
            "https://openrouter.ai/api/v1/chat/completions",
            {
                model: "openai/gpt-4o-mini",
                messages: [
                    {
                        role: "user",
                        content: prompt
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

        const groceryList = response.data.choices[0].message.content;

        res.json({
            success: true,
            groceryList
        });

    } catch (error) {
        console.log(error.response?.data || error.message);
        res.status(500).json({ error: "Failed to generate grocery list" });
    }
};
