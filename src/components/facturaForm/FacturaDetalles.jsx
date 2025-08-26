// components/FacturaDetalles.jsx
import React from "react";

export default function FacturaDetalles({ items, subtotal, descuentos, total }) {
  return (
    <div className="seccion-detalles">
      <h3>Detalles de la Factura</h3>
      <div className="detalles-tabla">
        <table>
          <thead>
            <tr>
              <th>Producto</th>
              <th>Cantidad</th>
              <th>Precio Unitario</th>
              <th>Descuento</th>
              <th>Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr key={index}>
                <td>{item.item}</td>
                <td>{item.cantidad}</td>
                <td>Bs {(item.precioUnitario || 0).toFixed(2)}</td>
                <td>Bs {(item.descuento || 0).toFixed(2)}</td>
                <td>Bs {((item.precioUnitario || 0) * (item.cantidad || 0) - (item.descuento || 0)).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="resumen-totales">
        <div className="total-line">
          <span>Subtotal:</span>
          <span>Bs {subtotal.toFixed(2)}</span>
        </div>
        <div className="total-line">
          <span>Descuentos:</span>
          <span>- Bs {descuentos.toFixed(2)}</span>
        </div>
        <div className="total-line total-final">
          <span>Total:</span>
          <span>Bs {total.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}
