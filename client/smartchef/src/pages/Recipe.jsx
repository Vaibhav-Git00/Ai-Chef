import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import API_BASE from "../config/api";

function Recipe() {
  const location = useLocation();
  const dish = location.state?.dish;

  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        setLoading(true);
        const res = await axios.post(
          `${API_BASE}/recipe/generate`,
          { dish }
        );
        // Backend returns recipes array, get first one
        if (res.data.recipes && res.data.recipes.length > 0) {
          setRecipe(res.data.recipes[0]);
        }
      } catch (error) {
        console.error("Error fetching recipe:", error);
      } finally {
        setLoading(false);
      }
    };

    if (dish) fetchRecipe();
  }, [dish]);

  return (
    <div className="min-h-screen bg-black text-white p-10">
      <h1 className="text-4xl text-green-400 font-bold mb-8">{dish}</h1>

      {loading && (
        <div className="text-gray-300 text-lg">⏳ Generating recipe... This may take a moment...</div>
      )}

      {!loading && recipe && (
        <div className="bg-white/10 p-8 rounded-xl border border-gray-700 space-y-8 max-w-4xl">
          {/* Display as structured JSON if parsed successfully */}
          {typeof recipe.ingredients === 'object' && !recipe.text && (
            <>
              {/* Ingredients */}
              {recipe.ingredients && (
                <div className="border-b border-gray-600 pb-6">
                  <h2 className="text-2xl text-green-400 font-bold mb-4">📋 Ingredients</h2>
                  {Array.isArray(recipe.ingredients) ? (
                    <ul className="text-gray-300 space-y-2">
                      {recipe.ingredients.map((ing, idx) => (
                        <li key={idx} className="flex justify-between items-center">
                          <span>{ing.name || ing}</span>
                          <span className="font-semibold text-green-300">{ing.quantity || ''}</span>
                        </li>
                      ))}
                    </ul>
                  ) : typeof recipe.ingredients === 'object' ? (
                    <ul className="text-gray-300 space-y-2">
                      {Object.entries(recipe.ingredients).map(([ingredient, quantity]) => (
                        <li key={ingredient} className="flex justify-between items-center">
                          <span>{ingredient}</span>
                          <span className="font-semibold text-green-300">{typeof quantity === 'object' ? JSON.stringify(quantity) : quantity}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-300 whitespace-pre-wrap leading-relaxed">{recipe.ingredients}</p>
                  )}
                </div>
              )}

              {/* Cooking Time & Difficulty */}
              <div className="grid grid-cols-2 gap-8 border-b border-gray-600 pb-6">
                {recipe.cookingTime && (
                  <div>
                    <h3 className="text-xl text-green-400 font-bold mb-2">⏱️ Cooking Time</h3>
                    <p className="text-gray-300">{recipe.cookingTime}</p>
                  </div>
                )}
                {recipe.difficultyLevel && (
                  <div>
                    <h3 className="text-xl text-green-400 font-bold mb-2">📊 Difficulty Level</h3>
                    <p className="text-gray-300">{recipe.difficultyLevel}</p>
                  </div>
                )}
              </div>

              {/* Instructions */}
              {recipe.instructions && (
                <div className="border-b border-gray-600 pb-6">
                  <h2 className="text-2xl text-green-400 font-bold mb-4">👨‍🍳 Instructions</h2>
                  {Array.isArray(recipe.instructions) ? (
                    <ol className="text-gray-300 space-y-3 list-decimal list-inside">
                      {recipe.instructions.map((instruction, idx) => (
                        <li key={idx} className="leading-relaxed">{instruction}</li>
                      ))}
                    </ol>
                  ) : (
                    <p className="text-gray-300 whitespace-pre-wrap leading-relaxed">{recipe.instructions}</p>
                  )}
                </div>
              )}

              {/* Serving Size */}
              {recipe.servingSize && (
                <div className="border-b border-gray-600 pb-6">
                  <h3 className="text-xl text-green-400 font-bold mb-2">🍽️ Serving Size</h3>
                  <p className="text-gray-300">{recipe.servingSize}</p>
                </div>
              )}

              {/* Tips */}
              {recipe.tips && (
                <div>
                  <h2 className="text-2xl text-green-400 font-bold mb-4">💡 Tips & Variations</h2>
                  {Array.isArray(recipe.tips) ? (
                    <ul className="text-gray-300 space-y-2 list-disc list-inside">
                      {recipe.tips.map((tip, idx) => (
                        <li key={idx}>{tip}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-300 whitespace-pre-wrap">{recipe.tips}</p>
                  )}
                </div>
              )}
            </>
          )}

          {/* Fallback: Plain text display */}
          {recipe.text && (
            <div className="text-gray-300 whitespace-pre-wrap leading-relaxed text-base">
              {recipe.text}
            </div>
          )}

          {/* Generic fallback if no expected fields */}
          {!recipe.ingredients && !recipe.text && (
            <pre className="text-gray-300 overflow-x-auto bg-black/50 p-4 rounded">
              {JSON.stringify(recipe, null, 2)}
            </pre>
          )}
        </div>
      )}

      {!loading && !recipe && (
        <p className="text-gray-400 text-lg">No recipe data available</p>
      )}
    </div>
  );
}

export default Recipe;
