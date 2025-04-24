import React, { useEffect, useRef, useState } from 'react';
import torat from '../../assets/img/04f731e0873f3429b6a692680ae23f13.png';
import pan from '../../assets/img/panHD.jpg';
import pan11 from '../../assets/img/pan11.jpg';
import './HeroSection.css';

const carouselImages = [pan, torat, torat, pan11, pan]; // Puedes cambiar o cargar dinámicamente

const HeroSection = () => {
  const carouselRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const visibleImages = 2;

  useEffect(() => {
    const el = carouselRef.current;
    let interval;

    if (carouselImages.length > visibleImages && el) {
      interval = setInterval(() => {
        const imageWidth = el.querySelector('img')?.offsetWidth + 10;
        const nextIndex = (currentIndex + 1) % (carouselImages.length - visibleImages + 1);
        el.scrollTo({
          left: nextIndex * imageWidth,
          behavior: 'smooth',
        });
        setCurrentIndex(nextIndex);
      }, 3000);
    }

    return () => clearInterval(interval);
  }, [currentIndex]);

  return (
    <section className="hero">
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
          <button className="order-btn">Ordenar ahora</button>
          <button className="menu-btn">Ver menú completo</button>
        </div>
      </div>

      <div className="hero-image">
        <img src={torat} alt="Pastel de chocolate" className="main-image" />
        <div className="carousel-preview" ref={carouselRef}>
          {carouselImages.map((img, index) => (
            <img key={index} src={img} alt={`Producto ${index + 1}`} />
          ))}
        </div>
        {carouselImages.length > visibleImages && (
          <div className="carousel-nav">
            ← {currentIndex + 1}/{carouselImages.length - visibleImages + 1} →
          </div>
        )}
      </div>
    </section>
  );
};

export default HeroSection;
