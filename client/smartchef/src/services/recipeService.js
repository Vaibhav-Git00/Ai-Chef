import axios from "axios";
import API_BASE from "../config/api";

const recipeService = {
  // Upload image
  uploadImage: (imageFile) => {
    const formData = new FormData();
    formData.append("image", imageFile);
    return axios.post(`${API_BASE}/image/upload`, formData);
  },

  // Detect ingredients and get dishes
  detectDish: (imageUrl) => {
    return axios.post(`${API_BASE}/smart/from-image`, { imageUrl });
  },

  // Get recipe detail
  getRecipeDetail: (dish) => {
    return axios.post(`${API_BASE}/recipe/detail`, { dish });
  },

  // Generate recipe by dish name
  generateRecipe: (dish) => {
    return axios.post(`${API_BASE}/recipe/generate`, { dish });
  },

  // Get nutrition
  getNutrition: (dish) => {
    return axios.post(`${API_BASE}/nutrition/get-nutrition`, { dish });
  },

  // Get suggestions from ingredients
  getSuggestedDishes: (ingredients) => {
    return axios.post(`${API_BASE}/recipe/get-recipes`, { ingredients });
  },

  // Get recipes from ingredients
  getRecipesFromIngredients: (ingredients) => {
    return axios.post(`${API_BASE}/recipe`, { ingredients });
  },

  // Generate grocery list
  generateGroceryList: (ingredients, dietType, allergies) => {
    return axios.post(`${API_BASE}/grocery/generate`, {
      ingredients,
      dietType,
      allergies
    });
  },

  // Generate grocery list from recipe
  generateGroceryListFromRecipe: (recipe, dietType, allergies) => {
    return axios.post(`${API_BASE}/grocery/from-recipe`, {
      recipe,
      dietType,
      allergies
    });
  }
};

export default recipeService;
