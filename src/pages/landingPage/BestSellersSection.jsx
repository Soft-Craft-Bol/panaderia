import React, { useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import BestSellerItem from './BestSellerItem';
import { topvendidos } from '../../service/api';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import './BestSellersSection.css';

const BestSellersSection = () => {
  const { data: response, isLoading, error } = useQuery({
    queryKey: ['top-vendidos'],
    queryFn: topvendidos,
  });

  const sliderRef = useRef(null);

  // Configuración del carrusel
  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    pauseOnHover: true,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 3,
        }
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 2,
        }
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1,
        }
      }
    ]
  };

  // Asegúrate de que bestSellers sea un array
  const bestSellers = Array.isArray(response) ? response : response?.data || [];

  if (isLoading) {
    return <div className="loading">Cargando productos más vendidos...</div>;
  }

  if (error) {
    return <div className="error">Error al cargar los productos más vendidos: {error.message}</div>;
  }

  return (
    <section className="bestsellers">
      <div className="bestsellers-header">
        <h2>Nuestros más vendidos...</h2>
        <p>
          Te presentamos nuestras creaciones más queridas. La suavidad y dulzura de nuestros productos
          harán que quieras volver por más. ¡Explora nuestra variedad de panes y postres!
        </p>
      </div>
      
      <div className="bestsellers-container">
        {bestSellers.length > 0 ? (
          <Slider {...settings} ref={sliderRef}>
            {bestSellers.map((item) => (
              <div key={item.id} className="slider-item">
                <BestSellerItem 
                  image={item.imagen}
                  name={item.descripcion}
                  price={`Bs${item.precioUnitario.toFixed(2)}`}
                  soldCount={`Vendidos: ${item.totalCantidadVendida}`}
                  rating={4.0}
                />
              </div>
            ))}
          </Slider>
        ) : (
          <div className="no-products">No hay productos disponibles</div>
        )}
      </div>
    </section>
  );
};

export default BestSellersSection;