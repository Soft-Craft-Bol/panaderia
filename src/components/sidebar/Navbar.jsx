import React, { useState } from 'react';
import { FaSearch, FaBell, FaMoon, FaSun, FaShoppingCart } from 'react-icons/fa';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import CarritoModal from '../modal/CarritoModal';
import './Navbar.css';

const Navbar = ({ sidebarOpen, toggleSidebar }) => {
  const { theme, toggleTheme } = useTheme();
  const { currentUser } = useAuth();
  const [carrito, setCarrito] = useState([]); // Estado para el carrito
  const [showCarritoModal, setShowCarritoModal] = useState(false); // Estado para mostrar el modal del carrito

  const agregarAlCarrito = (producto) => {
    const productoExistente = carrito.find((item) => item.producto.id === producto.id);
    if (productoExistente) {
      setCarrito((prev) =>
        prev.map((item) =>
          item.producto.id === producto.id ? { ...item, cantidad: item.cantidad + 1 } : item
        )
      );
    } else {
      setCarrito((prev) => [...prev, { producto, cantidad: 1 }]);
    }
  };

  const actualizarCantidad = (index, nuevaCantidad) => {
    setCarrito((prev) =>
      prev.map((item, i) =>
        i === index ? { ...item, cantidad: nuevaCantidad } : item
      )
    );
  };

  const eliminarProducto = (index) => {
    setCarrito((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <nav className="navbar">
      {currentUser ? (
        <>
          <div className="navbar-left">
            <div className="search-container">
              <FaSearch className="icon-search" />
              <input type="text" placeholder="Buscar..." />
            </div>
          </div>

          <div className="navbar-right">
            <div className="theme-switch" onClick={toggleTheme}>
              {theme === 'light' ? <FaMoon className="iconN" /> : <FaSun className="iconN" />}
            </div>

            <FaBell className="iconN" />
            <div className="carrito-icon" onClick={() => setShowCarritoModal(true)}>
              <FaShoppingCart className="iconN" />
              {carrito.length > 0 && <span className="carrito-contador">{carrito.length}</span>}
            </div>
            <div className="profile-container">
              <img
                src={currentUser.photo || "ruta/de/foto/por/defecto.jpg"}
                alt="Profile"
                style={{ width: "30px", height: "30px", borderRadius: "50%" }}
              />
              <span>{currentUser.full_name}</span>
            </div>
          </div>
        </>
      ) : (
        <div className="navbar-right">
          <div className="theme-switch" onClick={toggleTheme}>
            {theme === 'light' ? <FaMoon className="iconN" /> : <FaSun className="iconN" />}
          </div>
        </div>
      )}

      {showCarritoModal && (
        <CarritoModal
          carrito={carrito}
          onClose={() => setShowCarritoModal(false)}
          onActualizarCantidad={actualizarCantidad}
          onEliminarProducto={eliminarProducto}
        />
      )}
    </nav>
  );
};

export default Navbar;