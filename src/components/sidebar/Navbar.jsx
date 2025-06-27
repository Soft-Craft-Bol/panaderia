import React, { useState, useEffect, useMemo } from "react";
import { FaMoon, FaSun, FaShoppingCart } from "react-icons/fa";
import { useTheme } from "../../context/ThemeContext";
import { useCarrito } from "../../context/CarritoContext";
import Carrito from "../modal/CarritoModal";
import "./Navbar.css";
import inpasep from "../../assets/img/inpased.png";
import { Link } from "react-router-dom";
import { getUser, signOut } from "../../utils/authFunctions";
import { TbLogout } from "react-icons/tb";

const Navbar = () => {
  const { theme, toggleTheme } = useTheme();
  const { carrito } = useCarrito();
  const currentUser = useMemo(() => getUser(), []);
  const [mostrarCarrito, setMostrarCarrito] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const userPhoto = currentUser?.photo || "https://res.cloudinary.com/dzizafv5s/image/upload/v1740519413/ga7kshmedsl7hmudb5k2.jpg";

  const toggleCarrito = () => {
    setMostrarCarrito(!mostrarCarrito);
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`navbar ${isScrolled ? 'scrolled' : ''}`}>
      <div className="navbar-brand">
        <Link to="/" className="logo">
          <img src={inpasep} alt="logo" />
        </Link>
      </div>

      <div className="navbar-right">
        <div className="theme-switch" onClick={toggleTheme}>
          {theme === "light" ? <FaMoon className="iconN" /> : <FaSun className="iconN" />}
        </div>

        <button className="icon-button carrito-icon" onClick={toggleCarrito}>
          <FaShoppingCart className="iconN" />
          {carrito.length > 0 && <span className="carrito-contador">{carrito.length}</span>}
        </button>

        <div className="profile-container">
          <img src={userPhoto} alt="Profile" />
          <span className="profile-name">{currentUser?.username}</span>
        </div>
        
        <Link to="/" onClick={signOut} className="logout-button">
          <TbLogout className="iconN" />
        </Link>
      </div>

      {mostrarCarrito && <Carrito onClose={toggleCarrito} />}
    </nav>
  );
};

export default Navbar;