import React from "react";

const RecipeCard = ({ recipe, dishName, onClose }) => {
  return (
    <div className="recipe-card">
      <div className="recipe-header">
        <h2>🍽️ {dishName}</h2>
        {onClose && (
          <button className="close-btn" onClick={onClose}>
            ✕
          </button>
        )}
      </div>
      <div className="recipe-content">
        <pre className="recipe-text">{recipe}</pre>
      </div>
    </div>
  );
};

export default RecipeCard;
