import React from 'react';
import ButtonPrimary from '../../components/buttons/ButtonPrimary';
import './ProveedorDetails.css';

const ProveedorDetails = ({ proveedor, onClose, onEdit }) => {
  if (!proveedor) return null;

  return (
    <div className="details-container">
      <h2 className="details-title">Detalles del Proveedor</h2>

      <div className="details-item">
        <span className="details-label">Nombre/Razón Social:</span>
        <span className="details-value">{proveedor.nombreRazonSocial}</span>
      </div>

      <div className="details-item">
        <span className="details-label">Tipo:</span>
        <span className="details-value">
          {proveedor.tipoProveedor === 'INDIVIDUAL' ? 'Individual' : 'Empresa'}
        </span>
      </div>

      <div className="details-item">
        <span className="details-label">Dirección:</span>
        <span className="details-value">{proveedor.direccion}</span>
      </div>

      <div className="details-item">
        <span className="details-label">Teléfono:</span>
        <span className="details-value">{proveedor.telefono || 'No especificado'}</span>
      </div>

      <div className="details-item">
        <span className="details-label">Email:</span>
        <span className="details-value">{proveedor.email || 'No especificado'}</span>
      </div>

      <div className="details-item">
        <span className="details-label">ID:</span>
        <span className="details-value">{proveedor.id}</span>
      </div>

      <div className="details-buttons">
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

export default ProveedorDetails;
