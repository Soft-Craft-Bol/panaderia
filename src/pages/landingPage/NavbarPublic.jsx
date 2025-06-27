import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import './NavbarPublic.css';
import { useNavigate } from 'react-router-dom';
import inpasedLogo from '../../assets/img/inpased.png';
import { FaBars, FaTimes } from 'react-icons/fa'; // Importar iconos de react-icons

const NavbarPublic = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavigation = (path) => {
    navigate(path);
    setMobileMenuOpen(false);
  };

  return (
    <motion.nav
      className={`navbar1 ${scrolled ? 'scrolled' : ''}`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="navbar1-container">
        <div className="navbar1-brand" onClick={() => handleNavigation('/')}>
          <img src={inpasedLogo} alt="Logo Inpased" className="logo" />
        </div>

        <div className={`navbar1-links ${mobileMenuOpen ? 'active' : ''}`}>
          <Link to="/" className="nav-link" onClick={() => handleNavigation('/')}>Inicio</Link>
          <Link to="/product" className="nav-link">Productos</Link>
          <Link to="/nosotros" className="nav-link">Nosotros</Link>
          <Link to="/contacto" className="nav-link">Contacto</Link>
          <button
            className="btn-login"
            onClick={() => handleNavigation('/login')}
          >
            Iniciar Sesión
          </button>
          <button
            className="btn-register"
            onClick={() => handleNavigation('/register-client')}
          >
            Registrarse
          </button>
        </div>

        <button
          className="mobile-menu-button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Menú móvil"
        >
          {mobileMenuOpen ? <FaTimes /> : <FaBars />}
        </button>

      </div>
    </motion.nav>
  );
};

export default NavbarPublic;