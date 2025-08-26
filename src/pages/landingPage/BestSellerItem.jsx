import React from 'react';
import './BestSellerItem.css'; // Crea este archivo para los estilos

const BestSellerItem = ({ image, name, price, soldCount, rating }) => {
  // Calcula estrellas llenas y vacías
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  return (
    <div className="bestseller-card">
      <img src={image} alt={name} className="product-image" />
      <h4 className="product-name">{name}</h4>
      <p className="product-price">{price}</p>
      <p className="product-sold">{soldCount}</p>
      <div className="rating-stars">
        {/* {[...Array(fullStars)].map((_, i) => (
          <span key={`full-${i}`} className="star">★</span>
        ))}
        
        {hasHalfStar && <span className="star">½</span>}
        
        {[...Array(emptyStars)].map((_, i) => (
          <span key={`empty-${i}`} className="star">☆</span>
        ))}
        
        <span className="rating-score">({rating.toFixed(1)})</span> */}
      </div>
    </div>
  );
};

export default BestSellerItem;