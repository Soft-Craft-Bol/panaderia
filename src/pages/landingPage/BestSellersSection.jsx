import React from 'react';
import BestSellerItem from './BestSellerItem';
import vanilla from '../../assets/img/04f731e0873f3429b6a692680ae23f13.png';
import muffin from '../../assets/img/pan11.jpg';
import chocolate from '../../assets/img/04f731e0873f3429b6a692680ae23f13.png';
import coffee from '../../assets/img/panHD.jpg';
import cheesecake from '../../assets/img/pan11.jpg';

import './BestSellersSection.css';

const bestSellers = [
  { image: vanilla, name: 'Cupcake de vainilla', weight: '100g/unidad', rating: 4.0 },
  { image: muffin, name: 'Muffin de chocolate', weight: '110g/unidad', rating: 4.0 },
  { image: chocolate, name: 'Pasteles de chocolate', weight: '150g/unidad', rating: 4.0 },
  { image: coffee, name: 'Pastel de café', weight: '170g/unidad', rating: 4.0 },
  { image: cheesecake, name: 'Rebanada de cheesecake', weight: '150g/unidad', rating: 4.0 },
];

const BestSellersSection = () => {
  return (
    <section className="bestsellers">
      <div className="bestsellers-header">
        <h2>Nuestros más vendidos...</h2>
        <p>
          Te presentamos nuestras creaciones más queridas. La suavidad y dulzura de nuestros productos
          harán que quieras volver por más. ¡Explora nuestra variedad de panes y postres!
        </p>
      </div>
      <div className="bestsellers-list">
        {bestSellers.map((item, index) => (
          <BestSellerItem key={index} {...item} />
        ))}
      </div>
    </section>
  );
};

export default BestSellersSection;
