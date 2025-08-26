import React from 'react';
import './ProduccionDetail.css';

const ProduccionDetail = ({ produccion, onClose }) => {
  if (!produccion) return null;

  return (
    <div className="produccion-detail">
      <h2>Detalle de Producción</h2>
      
      {/* Información Básica */}
      <div className="detail-section">
        <h3>Información Básica</h3>
        <div className="detail-row1">
          <span className="detail-label">ID:</span>
          <span className="detail-value">{produccion.id}</span>
        </div>
        <div className="detail-row1">
          <span className="detail-label">Fecha:</span>
          <span className="detail-value">
            {new Date(produccion.fecha).toLocaleDateString()}
          </span>
        </div>
        <div className="detail-row1">
          <span className="detail-label">Estado:</span>
          <span className="detail-value">{produccion.estado || 'Completado'}</span>
        </div>
        <div className="detail-row1">
          <span className="detail-label">Observaciones:</span>
          <span className="detail-value">{produccion.observaciones || '-'}</span>
        </div>
      </div>
      
      {/* Relaciones */}
      <div className="detail-section">
        <h3>Relaciones</h3>
        <div className="detail-row1">
          <span className="detail-label">Receta:</span>
          <span className="detail-value">{produccion.recetaNombre}</span>
        </div>
        <div className="detail-row1">
          <span className="detail-label">Producto:</span>
          <span className="detail-value">{produccion.productoNombre}</span>
        </div>
        <div className="detail-row1">
          <span className="detail-label">Sucursal:</span>
          <span className="detail-value">{produccion.sucursalNombre}</span>
        </div>
      </div>
      
      {/* Cantidad */}
      <div className="detail-section">
        <h3>Cantidades</h3>
        <div className="detail-row1">
          <span className="detail-label">Cantidad producida:</span>
          <span className="detail-value">{produccion.cantidadProducida}</span>
        </div>
      </div>

      {/* Insumos usados */}
      {produccion.insumosUsados && produccion.insumosUsados.length > 0 && (
        <div className="detail-section">
          <h3>Insumos Usados</h3>
          <table className="insumos-table">
            <thead>
              <tr>
                <th>Genérico</th>
                <th>Nombre</th>
                <th>Cantidad</th>
                <th>Unidad</th>
                <th>% Usado</th>
              </tr>
            </thead>
            <tbody>
              {produccion.insumosUsados.map((insumo, idx) => (
                <tr key={idx}>
                  <td>{insumo.insumoGenericoNombre}</td>
                  <td>{insumo.insumoNombre}</td>
                  <td>{insumo.cantidadUsada}</td>
                  <td>{insumo.unidadMedida}</td>
                  <td>{insumo.porcentajeUsado}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Botón de cierre */}
      <div className="detail-actions">
        <button className="close-button" onClick={onClose}>
          Cerrar
        </button>
      </div>
    </div>
  );
};

export default ProduccionDetail;
