import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getInsumos } from '../../service/api';
import ButtonPrimary from '../../components/buttons/ButtonPrimary';
import './SelectorInsumoModal.css';

const SelectorInsumoModal = ({ onInsumoSelected, onCancel }) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['insumos'],
    queryFn: getInsumos,
    select: (response) => {
      // Manejo seguro de la respuesta paginada
      return response?.data?.content || [];
    }
  });

  return (
    <div className="selector-insumo-modal">
      <h2>Seleccionar Insumo para Asignar</h2>
      
      {isLoading ? (
        <p>Cargando insumos...</p>
      ) : error ? (
        <p className="error-message">Error al cargar insumos</p>
      ) : (
        <div className="insumos-list">
          {data && data.length > 0 ? (
            data.map(insumo => (
              <div 
                key={insumo.id} 
                className="insumo-item"
                onClick={() => onInsumoSelected(insumo)}
              >
                <div className="insumo-info">
                  <h3>{insumo.nombre}</h3>
                  <p>Tipo: {insumo.tipo || 'N/A'}</p>
                  <p>Unidad: {insumo.unidades}</p>
                  {insumo.precioActual && <p>Precio: ${insumo.precioActual.toFixed(2)}</p>}
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