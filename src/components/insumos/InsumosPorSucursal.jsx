import React from 'react';
import './InsumosPorSucursal.css';

const InsumosPorSucursal = ({ insumos }) => {
  if (!insumos || insumos.length === 0) {
    return <p className="no-insumos">No hay insumos registrados para esta sucursal.</p>;
  }

  return (
    <div className="insumos-sucursal-container">
      {insumos.map((insumo) => (
        <div key={insumo.insumoId} className="insumo-card">
          <h3>{insumo.nombre}</h3>
          <div className="insumo-info">
            <p><strong>Unidades:</strong> {insumo.unidades}</p>
            <p><strong>Cantidad:</strong> {insumo.cantidad}</p>
            <p><strong>Stock mínimo:</strong> {insumo.stockMinimo}</p>
            <p><strong>Vencimiento:</strong> {new Date(insumo.fechaVencimiento).toLocaleDateString()}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default InsumosPorSucursal;
