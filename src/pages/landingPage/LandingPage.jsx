import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, useAnimation } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import './LandingPage.css';
import MapComponent from '../../components/map/MapComponent';
import { useNavigate } from 'react-router-dom';

// Importa tus imágenes aquí
import inpasedLogo from '../../assets/img/inpased.png';
import panIntegral from '../../assets/img/pan10.jpg';
import panLeche from '../../assets/img/pan6.jpg';
import empanadaPollo from '../../assets/img/pan7.jpg';
import panDestacado from '../../assets/img/panHD.jpg';

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
      <div className="navbar">
        <div className="navbar-logo">
          <img src={inpasedLogo} alt="Logo Inpased" />
        </div>
        <div className="navbar-links">
          <Link onClick={handleInicio}  to="/login">Inicio</Link>
          <Link onClick={handleLogin}  to="/login">Login</Link>
        </div>
      </div>
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
      <section className="location-section">
        <div className="section-container">
          <h2 className="section-title">Visítanos</h2>
          <p className="section-subtitle">Encuentra nuestras sucursales</p>
          
          <div className="location-grid">
            <div className="map-container">
              <MapComponent 
                coordinates={[-17.391960268184448, -66.15505311330328]} 
                zoom={16} 
                direccion={"Villa Armonía, La Paz"}
              />
              <div className="location-info">
                <h3>Sucursal Villa Armonía</h3>
                <p>Av. Principal #1234, La Paz</p>
                <p>Horario: 7:00 - 20:00</p>
              </div>
            </div>
            
            <div className="map-container">
              <MapComponent 
                coordinates={[-17.386113530324913, -66.16078969825845]} 
                zoom={16} 
                direccion={"Héroes del Chaco, La Paz"}
              />
              <div className="location-info">
                <h3>Sucursal Héroes del Chaco</h3>
                <p>Calle Comercio #567, La Paz</p>
                <p>Horario: 7:00 - 21:00</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="section-container">
          <h2>¿Listo para probar nuestros productos?</h2>
          <p>Visítanos hoy mismo o contáctanos para pedidos especiales</p>
          <div className="cta-buttons">
            <button className="btn-primary">Ver ubicaciones</button>
            <button className="btn-secondary">Contactar</button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="main-footer">
        <div className="footer-content">
          <div className="footer-logo">
            <img src={inpasedLogo} alt="Inpased" />
            <p>Panadería artesanal desde 1985</p>
          </div>
          
          <div className="footer-links">
            <h3>Enlaces</h3>
            <ul>
              <li><Link to="/">Inicio</Link></li>
              <li><Link to="/productos">Productos</Link></li>
              <li><Link to="/nosotros">Nosotros</Link></li>
              <li><Link to="/contacto">Contacto</Link></li>
            </ul>
          </div>
          
          <div className="footer-contact">
            <h3>Contacto</h3>
            <p>info@inpased.com</p>
            <p>+591 12345678</p>
            <div className="social-icons">
              <a href="#"><i className="fab fa-facebook"></i></a>
              <a href="#"><i className="fab fa-instagram"></i></a>
              <a href="#"><i className="fab fa-whatsapp"></i></a>
            </div>
          </div>
        </div>
        
        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} Inpased. Todos los derechos reservados.</p>
          <p>Desarrollado por <Link to="https://www.softcraftbol.com/">SoftCraft</Link></p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;