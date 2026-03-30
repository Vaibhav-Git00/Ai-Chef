import React from "react";

const DishCard = ({ dish, index, onClick }) => {
  return (
    <div
      className="dish-card"
      onClick={onClick}
    >
      <div className="dish-number">{index + 1}</div>
      <div className="dish-content">
        <p className="dish-text">{dish}</p>
        <span className="view-recipe">View Recipe →</span>
      </div>
    </div>
  );
};

export default DishCard;
