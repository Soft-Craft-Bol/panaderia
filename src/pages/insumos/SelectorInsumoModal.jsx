import { useState, useEffect } from 'react';
import ButtonPrimary from '../../components/buttons/ButtonPrimary';
import './SelectorInsumoModal.css';
import { useInsumos } from '../../hooks/useInsumos.JS';


const SelectorInsumoModal = ({ onInsumoSelected, onCancel }) => {
  const [nombre, setNombre] = useState('');
  const [tipo, setTipo] = useState('');

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error
  } = useInsumos({ nombre, tipo });

  return (
    <div className="selector-insumo-modal">
      <h2>Seleccionar Insumo para Asignar</h2>

      <div className="filtros">
        <input
          type="text"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          placeholder="Buscar por nombre"
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

      {isLoading ? (
        <p>Cargando insumos...</p>
      ) : error ? (
        <p className="error-message">Error al cargar insumos</p>
      ) : (
        <div className="insumos-list-sucursal">
          {data && data.length > 0 ? (
            data.map((insumo) => (
              <div
                key={insumo.id}
                className="insumo-item"
                onClick={() => onInsumoSelected(insumo)}
              >
                <div className="insumo-info">
                  <h3>{insumo.nombre}</h3>
                  <p>Tipo: {insumo.tipo || 'N/A'}</p>
                  <p>Unidad: {insumo.unidades}</p>
                  {insumo.precioActual && (
                    <p>Precio: Bs {insumo.precioActual.toFixed(2)}</p>
                  )}
                  <p>Cantidad: {insumo.cantidad}</p>
                </div>
                {insumo.imagen && (
                  <div className="insumo-image">
                    <img
                      src={insumo.imagen}
                      alt={insumo.nombre}
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/100';
                      }}
                    />
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
                {isFetchingNextPage ? 'Cargando más...' : 'Cargar más'}
              </button>
            </div>
          )}
        </div>
      )}

      <div className="modal-actions">
        <ButtonPrimary
          type="button"
          variant="secondary"
          onClick={onCancel}
        >
          Cancelar
        </ButtonPrimary>
      </div>
    </div>
  );
};

export default SelectorInsumoModal;
