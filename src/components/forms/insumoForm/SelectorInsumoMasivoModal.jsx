import React, { useState } from 'react';
import './SelectorInsumoMasivoModal.css';
import { useInsumos } from '../../../hooks/useInsumos';
import ButtonPrimary from '../../buttons/ButtonPrimary';

const SelectorInsumoMasivoModal = ({ onInsumosSelected, onCancel, sucursalId }) => {
  const [nombre, setNombre] = useState('');
  const [tipo, setTipo] = useState('');
  const [selectedInsumos, setSelectedInsumos] = useState(new Map());

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error
  } = useInsumos({ nombre, tipo });

  const handleToggleInsumo = (insumo) => {
    setSelectedInsumos(prev => {
      const newMap = new Map(prev);
      if (newMap.has(insumo.id)) {
        newMap.delete(insumo.id);
      } else {
        newMap.set(insumo.id, {
          insumoId: insumo.id,
          cantidad: 0,
          stockMinimo: 0,
          fechaVencimiento: null
        });
      }
      return newMap;
    });
  };

  const handleInsumoDataChange = (insumoId, field, value) => {
    setSelectedInsumos(prev => {
      const newMap = new Map(prev);
      const insumoData = newMap.get(insumoId);
      if (insumoData) {
        newMap.set(insumoId, {
          ...insumoData,
          [field]: value
        });
      }
      return newMap;
    });
  };

  const handleSubmit = () => {
    const insumosArray = Array.from(selectedInsumos.values());
    onInsumosSelected(insumosArray);
  };

  return (
    <div className="selector-insumo-masivo-modal">
      <h2>Asignar Múltiples Insumos a Sucursal</h2>
      
      <div className="filtros">
        <input
          type="text"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          placeholder="Buscar insumos por nombre"
          className="filtro-input"
        />

        <select
          value={tipo}
          onChange={(e) => setTipo(e.target.value)}
          className="filtro-select"
        >
          <option value="">Todos los tipos</option>
          <option value="MATERIA_PRIMA">MATERIA PRIMA</option>
          <option value="PRODUCTO_TERMINADO">PRODUCTO TERMINADO</option>
        </select>
      </div>

      <div className="selected-count">
        {selectedInsumos.size} insumo(s) seleccionado(s)
      </div>

      {isLoading ? (
        <p>Cargando insumos...</p>
      ) : error ? (
        <p className="error-message">Error al cargar insumos</p>
      ) : (
        <div className="insumos-list-masivo">
          {data && data.length > 0 ? (
            data.map((insumo) => (
              <div
                key={insumo.id}
                className={`insumo-item-masivo ${selectedInsumos.has(insumo.id) ? 'selected' : ''}`}
              >
                <div className="insumo-checkbox">
                  <input
                    type="checkbox"
                    checked={selectedInsumos.has(insumo.id)}
                    onChange={() => handleToggleInsumo(insumo)}
                  />
                </div>

                <div className="insumo-info">
                  <h3>{insumo.nombre}</h3>
                  <p>Tipo: {insumo.tipo || 'N/A'}</p>
                  <p>Unidad: {insumo.unidades}</p>
                  {insumo.precioActual && (
                    <p>Precio: Bs {insumo.precioActual.toFixed(2)}</p>
                  )}
                </div>

                {selectedInsumos.has(insumo.id) && (
                  <div className="insumo-fields">
                    <div className="field-group">
                      <label>Cantidad:</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={selectedInsumos.get(insumo.id).cantidad}
                        onChange={(e) => handleInsumoDataChange(insumo.id, 'cantidad', parseFloat(e.target.value) || 0)}
                        placeholder="0.00"
                      />
                    </div>

                    <div className="field-group">
                      <label>Stock Mínimo:</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={selectedInsumos.get(insumo.id).stockMinimo}
                        onChange={(e) => handleInsumoDataChange(insumo.id, 'stockMinimo', parseInt(e.target.value) || 0)}
                        placeholder="0"
                      />
                    </div>

                    <div className="field-group">
                      <label>Fecha Vencimiento:</label>
                      <input
                        type="date"
                        value={selectedInsumos.get(insumo.id).fechaVencimiento || ''}
                        onChange={(e) => handleInsumoDataChange(insumo.id, 'fechaVencimiento', e.target.value || null)}
                      />
                    </div>
                  </div>
                )}
              </div>
            ))
          ) : (
            <p>No hay insumos disponibles</p>
          )}

          {hasNextPage && (
            <div className="load-more">
              <button
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
              >
                {isFetchingNextPage ? 'Cargando más...' : 'Cargar más insumos'}
              </button>
            </div>
          )}
        </div>
      )}

      <div className="modal-actions-masivo">
        <ButtonPrimary
          type="button"
          variant="secondary"
          onClick={onCancel}
        >
          Cancelar
        </ButtonPrimary>

        <ButtonPrimary
          type="button"
          variant="primary"
          onClick={handleSubmit}
          disabled={selectedInsumos.size === 0}
        >
          Asignar {selectedInsumos.size} Insumo(s)
        </ButtonPrimary>
      </div>
    </div>
  );
};

export default SelectorInsumoMasivoModal;