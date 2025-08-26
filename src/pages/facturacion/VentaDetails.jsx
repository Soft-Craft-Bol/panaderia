import React from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Button } from '../../components/buttons/Button';
import { FaPrint, FaFilePdf } from 'react-icons/fa';
import './VentaDetails.css';

const VentaDetails = ({ venta, onClose }) => {
  if (!venta) return null;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-BO', {
      style: 'currency',
      currency: 'BOB'
    }).format(amount);
  };

  return (
    <div className="venta-details">
      <h2>Detalles de Venta y Facturación</h2>
      
      <div className="details-grid">
        <div className="details-section">
          <h3>Información de la Venta</h3>
          <div className="detail-row">
            <span className="detail-label">N° Venta:</span>
            <span className="detail-value">{venta.id}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Fecha:</span>
            <span className="detail-value">
              {format(new Date(venta.fecha), "PPPPpp", { locale: es })}
            </span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Punto de Venta:</span>
            <span className="detail-value">
              {venta.nombrePuntoVenta} - {venta.nombreSucursal}
            </span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Vendedor:</span>
            <span className="detail-value">{venta.nombreUsuario}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Método de Pago:</span>
            <span className="detail-value">{venta.metodoPago}</span>
          </div>
        </div>

        {venta.factura && (
          <div className="details-section">
            <h3>Información de Facturación</h3>
            <div className="detail-row">
              <span className="detail-label">N° Factura:</span>
              <span className="detail-value">{venta.factura.numeroFactura}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">CUF:</span>
              <span className="detail-value cuf">{venta.factura.cuf}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Estado:</span>
              <span className={`detail-value estado-${venta.factura.estado.toLowerCase()}`}>
                {venta.factura.estado}
              </span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Fecha Emisión:</span>
              <span className="detail-value">
                {format(new Date(venta.factura.fechaEmision), "PPPPpp", { locale: es })}
              </span>
            </div>
          </div>
        )}

        <div className="details-section cliente-section">
          <h3>Datos del Cliente</h3>
          <div className="detail-row">
            <span className="detail-label">Nombre/Razón Social:</span>
            <span className="detail-value">
              {venta.cliente?.nombreRazonSocial || 'Consumidor Final'}
            </span>
          </div>
          {venta.cliente && (
            <>
              <div className="detail-row">
                <span className="detail-label">NIT/CI:</span>
                <span className="detail-value">{venta.cliente.numeroDocumento}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Código Cliente:</span>
                <span className="detail-value">{venta.cliente.codigoCliente}</span>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="details-section productos-section">
        <h3>Productos Vendidos</h3>
        <table className="productos-table">
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
            {venta.detalles?.map((detalle, index) => (
              <tr key={index}>
                <td>{detalle.descripcionProducto}</td>
                <td>{detalle.cantidad}</td>
                <td>{formatCurrency(detalle.precioUnitario)}</td>
                <td>{formatCurrency(detalle.montoDescuento)}</td>
                <td>{formatCurrency((detalle.cantidad * detalle.precioUnitario) - detalle.montoDescuento)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan="4" className="total-label">Total:</td>
              <td className="total-value">
                {formatCurrency(venta.detalles?.reduce(
                  (sum, d) => sum + (d.cantidad * d.precioUnitario) - d.montoDescuento, 0
                ))}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div className="details-actions">
        <Button 
          variant="secondary" 
          onClick={onClose}
        >
          Cerrar
        </Button>
        {venta.factura && (
          <>
            <Button 
              variant="primary"
              icon={<FaFilePdf />}
              onClick={() => {/* Lógica para descargar PDF */}}
            >
              Descargar PDF
            </Button>
            <Button 
              variant="primary"
              icon={<FaPrint />}
              onClick={() => {/* Lógica para imprimir */}}
            >
              Imprimir
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

export default VentaDetails;