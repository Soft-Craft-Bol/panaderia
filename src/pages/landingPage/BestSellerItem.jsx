import React from 'react';

const BestSellerItem = ({ image, name, weight, rating }) => {
  return (
    <div className="bestseller-card">
      <img src={image} alt={name} />
      <h4>{name}</h4>
      <p>{weight}</p>
      <div className="rating">
        {Array.from({ length: 5 }).map((_, i) => (
          <span key={i}>❤</span> // o usa una estrella si prefieres ⭐
        ))}
        <span className="rating-score">{rating.toFixed(1)} Rating</span>
      </div>
    </div>
  );
};

export default BestSellerItem;
