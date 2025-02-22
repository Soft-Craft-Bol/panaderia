import React from "react";
import { FaTrash } from "react-icons/fa";
import { useCarrito } from "../../context/CarritoContext";
import "./Carrito.css";

const Carrito = ({ onClose }) => {
  const { carrito, eliminarDelCarrito } = useCarrito();

  const calcularTotal = () => {
    return carrito.reduce((total, item) => total + item.precio * item.cantidad, 0).toFixed(2);
  };

  return (
    <div className="carrito-lista">
      <button className="carrito-cerrar" onClick={onClose}>Cerrar</button>

      {carrito.length === 0 ? (
        <p className="carrito-vacio">Tu carrito está vacío</p>
      ) : (
        <>
          <div className="carrito-items">
            {carrito.map((item) => (
              <div key={item.id} className="carrito-item">
                <img src={item.imagen} alt={item.nombre} className="carrito-imagen" />
                <div className="carrito-info">
                  <p className="carrito-nombre">{item.nombre}</p>
                  <p className="carrito-precio">Bs {item.precio.toFixed(2)} x {item.cantidad}</p>
                </div>
                <button className="carrito-eliminar" onClick={() => eliminarDelCarrito(item.id)}>
                  <FaTrash />
                </button>
              </div>
            ))}
          </div>

          <div className="carrito-total">
            <p>Total: Bs {calcularTotal()}</p>
          </div>
        </>
      )}
    </div>
  );
};

export default Carrito;
