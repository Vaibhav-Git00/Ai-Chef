import React from "react";

const NutritionCard = ({ nutrition, dishName }) => {
  return (
    <div className="nutrition-card">
      <div className="nutrition-header">
        <h3>🥗 Nutrition Info</h3>
        {dishName && <p className="dish-name">{dishName}</p>}
      </div>
      <div className="nutrition-content">
        <pre className="nutrition-text">{nutrition}</pre>
      </div>
    </div>
  );
};

export default NutritionCard;
