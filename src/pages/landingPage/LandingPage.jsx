import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, useAnimation } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import './LandingPage.css';
import MapComponent from '../../components/map/MapComponent';
import { useNavigate } from 'react-router-dom';
import SucursalMapSection from './SucursalMapSection';
// Importa tus imágenes aquí
import inpasedLogo from '../../assets/img/inpased.png';
import panIntegral from '../../assets/img/pan10.jpg';
import panLeche from '../../assets/img/pan6.jpg';
import empanadaPollo from '../../assets/img/pan7.jpg';
import panDestacado from '../../assets/img/panHD.jpg';
import HeroSection from './HeroSection';
import BestSellersSection from './BestSellersSection';
import NavbarPublic from './NavbarPublic';
import Footer from './Footer';

const LandingPage = () => {
  const controls = useAnimation();
  const [ref, inView] = useInView({
    threshold: 0.1,
    triggerOnce: false
  });
  const navigator = useNavigate();

  useEffect(() => {
    if (inView) {
      controls.start('visible');
    }
  }, [controls, inView]);

  // Animaciones
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5
      }
    }
  };
  const handleLogin = () => {
    navigator('/login');
  }
  const handleInicio = () => {
    navigator('/home');
  }

  return (
    <div className="landing-page">
      <NavbarPublic />
      <HeroSection />
      <BestSellersSection/>

      <section className="hero-section">
        <div className="hero-content">
          <motion.img 
            src={inpasedLogo} 
            alt="Inpased Logo"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8 }}
          />
          <motion.h1
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            Panadería con tradición boliviana
          </motion.h1>
          <motion.p
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            Elaboramos con amor los mejores panes desde 1985
          </motion.p>
        </div>
      </section>

      {/* Features Section */}

      <section className="features-section">
        <div className="section-container">
          <h2 className="section-title">¿Por qué elegirnos?</h2>
          <p className="section-subtitle">Calidad y tradición en cada producto</p>
          
          <motion.div 
            className="features-grid"
            variants={containerVariants}
            initial="hidden"
            animate={controls}
            ref={ref}
          >
            <motion.div className="feature-card" variants={itemVariants}>
              <div className="feature-icon">
                <i className="fas fa-bread-slice"></i>
              </div>
              <h3>Ingredientes naturales</h3>
              <p>Utilizamos solo los mejores ingredientes naturales, sin conservantes ni aditivos artificiales.</p>
            </motion.div>
            
            <motion.div className="feature-card" variants={itemVariants}>
              <div className="feature-icon">
                <i className="fas fa-heart"></i>
              </div>
              <h3>Hecho con amor</h3>
              <p>Cada producto es elaborado artesanalmente con técnicas tradicionales transmitidas por generaciones.</p>
            </motion.div>
            
            <motion.div className="feature-card" variants={itemVariants}>
              <div className="feature-icon">
                <i className="fas fa-leaf"></i>
              </div>
              <h3>Opciones saludables</h3>
              <p>Ofrecemos variedades integrales, sin gluten y bajas en azúcar para cuidar tu salud.</p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Products Section */}
      <section className="products-section">
        <div className="section-container">
          <h2 className="section-title">Nuestros productos destacados</h2>
          <p className="section-subtitle">Conoce algunas de nuestras especialidades</p>
          
          <div className="products-grid">
            <motion.div 
              className="product-card"
              whileHover={{ y: -10, boxShadow: "0 10px 20px rgba(0,0,0,0.1)" }}
            >
              <div className="product-image">
                <img src={panIntegral} alt="Pan Integral Especial" />
              </div>
              <div className="product-info">
                <h3>Pan Integral Especial</h3>
                <p>Elaborado con harina integral orgánica y semillas naturales.</p>
                <button className="btn-primary">Ver más</button>
              </div>
            </motion.div>
            
            <motion.div 
              className="product-card"
              whileHover={{ y: -10, boxShadow: "0 10px 20px rgba(0,0,0,0.1)" }}
            >
              <div className="product-image">
                <img src={panLeche} alt="Pan de Leche Suave" />
              </div>
              <div className="product-info">
                <h3>Pan de Leche Suave</h3>
                <p>Especialmente suave y esponjoso, perfecto para el desayuno.</p>
                <button className="btn-primary">Ver más</button>
              </div>
            </motion.div>
            
            <motion.div 
              className="product-card"
              whileHover={{ y: -10, boxShadow: "0 10px 20px rgba(0,0,0,0.1)" }}
            >
              <div className="product-image">
                <img src={empanadaPollo} alt="Empanada de Pollo" />
              </div>
              <div className="product-info">
                <h3>Empanada de Pollo</h3>
                <p>Rellena con pollo desmenuzado y especias tradicionales.</p>
                <button className="btn-primary">Ver más</button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Location Section */}
      <SucursalMapSection />

      <Footer/>
    </div>
  );
};

export default LandingPage;