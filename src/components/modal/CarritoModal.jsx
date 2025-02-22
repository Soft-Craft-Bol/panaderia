import React from "react";
import { FaTrash } from "react-icons/fa";
import { useCarrito } from "../../context/CarritoContext";
import "./Carrito.css";
import LinkButton from "../buttons/LinkButton";

const Carrito = ({ onClose }) => {
  const { carrito, eliminarDelCarrito } = useCarrito();

  const calcularTotal = () => {
    return carrito
      .reduce((total, item) => {
        const precio = parseFloat(item.precioUnitario) || 0;
        const cantidad = parseInt(item.cantidad) || 0;
        return total + precio * cantidad;
      }, 0)
      .toFixed(2);
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
                <img src={item.imagen} alt={item.descripcion} className="carrito-imagen" 
                  style={{ width: "50px", height: "50px", objectFit: "cover" }}
                />
                <div className="carrito-info">
                  <p className="carrito-nombre">{item.descripcion}</p>
                  <p className="carrito-precio">
                    Bs {item.precioUnitario && !isNaN(item.precioUnitario) ? item.precioUnitario.toFixed(2) : "0.00"} x {item.cantidad}
                  </p>
                </div>
                <button className="carrito-eliminar" onClick={() => eliminarDelCarrito(item.id)}>
                  <FaTrash />
                </button>
              </div>
            ))}
          </div>

          <div className="carrito-total">
            <p>Total: Bs {calcularTotal()}</p>
          <LinkButton to={"/carrito"}>Ver Carrito</LinkButton>

          </div>
        </>
      )}
    </div>
  );
};

export default Carrito;
