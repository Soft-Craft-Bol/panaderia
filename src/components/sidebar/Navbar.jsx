import React, { useState } from "react";
import { FaBell, FaMoon, FaSun, FaShoppingCart } from "react-icons/fa";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import { useCarrito } from "../../context/CarritoContext";
import Carrito from "../modal/CarritoModal";
import "./Navbar.css";

const Navbar = ({ sidebarOpen, toggleSidebar }) => {
  const { theme, toggleTheme } = useTheme();
  const { currentUser } = useAuth();
  const { carrito } = useCarrito();
  const [mostrarCarrito, setMostrarCarrito] = useState(false);

  const toggleCarrito = () => {
    setMostrarCarrito(!mostrarCarrito);
  };

  return (
    <>
      <nav className="navbar">
        {currentUser ? (
          <>
            <div className="navbar-left">
            </div>

            <div className="navbar-right">
              <div className="theme-switch" onClick={toggleTheme}>
                {theme === "light" ? <FaMoon className="iconN" /> : <FaSun className="iconN" />}
              </div>

              <FaBell className="iconN" />

              <div className="carrito-icon" onClick={toggleCarrito}>
                <FaShoppingCart className="iconN" />
                {carrito.length > 0 && <span className="carrito-contador">{carrito.length}</span>}
              </div>

              {mostrarCarrito && <Carrito onClose={toggleCarrito} />}

              <div className="profile-container">
                <img
                  src={currentUser.photo || "ruta/de/foto/por/defecto.jpg"}
                  alt="Profile"
                  style={{ width: "40px", height: "40px", borderRadius: "50%",objectFit:"cover", marginLeft:"10px" }}
                />
                <span>{currentUser.full_name}</span>
              </div>
            </div>{/*/navbar-right*/}
          </>
        ) : (
          <div className="navbar-right">
            <div className="theme-switch" onClick={toggleTheme}>
              {theme === "light" ? <FaMoon className="iconN" /> : <FaSun className="iconN" />}
            </div>
          </div>
        )}
      </nav>
    </>
  );
};

export default Navbar;
