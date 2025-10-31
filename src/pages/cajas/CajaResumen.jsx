import React from 'react';
import './CajaResumen.css';

const CajaResumen = ({ caja }) => {

  return (
    <div className="caja-resumen">
      <h2>Caja Actual</h2>
      <div className="resumen-grid">
        <div className="resumen-item">
          <div>Estado:</div>
          <div className={`estado`}>
            {caja.estado || '-'}
          </div>
        </div>
        <div className="resumen-item">
          <div>Fecha Apertura:</div>
          <div>{caja.fechaApertura ? new Date(caja.fechaApertura).toLocaleString() : '-'}</div>
        </div>
        <div className="resumen-item">
          <div>Monto Inicial:</div>
          <div>Bs. {typeof caja.montoInicial === 'number' ? caja.montoInicial.toFixed(2) : '-'}</div>
        </div>
        <div className="resumen-item">
          <div>Sucursal:</div>
          <div>{caja.sucursal || '-'}</div>
        </div>
      </div>
    </div>
  );
};

export default CajaResumen;
