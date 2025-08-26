import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import './NavbarPublic.css';
import { useNavigate } from 'react-router-dom';
import inpasedLogo from '../../assets/img/inpased.png';
import { FaBars, FaTimes, FaUser, FaSignOutAlt, FaShoppingCart } from 'react-icons/fa';
import { getUser, signOut } from '../../utils/authFunctions';
import { useCarrito } from '../../context/CarritoContext';
import Carrito from '../modal/CarritoModal';

const NavbarPublic = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [mostrarCarrito, setMostrarCarrito] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const { carrito } = useCarrito();
  const navigate = useNavigate();

  useEffect(() => {
    const user = getUser();
    setCurrentUser(user);
  }, [navigate]);

  const handleScroll = () => {
    setScrolled(window.scrollY > 50);
  };

  const toggleCarrito = () => {
    setMostrarCarrito(!mostrarCarrito);
  };


  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavigation = (path) => {
    navigate(path);
    setMobileMenuOpen(false);
  };

  const handleLogout = () => {
    signOut();
    setCurrentUser(null);
    handleNavigation('/');
  };

  const tieneRolAcceso = currentUser?.roles?.some(role =>
    ['ROLE_ADMIN', 'ROLE_VENDEDOR', 'ROLE_MAESTRO', 'ROLE_PANADERO'].includes(role)
  );

  useEffect(() => {
  const handleClickOutside = (event) => {
    if (!event.target.closest('.dropdown')) {
      setShowDropdown(false);
    }
  };
  document.addEventListener('click', handleClickOutside);
  return () => {
    document.removeEventListener('click', handleClickOutside);
  };
}, []);


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
          <Link to="/contacto" className="nav-link">Contacto</Link>

          {currentUser ? (
            <>
              <Link to="/carrito" className="nav-link">Carrito</Link>

              <div
                className="user-profile dropdown"
                onClick={() => setShowDropdown(!showDropdown)}
              >
                <FaUser className="user-icon" />
                <span className="username">{currentUser.firstName || currentUser.username}</span>
                {tieneRolAcceso && showDropdown && (
                  <div className="dropdown-menu">
                    <button onClick={() => handleNavigation('/perfil')} className="dropdown-item">
                      Mi Perfil
                    </button>
                    <button onClick={() => handleNavigation('/home')} className="dropdown-item">
                      Panel de administración
                    </button>
                  </div>
                )}
              </div>
              <button className="icon-button" onClick={toggleCarrito}>
                <FaShoppingCart className="iconN" />
                {carrito.length > 0 && <span className="carrito-contador">{carrito.length}</span>}
              </button>

              <button className="btn-logout" onClick={handleLogout}>
                <FaSignOutAlt /> Cerrar Sesión
              </button>
            </>
          ) : (
            <>
              <button className="btn-login" onClick={() => handleNavigation('/login')}>
                Iniciar Sesión
              </button>
              <button className="btn-register" onClick={() => handleNavigation('/register-client')}>
                Registrarse
              </button>
            </>
          )}


        </div>

        <button
          className="mobile-menu-button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Menú móvil"
        >
          {mobileMenuOpen ? <FaTimes /> : <FaBars />}
        </button>
        {mostrarCarrito && <Carrito onClose={toggleCarrito} />}
      </div>
    </motion.nav>
  );
};

export default NavbarPublic;