import React, { useState } from "react";
import { useCarrito } from "../../context/CarritoContext";
import "./CarritoLista.css";
import ReservaFormulario from "./ReservaFormulario";

const CarritoLista = () => {
  const { carrito, eliminarDelCarrito } = useCarrito();
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [metodoPago, setMetodoPago] = useState("qr");
  const [mensajeError, setMensajeError] = useState("");

  const { subTotal, totalDescuentos, total } = carrito.reduce(
    (acc, item) => {
      const precioOriginal = item.precioOriginal || item.precioUnitario;
      const precioFinal = item.precioUnitario;
      const cant = item.cantidad || 1;

      return {
        subTotal: acc.subTotal + precioOriginal * cant,
        totalDescuentos: acc.totalDescuentos + (precioOriginal - precioFinal) * cant,
        total: acc.total + precioFinal * cant,
      };
    },
    { subTotal: 0, totalDescuentos: 0, total: 0 }
  );

  const handlePagarClick = () => {
    if (metodoPago === "efectivo") {
      setMensajeError("Por el momento solo aceptamos pagos con QR.");
      return;
    }

    setMensajeError("");
    setMostrarFormulario(true);
  };

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
            const precioOriginal = item.precioOriginal || item.precioUnitario;
            const precioFinal = item.precioUnitario;
            const cant = item.cantidad || 1;
            const totalItem = precioFinal * cant;
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
                <td>Bs {precioFinal.toFixed(2)}</td>
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

          <div className="metodo-pago">
            <label>Método de pago:</label>
            <select
              value={metodoPago}
              onChange={(e) => setMetodoPago(e.target.value)}
              className="select-metodo"
            >
              <option value="qr">QR</option>
              <option value="efectivo">Efectivo</option>
            </select>
            {mensajeError && <p className="mensaje-error">{mensajeError}</p>}
          </div>

          <button
            className="btn-general"
            onClick={handlePagarClick}
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
          metodoPago={metodoPago}
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
