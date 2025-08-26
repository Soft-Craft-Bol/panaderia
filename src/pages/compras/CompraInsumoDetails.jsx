import React from 'react';
import ButtonPrimary from '../../components/buttons/ButtonPrimary';
import './CompraInsumoDetails.css';

const CompraInsumoDetails = ({ compra, onClose, onEdit }) => {
  if (!compra) return null;

  return (
    <div className="compra-details-container">
      <h2>Detalles de la Compra</h2>
      
      <div className="compra-detail-item">
        <span className="compra-detail-label">Fecha:</span>
        <span className="compra-detail-value">{new Date(compra.fecha).toLocaleDateString()}</span>
      </div>
      
      <div className="compra-detail-item">
        <span className="compra-detail-label">Insumo:</span>
        <span className="compra-detail-value">{compra.insumoNombre} ({compra.tipoInsumo})</span>
      </div>
      
      <div className="compra-detail-item">
        <span className="compra-detail-label">Sucursal:</span>
        <span className="compra-detail-value">{compra.sucursalNombre}</span>
      </div>
      
      <div className="compra-detail-item">
        <span className="compra-detail-label">Proveedor:</span>
        <span className="compra-detail-value">{compra.proveedorNombre}</span>
      </div>
      
      <div className="compra-detail-item">
        <span className="compra-detail-label">Cantidad:</span>
        <span className="compra-detail-value">{compra.cantidad}</span>
      </div>
      
      <div className="compra-detail-item">
        <span className="compra-detail-label">Precio Unitario:</span>
        <span className="compra-detail-value">${compra.precioUnitario}</span>
      </div>
      
      <div className="compra-detail-item">
        <span className="compra-detail-label">Total:</span>
        <span className="compra-detail-value">${compra.total}</span>
      </div>
      
      <div className="compra-detail-item">
        <span className="compra-detail-label">N° Factura:</span>
        <span className="compra-detail-value">{compra.numeroFactura}</span>
      </div>
      
      {compra.notas && (
        <div className="compra-detail-item">
          <span className="compra-detail-label">Notas:</span>
          <span className="compra-detail-value">{compra.notas}</span>
        </div>
      )}

      <div className="compra-button-container">
        <ButtonPrimary onClick={onEdit} variant="primary">
          Editar
        </ButtonPrimary>
        <ButtonPrimary onClick={onClose} variant="secondary">
          Cerrar
        </ButtonPrimary>
      </div>
    </div>
  );
};

export default CompraInsumoDetails;