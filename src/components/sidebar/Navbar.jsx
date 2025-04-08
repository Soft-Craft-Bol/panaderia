import React, { useState, useEffect, Suspense } from "react";
import { FaBell, FaMoon, FaSun, FaShoppingCart, FaBars, FaTimes } from "react-icons/fa";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import { useCarrito } from "../../context/CarritoContext";
import Carrito from "../modal/CarritoModal";
import "./Navbar.css";
import loadImage from "../../assets/ImagesApp";
import { Link } from "react-router-dom";
import { useSidebar } from "../../context/SidebarContext";
import { signOut } from "../../utils/authFunctions";
import { TbLogout } from "react-icons/tb";

const useImageLoader = (imageName) => {
  const [image, setImage] = useState(null);

  useEffect(() => {
    loadImage(imageName).then((img) => setImage(img.default));
  }, [imageName]);

  return image;
};

const Navbar = ({ sidebarOpen, toggleSidebar }) => {
  const { theme, toggleTheme } = useTheme();
  const { currentUser } = useAuth();
  const { carrito } = useCarrito();
  const [mostrarCarrito, setMostrarCarrito] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const sucursalImg = useImageLoader("inpased");
  const userPhoto = currentUser?.photo || "https://res.cloudinary.com/dzizafv5s/image/upload/v1740519413/ga7kshmedsl7hmudb5k2.jpg";

  const toggleCarrito = () => {
    setMostrarCarrito(!mostrarCarrito);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <nav className={`navbar ${isScrolled ? 'scrolled' : ''}`}>
        <div className="navbar-brand">
        <button className="sidebar-toggle" onClick={toggleSidebar}>
            {sidebarOpen ? <FaTimes className="iconN" /> : <FaBars className="iconN" />}
          </button>
          <Link to="/" className="logo">
            <img src={sucursalImg} alt="logo" />
          </Link>
        </div>

        {/* Menú principal (oculto en móvil cuando el menú está cerrado) */}
        <div className={`navbar-links ${mobileMenuOpen ? 'active' : ''}`}>
          {currentUser ? (
            <>
              <div className="navbar-left">
                {/* Contenido del lado izquierdo para usuarios logeados */}
              </div>

              <div className="navbar-right">
                <div className="theme-switch" onClick={toggleTheme}>
                  {theme === "light" ? <FaMoon className="iconN" /> : <FaSun className="iconN" />}
                </div>

                <button className="icon-button">
                  <FaBell className="iconN" />
                </button>

                <button className="icon-button carrito-icon" onClick={toggleCarrito}>
                  <FaShoppingCart className="iconN" />
                  {carrito.length > 0 && <span className="carrito-contador">{carrito.length}</span>}
                </button>

                <div className="profile-container">
                  <img
                    src={userPhoto}
                    alt="Profile"
                  />
                  <span className="profile-name">{currentUser.full_name}</span>
                </div>
                    <Link to="/" onClick={signOut}>
                      <Suspense fallback={<span>...</span>}>
                        <i className="icon-logout"><TbLogout /></i>
                      </Suspense>
                    </Link>
              </div>

            </>
          ) : (
            <>
              <div className="navbar-left">
                <Link to="/" className="navbar-link">Home</Link>
                <Link to="/product" className="navbar-link">Productos</Link>
              </div>

              <div className="navbar-right">
                <Link to="/register" className="navbar-link register-link">Registrarse</Link>
                <Link to="/login" className="navbar-link login-link">Iniciar Sesión</Link>
              </div>
            </>
          )}
        </div>

        {/* Carrito (siempre visible) */}
        {mostrarCarrito && <Carrito onClose={toggleCarrito} />}
      </nav>
    </>
  );
};

export default Navbar;