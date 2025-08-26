// components/insumosGenericos/InsumoGenericoDetalle.js
import React from 'react';
import ButtonPrimary from '../../components/buttons/ButtonPrimary';
import InsumoGenericoForm from './InsumoGenericoForm';
import './InsumoGenericoDetalle.css';

const InsumoGenericoDetalle = ({ insumoGenerico, onSuccess, onCancel }) => {
  const isNew = !insumoGenerico?.id;

  if (isNew) {
    return <InsumoGenericoForm onSuccess={onSuccess} onCancel={onCancel} />;
  }

  return (
    <div className="detalle-insumo">
      <h2 className="detalle-title">Detalle de {insumoGenerico.nombre}</h2>

      <section className="detalle-section">
        <h4>Información General</h4>
        <div className="detalle-grid">
          <div>
            <span className="detalle-label">Nombre:</span>
            <span>{insumoGenerico.nombre}</span>
          </div>
          <div>
            <span className="detalle-label">Unidad de Medida:</span>
            <span>{insumoGenerico.unidadMedida}</span>
          </div>
          <div>
            <span className="detalle-label">Descripción:</span>
            <span>{insumoGenerico.descripcion || 'Sin descripción'}</span>
          </div>
        </div>
      </section>

      <section className="detalle-section">
        <h4>Insumos Específicos Asociados</h4>
        {insumoGenerico.insumosAsociados?.length > 0 ? (
          <table className="detalle-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Prioridad</th>
              </tr>
            </thead>
            <tbody>
              {insumoGenerico.insumosAsociados
                .sort((a, b) => a.prioridad - b.prioridad)
                .map((insumo) => (
                  <tr key={insumo.id}>
                    <td>{insumo.nombreInsumo}</td>
                    <td>{insumo.prioridad}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        ) : (
          <p className="no-insumos">No hay insumos específicos asociados.</p>
        )}
      </section>

      <div className="detalle-footer">
        <ButtonPrimary variant="secondary" onClick={onCancel}>
          Cerrar
        </ButtonPrimary>
      </div>
    </div>
  );
};

export default InsumoGenericoDetalle;
