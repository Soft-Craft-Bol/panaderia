import React from "react";
import PropTypes from "prop-types";
import "./Modal.css";

const CarritoModal = ({ carrito, onClose, onActualizarCantidad, onEliminarProducto }) => {
  const calcularTotal = () => {
    return carrito.reduce((total, item) => total + item.cantidad * item.producto.precioUnitario, 0);
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target.classList.contains("modal-overlay") && onClose()}>
      <div className="modal-container">
        <button className="modal-close" onClick={onClose}>
          &times;
        </button>
        <h2>Carrito de Compras</h2>
        {carrito.length === 0 ? (
          <p>No hay productos en el carrito.</p>
        ) : (
          <>
            <div className="carrito-items">
              {carrito.map((item, index) => (
                <div key={index} className="carrito-item">
                  <img src={item.producto.imagen} alt={item.producto.descripcion} />
                  <div className="carrito-item-info">
                    <h3>{item.producto.descripcion}</h3>
                    <p>Precio unitario: {item.producto.precioUnitario} Bs</p>
                    <div className="carrito-item-cantidad">
                      <button onClick={() => onActualizarCantidad(index, item.cantidad - 1)} disabled={item.cantidad <= 1}>
                        -
                      </button>
                      <span>{item.cantidad}</span>
                      <button onClick={() => onActualizarCantidad(index, item.cantidad + 1)} disabled={item.cantidad >= item.producto.stock}>
                        +
                      </button>
                    </div>
                    <p>Total: {item.cantidad * item.producto.precioUnitario} Bs</p>
                    <button onClick={() => onEliminarProducto(index)}>Eliminar</button>
                  </div>
                </div>
              ))}
            </div>
            <div className="carrito-total">
              <h3>Total a pagar: {calcularTotal()} Bs</h3>
              <button onClick={onClose}>Cerrar</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

CarritoModal.propTypes = {
  carrito: PropTypes.array.isRequired,
  onClose: PropTypes.func.isRequired,
  onActualizarCantidad: PropTypes.func.isRequired,
  onEliminarProducto: PropTypes.func.isRequired,
};

export default CarritoModal;