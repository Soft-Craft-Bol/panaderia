import React from "react";
import { useCarrito } from "../../context/CarritoContext";
import "./CarritoLista.css"; // Archivo CSS para los estilos

const CarritoLista = () => {
  const { carrito, eliminarDelCarrito } = useCarrito();

  // Cálculo de subTotal
  const subTotal = carrito.reduce((acc, item) => {
    const precio = item.precioUnitario || 0;
    const cant = item.cantidad || 1;
    return acc + precio * cant;
  }, 0);

  // Aquí puedes incluir impuestos, envío, descuentos, etc. si lo deseas.
  // Por simplicidad, asumimos el total es igual al subTotal.
  const total = subTotal;

  return (
    <div className="carrito-contenedor">
      <h2 className="carrito-titulo">CARRO DE COMPRAS</h2>

      {/* Tabla de productos */}
      <table className="carrito-tabla">
        <thead>
          <tr>
            <th>IMAGEN</th>
            <th>NOMBRE PRODUCTO</th>
            <th>CANTIDAD</th>
            <th>PRECIO UNITARIO</th>
            <th>TOTAL</th>
          </tr>
        </thead>
        <tbody>
          {carrito.map((item) => {
            const precio = item.precioUnitario || 0;
            const cant = item.cantidad || 1;
            const totalItem = precio * cant;

            return (
              <tr key={item.id}>
                <td>
                  {item.imagen ? (
                    <img
                      src={item.imagen}
                      alt={item.descripcion}
                      style={{ width: "50px", height: "50px" }}
                    />
                  ) : (
                    <p>Sin imagen</p>
                  )}
                </td>
                <td>{item.descripcion}</td>
                <td>{cant}</td>
                <td>Bs {precio.toFixed(2)}</td>
                <td>Bs {totalItem.toFixed(2)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <div className="carrito-opciones">
        <div className="carrito-resumen">
          <p>
            <strong>Sub-Total:</strong> Bs {subTotal.toFixed(2)}
          </p>
          <p>
            <strong>Total:</strong> Bs {total.toFixed(2)}
          </p>
          <button className="btn-general">PAGAR</button>
        </div>
      </div>
    </div>
  );
};

export default CarritoLista;
