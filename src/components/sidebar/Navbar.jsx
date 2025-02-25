import React, { useState } from "react";
import { FaBell, FaMoon, FaSun, FaShoppingCart } from "react-icons/fa";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import { useCarrito } from "../../context/CarritoContext";
import Carrito from "../modal/CarritoModal";
import "./Navbar.css";
import loadImage from "../../assets/ImagesApp";
import { Link } from "react-router-dom";

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
  const sucursalImg = useImageLoader("inpased");

  const toggleCarrito = () => {
    setMostrarCarrito(!mostrarCarrito);
  };

  return (
    <>
      <nav className="navbar">
        {currentUser ? (
          <>
            <div className="navbar-left">
              {/* Contenido del lado izquierdo para usuarios logeados */}
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
                  style={{ width: "40px", height: "40px", borderRadius: "50%", objectFit: "cover", marginLeft: "10px" }}
                />
                <span>{currentUser.full_name}</span>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="navbar-left">
            <div className="logo">
                <img src={sucursalImg} alt="logo" style={{ width: "100px", height: "40px" }} />
              </div>
              <Link to="/" className="navbar-link">Home</Link>
              <Link to="/product" className="navbar-link">Productos</Link>
              
            </div>

            <div className="navbar-right">
              
            <Link to="/register" className="navbar-link register-link">Register</Link>
              <Link to="/login" className="navbar-link login-link">Login</Link>
            </div>
          </>
        )}
      </nav>
    </>
  );
};

export default Navbar;