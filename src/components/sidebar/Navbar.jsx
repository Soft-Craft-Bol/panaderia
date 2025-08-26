import React, { useState, useEffect, useMemo } from "react";
import { FaMoon, FaSun, FaEllipsisV, FaUserCog, FaUser, FaSignOutAlt } from "react-icons/fa";
import { useTheme } from "../../context/ThemeContext";
import inpasep from "../../assets/img/inpased.png";
import { Link, useNavigate } from "react-router-dom";
import { getUser, signOut } from "../../utils/authFunctions";
import "./Navbar.css";

const Navbar = () => {
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const currentUser = useMemo(() => getUser(), []);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const userPhoto = currentUser?.photo || "https://res.cloudinary.com/dzizafv5s/image/upload/v1740519413/ga7kshmedsl7hmudb5k2.jpg";

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.profile-container') && !e.target.closest('.dropdown-menu')) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const handleSignOut = () => {
    signOut();
    navigate("/");
  };

  return (
    <nav className={`navbar ${isScrolled ? "scrolled" : ""}`}>
      <div className="navbar-brand">
        <Link to="/" className="logo">
          <img src={inpasep} alt="logo" />
        </Link>
      </div>

      <div className="navbar-right">
        <div className="theme-switch" onClick={toggleTheme}>
          {theme === "light" ? (
            <FaMoon className="iconN" title="Modo oscuro" />
          ) : (
            <FaSun className="iconN" title="Modo claro" />
          )}
        </div>

        <div className="config-icon mobile-only" onClick={() => navigate("/configuraciones")}>
          <FaEllipsisV className="iconN" />
        </div>

        <div className="profile-container" onClick={() => setShowDropdown(!showDropdown)}>
          <img src={userPhoto} alt="Profile" />
          <span className="profile-name">{currentUser?.username}</span>
        </div>

        {showDropdown && (
          <div className="dropdown-menu">
            <Link to="/user-profile" className="dropdown-item">
              <FaUser /> Mi perfil
            </Link>
            <Link to="/configuraciones" className="dropdown-item">
              <FaUserCog /> Configuraciones
            </Link>
            <button className="dropdown-item logout" onClick={handleSignOut}>
              <FaSignOutAlt /> Cerrar sesión
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;