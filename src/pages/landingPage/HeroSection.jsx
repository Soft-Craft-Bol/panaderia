import React, { useEffect, useRef, useState } from 'react';
import torat from '../../assets/img/canasta.png';
import pan from '../../assets/img/panHD.jpg';
import pan11 from '../../assets/img/pan11.jpg';
import './HeroSection.css';
import { Navigate } from 'react-router-dom';

const carouselImages = ['https://res.cloudinary.com/dzizafv5s/image/upload/v1753557122/bbtijbf8mgincxda6gnd.jpg',
                       'https://res.cloudinary.com/dzizafv5s/image/upload/v1747692666/ndcdtlxqsahx6kbe0q6g.jpg',
                      'https://res.cloudinary.com/dzizafv5s/image/upload/v1747691866/j8tqjkpkyyx0d8pdl1s8.jpg', 
                      'https://res.cloudinary.com/dzizafv5s/image/upload/v1743861962/eu6tdgdh4vch9gsptztr.jpg', 
                      'https://res.cloudinary.com/dzizafv5s/image/upload/v1747691374/xlzhdsvukyqzmypgux7m.jpg'
                    ]; // Tus imágenes

const HeroSection = () => {
  const carouselRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const visibleImages = 2;

  useEffect(() => {
    const el = carouselRef.current;
    let interval;

    if (carouselImages.length > visibleImages && el) {
      interval = setInterval(() => {
        const nextIndex = (currentIndex + 1) % carouselImages.length;
        setCurrentIndex(nextIndex);
      }, 3000);
    }

    return () => clearInterval(interval);
  }, [currentIndex]);

  useEffect(() => {
    const el = carouselRef.current;
    if (el) {
      const imageWidth = el.querySelector('img')?.offsetWidth + 10;
      el.scrollTo({
        left: currentIndex * imageWidth,
        behavior: 'smooth',
      });
    }
  }, [currentIndex]);

  const goToPrev = () => {
    setCurrentIndex((prev) => 
      prev === 0 ? carouselImages.length - 1 : prev - 1
    );
  };

  const goToNext = () => {
    setCurrentIndex((prev) => 
      prev === carouselImages.length - 1 ? 0 : prev + 1
    );
  };

  return (
    <section className="hero">
      <div className="hero-content">
        <div className="hero-text">
          <h1>
            Llevamos felicidad <br />
            <span>a través de un pedazo de pan</span>
          </h1>
          <p>
            Contáctanos para hacer tu pedido o conocer todas nuestras opciones de panadería y repostería.
            En Inpasep, queremos que disfrutes cada bocado.
          </p>
          <div className="hero-buttons">
            <button className="order-btn" onClick={() => Navigate('/product')}>Ordenar ahora</button>
            <button className="menu-btn">Ver menú completo</button>
          </div>
        </div>

        <div className="hero-visuals">
        <img src={torat} alt="Pastel de chocolate" className="main-image" />
          
          <div className="carousel-container">
            <div className="carousel-track" ref={carouselRef}>
              {carouselImages.map((img, index) => (
                <div 
                  key={index} 
                  className={`carousel-item ${index === currentIndex ? 'active' : ''}`}
                >
                  <img src={img} alt={`Producto ${index + 1}`} />
                </div>
              ))}
            </div>
            
            <div className="carousel-controls">
              <button onClick={goToPrev} className="carousel-arrow">←</button>
              <div className="carousel-indicators">
                {carouselImages.map((_, idx) => (
                  <button
                    key={idx}
                    className={`indicator ${idx === currentIndex ? 'active' : ''}`}
                    onClick={() => setCurrentIndex(idx)}
                  />
                ))}
              </div>
              <button onClick={goToNext} className="carousel-arrow">→</button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;