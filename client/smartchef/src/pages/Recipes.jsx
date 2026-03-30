import React, { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Loader, ChefHat } from "lucide-react";
import recipeService from "../services/recipeService";
import GlobalLayout from "../layouts/GlobalLayout";
import { useToast } from "../contexts/ToastContext";

const Recipes = () => {
  const location = useLocation();
  const toastShownRef = useRef(false);
  const [input, setInput] = useState("");
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchType, setSearchType] = useState("ingredients"); // dish or ingredients
  const { success, error: showError } = useToast();

  // Pre-populate ingredients from upload flow - show toast only once
  useEffect(() => {
    if (location.state?.ingredients && !toastShownRef.current) {
      setInput(location.state.ingredients);
      setSearchType("ingredients");
      success("Ingredients detected from your upload! Ready to generate recipes");
      toastShownRef.current = true;
    }
  }, [location.state?.ingredients]);

  // Reset toast flag when user manually navigates back to recipes
  useEffect(() => {
    if (!location.state?.ingredients) {
      toastShownRef.current = false;
    }
  }, [location.state]);

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!input.trim()) {
      showError("Please enter a dish or ingredients");
      return;
    }

    setLoading(true);

    try {
      console.log(`👨‍🍳 Generating ${searchType} recipe for:`, input);

      let response;
      if (searchType === "dish") {
        console.log("📍 Using recipe/generate endpoint");
        response = await recipeService.generateRecipe(input);
      } else {
        console.log("📍 Using recipe from ingredients endpoint");
        response = await recipeService.getRecipesFromIngredients(input);
      }

      console.log("✅ Response received:", response);

      // Extract recipe data from axios response
      // axios wraps response in .data property
      const recipes = response.data.recipes || response.data.dishes || [];
      
      if (!recipes || recipes.length === 0) {
        showError("No recipes found. Try different ingredients or dish name.");
        setRecipes([]);
      } else {
        setRecipes(Array.isArray(recipes) ? recipes : [recipes]);
        success("Recipe generated successfully! 🎉");
      }
      console.log("🎉 Recipe generation complete");
    } catch (err) {
      console.error("❌ Recipe generation error:", err);
      showError(err || "Failed to generate recipe");
    } finally {
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <GlobalLayout>
      <motion.div
        className="space-y-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header */}
        <motion.div variants={itemVariants}>
          <h1 className="text-4xl font-bold text-white mb-2">👨‍🍳 Recipe Generator</h1>
          <p className="text-white/60">Generate recipes for dishes or from ingredients</p>
        </motion.div>

        {/* Search Form */}
        <motion.div
          variants={itemVariants}
          className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-8"
        >
          <form onSubmit={handleGenerate} className="space-y-6">
            {/* Search Type Toggle */}
            <div className="flex gap-4">
              {[
                { value: "dish", label: "🍽️ By Dish" },
                { value: "ingredients", label: "🥗 By Ingredients" },
              ].map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setSearchType(option.value)}
                  className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-all ${
                    searchType === option.value
                      ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg"
                      : "bg-white/5 text-white/60 hover:text-white border border-white/10"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>

            {/* Input */}
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                {searchType === "dish" ? "Dish Name" : "Ingredients"}
              </label>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={
                  searchType === "dish"
                    ? "e.g., Pasta Carbonara"
                    : "e.g., chicken, tomato, garlic"
                }
                className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-purple-500 focus:bg-white/10 transition-all"
              />
            </div>

            {/* Error */}
            {/* Error handling is now managed by toast notifications - removed old error display */}

            {/* Button */}
            <motion.button
              type="submit"
              disabled={loading || !input}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <ChefHat className="w-5 h-5" />
                  Generate Recipe
                </>
              )}
            </motion.button>
          </form>
        </motion.div>

        {/* Results */}
        {loading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="backdrop-blur-xl bg-gradient-to-br from-purple-600/30 to-pink-600/30 border border-white/20 rounded-3xl p-12 shadow-2xl"
          >
            <div className="flex flex-col items-center justify-center gap-6">
              <div className="relative w-24 h-24">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 border-4 border-transparent border-t-purple-400 border-r-pink-400 rounded-full"
                />
                <div className="absolute inset-2 flex items-center justify-center text-4xl">
                  👨‍🍳
                </div>
              </div>
              <div className="text-center">
                <h3 className="text-2xl font-bold text-white mb-2">Generating Recipe...</h3>
                <p className="text-white/60">Our AI chef is preparing an amazing recipe for you</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Results */}
        {recipes.length > 0 && (
          <motion.div
            variants={itemVariants}
            className="space-y-8"
          >
            {recipes.map((recipe, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="backdrop-blur-xl bg-gradient-to-br from-white/10 to-white/5 border border-white/20 rounded-3xl overflow-hidden shadow-2xl hover:shadow-purple-500/20 transition-all"
              >
                {/* Header with Dish Name and Quick Stats */}
                <div className="bg-gradient-to-r from-purple-600/40 to-pink-600/40 border-b border-white/10 p-8">
                  <h2 className="text-4xl font-bold text-white mb-6">
                    🍳 {recipe.dish}
                  </h2>

                  {/* Quick Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {(recipe.cookingTime || recipe.cookTime) && (
                      <motion.div
                        className="bg-white/10 backdrop-blur border border-white/20 rounded-2xl p-4 hover:bg-white/15 transition-all"
                        whileHover={{ y: -2 }}
                      >
                        <p className="text-white/60 text-sm font-medium mb-1">⏱️ Time</p>
                        <p className="text-white font-bold text-lg">{recipe.cookingTime || recipe.cookTime}</p>
                      </motion.div>
                    )}
                    
                    {(recipe.difficultyLevel || recipe.difficulty) && (
                      <motion.div
                        className="bg-white/10 backdrop-blur border border-white/20 rounded-2xl p-4 hover:bg-white/15 transition-all"
                        whileHover={{ y: -2 }}
                      >
                        <p className="text-white/60 text-sm font-medium mb-1">📊 Level</p>
                        <p className="text-white font-bold text-lg">{recipe.difficultyLevel || recipe.difficulty}</p>
                      </motion.div>
                    )}
                    
                    {(recipe.servingSize || recipe.servings) && (
                      <motion.div
                        className="bg-white/10 backdrop-blur border border-white/20 rounded-2xl p-4 hover:bg-white/15 transition-all"
                        whileHover={{ y: -2 }}
                      >
                        <p className="text-white/60 text-sm font-medium mb-1">👥 Servings</p>
                        <p className="text-white font-bold text-lg">{recipe.servingSize || recipe.servings}</p>
                      </motion.div>
                    )}
                  </div>
                </div>

                {/* Main Content */}
                <div className="p-8 space-y-8">
                  {/* Ingredients Section */}
                  {recipe.ingredients && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 + 0.1 }}
                    >
                      <div className="flex items-center gap-3 mb-6">
                        <div className="bg-green-500/30 p-3 rounded-xl">
                          <span className="text-2xl">📋</span>
                        </div>
                        <h3 className="text-2xl font-bold text-green-300">Ingredients</h3>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {Array.isArray(recipe.ingredients) && recipe.ingredients.length > 0 && recipe.ingredients.map((ingredient, i) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.1 + 0.15 + i * 0.03 }}
                            className="flex items-start gap-3 p-4 bg-green-500/10 border border-green-500/20 rounded-xl hover:bg-green-500/15 hover:border-green-500/40 transition-all"
                          >
                            <span className="text-green-400 text-xl pt-1 flex-shrink-0">•</span>
                            <div className="flex-1">
                              <span className="text-white/80 font-medium">
                                {typeof ingredient === 'string' ? ingredient : ingredient.name}
                              </span>
                              {ingredient.quantity && (
                                <span className="text-green-300 text-sm ml-2">({ingredient.quantity})</span>
                              )}
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {/* Steps Section */}
                  {(recipe.steps || recipe.instructions) && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 + 0.2 }}
                    >
                      <div className="flex items-center gap-3 mb-6">
                        <div className="bg-blue-500/30 p-3 rounded-xl">
                          <span className="text-2xl">👨‍🍳</span>
                        </div>
                        <h3 className="text-2xl font-bold text-blue-300">Cooking Steps</h3>
                      </div>
                      <div className="space-y-3">
                        {(recipe.steps || recipe.instructions || []).map((step, i) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 + 0.25 + i * 0.05 }}
                            className="flex gap-4 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl hover:bg-blue-500/15 hover:border-blue-500/40 transition-all"
                          >
                            <div className="flex-shrink-0 w-10 h-10 bg-blue-500/30 rounded-full flex items-center justify-center border border-blue-500/50">
                              <span className="text-blue-300 font-bold">{i + 1}</span>
                            </div>
                            <p className="text-white/80 font-medium pt-1">{step}</p>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {/* Tips Section */}
                  {recipe.tips && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 + 0.3 }}
                      className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-2xl p-6 hover:border-yellow-500/60 transition-all"
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-3xl mt-1">💡</span>
                        <div>
                          <h3 className="text-xl font-bold text-yellow-300 mb-2">Pro Tips</h3>
                          {Array.isArray(recipe.tips) ? (
                            <ul className="space-y-2">
                              {recipe.tips.map((tip, i) => (
                                <li key={i} className="text-white/80 leading-relaxed flex gap-2">
                                  <span className="text-yellow-400">•</span>
                                  <span>{tip}</span>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-white/80 leading-relaxed">{recipe.tips}</p>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Full Text Fallback */}
                  {recipe.fullText && recipe.ingredients.length === 0 && recipe.steps.length === 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 + 0.2 }}
                      className="bg-white/5 border border-white/10 rounded-2xl p-6"
                    >
                      <p className="text-white/80 whitespace-pre-wrap leading-relaxed">{recipe.fullText}</p>
                    </motion.div>
                  )}
                </div>

                {/* Footer Actions */}
                <div className="bg-white/5 border-t border-white/10 p-6 flex gap-4 flex-wrap">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex-1 min-w-48 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold py-3 rounded-xl transition-all shadow-lg transform hover:shadow-xl"
                  >
                    ❤️ Save Recipe
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex-1 min-w-48 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold py-3 rounded-xl transition-all shadow-lg transform hover:shadow-xl"
                  >
                    🛒 Get Ingredients
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Empty State */}
        {recipes.length === 0 && !loading && input && (
          <motion.div
            variants={itemVariants}
            className="min-h-96 backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl flex items-center justify-center"
          >
            <div className="text-center">
              <ChefHat className="w-16 h-16 text-purple-400 mx-auto mb-4 opacity-50" />
              <p className="text-white/60">
                No recipes found. Try different keywords!
              </p>
            </div>
          </motion.div>
        )}

        {/* Initial State */}
        {recipes.length === 0 && !loading && !input && (
          <motion.div
            variants={itemVariants}
            className="min-h-96 backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl flex items-center justify-center"
          >
            <div className="text-center">
              <ChefHat className="w-16 h-16 text-purple-400 mx-auto mb-4 opacity-50" />
              <p className="text-white/60">
                Enter a dish name or ingredients to get started!
              </p>
            </div>
          </motion.div>
        )}
      </motion.div>
    </GlobalLayout>
  );
};

export default Recipes;
