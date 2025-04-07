import React, { useState } from "react";
import { useCarrito } from "../../context/CarritoContext";
import "./CarritoLista.css";
import ReservaFormulario from "./ReservaFormulario";

const CarritoLista = () => {
  const { carrito, eliminarDelCarrito } = useCarrito();
  const [mostrarFormulario, setMostrarFormulario] = useState(false);

  // Función para calcular el precio con descuento
  const calcularPrecioConDescuento = (item) => {
    const precioBase = item.precioUnitario || 0;
    const descuento = item.descuento || 0; // Asume que el descuento viene en porcentaje
    return precioBase * (1 - descuento / 100);
  };

  // Cálculo de subTotal y descuentos
  const { subTotal, totalDescuentos, total } = carrito.reduce(
    (acc, item) => {
      const precioBase = item.precioUnitario || 0;
      const precioConDescuento = calcularPrecioConDescuento(item);
      const cant = item.cantidad || 1;
      
      return {
        subTotal: acc.subTotal + precioBase * cant,
        totalDescuentos: acc.totalDescuentos + (precioBase - precioConDescuento) * cant,
        total: acc.total + precioConDescuento * cant
      };
    },
    { subTotal: 0, totalDescuentos: 0, total: 0 }
  );

  return (
    <div className="carrito-contenedor">
      <h2 className="carrito-titulo">CARRO DE COMPRAS</h2>

      <table className="carrito-tabla">
        <thead>
          <tr>
            <th>IMAGEN</th>
            <th>NOMBRE PRODUCTO</th>
            <th>CANTIDAD</th>
            <th>PRECIO UNITARIO</th>
            <th>DESCUENTO</th>
            <th>TOTAL</th>
            <th>ACCIÓN</th>
          </tr>
        </thead>
        <tbody>
          {carrito.map((item) => {
            const precioBase = item.precioUnitario || 0;
            const precioConDescuento = calcularPrecioConDescuento(item);
            const cant = item.cantidad || 1;
            const totalItem = precioConDescuento * cant;
            const descuento = item.descuento || 0;

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
                <td>Bs {precioBase.toFixed(2)}</td>
                <td>{descuento > 0 ? `${descuento}%` : "-"}</td>
                <td>Bs {totalItem.toFixed(2)}</td>
                <td>
                  <button onClick={() => eliminarDelCarrito(item.id)}>
                    Eliminar
                  </button>
                </td>
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
          {totalDescuentos > 0 && (
            <p className="descuento-texto">
              <strong>Descuentos:</strong> -Bs {totalDescuentos.toFixed(2)}
            </p>
          )}
          <p>
            <strong>Total:</strong> Bs {total.toFixed(2)}
          </p>
          <button 
            className="btn-general" 
            onClick={() => setMostrarFormulario(true)}
            disabled={carrito.length === 0}
          >
            PAGAR
          </button>
        </div>
      </div>

      {mostrarFormulario && (
        <ReservaFormulario
          carrito={carrito}
          total={total}
          onReservaExitosa={() => {
            setMostrarFormulario(false);
            alert("Reserva creada exitosamente");
          }}
        />
      )}
    </div>
  );
};

export default CarritoLista;