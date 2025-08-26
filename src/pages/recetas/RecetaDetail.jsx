import React from 'react';
import { getRecetaID } from '../../service/api';
import { useQuery } from '@tanstack/react-query';
import { 
  FaWeight, 
  FaBoxes, 
  FaInfoCircle, 
  FaClock, 
  FaUtensils,
  FaFlask,
  FaListOl,
  FaMoneyBillWave
} from 'react-icons/fa';
import { IoClose } from 'react-icons/io5';
import './RecetaDetail.css';

const RecetaDetail = ({ receta, onClose }) => {
  const { data: response, isLoading, error } = useQuery({
    queryKey: ['receta', receta.id],
    queryFn: () => getRecetaID(receta.id),
    initialData: { data: receta }
  });

  const data = response?.data || receta;

  if (isLoading) return <div className="loading-spinner">Cargando detalles...</div>;
  if (error) return <div className="error-message">Error al cargar detalles: {error.message}</div>;

  return (
    <div className="receta-detail">
      <div className="receta-header">
        <h2>{data.nombre}</h2>
      </div>

      <div className="receta-content">
        <div className="receta-info-section">
          <div className="receta-info">
            <div className="info-block">
              <h3>Descripción</h3>
              <p className="receta-description">{data.descripcion || 'No hay descripción disponible'}</p>
            </div>
            
            <div className="info-block">
              <h3>Instrucciones de producción</h3>
              <p className="receta-instructions">{data.instrucciones || 'No hay instrucciones disponibles'}</p>
            </div>
          </div>

          <div className="receta-meta">
            <div className="meta-grid">
              <div className="meta-item">
                <div className="meta-icon-container">
                  <FaBoxes className="meta-icon" />
                </div>
                <div className="meta-text">
                  <span className="meta-label">Unidades</span>
                  <span className="meta-value">{data.cantidadUnidades}</span>
                </div>
              </div>

              <div className="meta-item">
                <div className="meta-icon-container">
                  <FaWeight className="meta-icon" />
                </div>
                <div className="meta-text">
                  <span className="meta-label">Peso unitario</span>
                  <span className="meta-value">{data.pesoUnitario} kg</span>
                </div>
              </div>

              <div className="meta-item">
                <div className="meta-icon-container">
                  <FaClock className="meta-icon" />
                </div>
                <div className="meta-text">
                  <span className="meta-label">Tiempo producción</span>
                  <span className="meta-value">{data.tiempoProduccionMinutos} min</span>
                </div>
              </div>

              <div className="meta-item">
                <div className="meta-icon-container">
                  <FaUtensils className="meta-icon" />
                </div>
                <div className="meta-text">
                  <span className="meta-label">Producto final</span>
                  <span className="meta-value">{data.nombreProducto}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="insumos-section">
          <div className="section-header">
            <FaFlask className="section-icon" />
            <h3>Insumos Requeridos</h3>
          </div>
          
          <div className="insumos-container">
            {data.insumosGenericos?.length > 0 ? (
              <div className="insumos-list">
                {data.insumosGenericos.map((insumo, index) => (
                  <div key={index} className="insumo-generico-card">
                    <div className="insumo-generico-header">
                      <h4 className="insumo-generico-nombre">{insumo.nombre}</h4>
                      <div className="insumo-generico-cantidad">
                        <span className="cantidad">{insumo.cantidad}</span>
                        <span className="unidad">{insumo.unidadMedida}</span>
                      </div>
                    </div>
                    
                    {insumo.costo && (
                      <div className="insumo-generico-costo">
                        <FaMoneyBillWave className="costo-icon" />
                        <span>Costo: ${insumo.costo.toFixed(2)}</span>
                      </div>
                    )}
                    
                    {insumo.opcionesEspecificas?.length > 0 ? (
                      <div className="opciones-especificas">
                        <div className="opciones-header">
                          <FaListOl className="opciones-icon" />
                          <h5>Marcas disponibles:</h5>
                        </div>
                        
                        <div className="opciones-grid">
                          {insumo.opcionesEspecificas.map((opcion, idx) => (
                            <div key={idx} className="opcion-especifica">
                              <div className="opcion-prioridad">
                                <span>{opcion.prioridad}°</span>
                              </div>
                              <div className="opcion-info">
                                <div className="opcion-nombre">{opcion.nombre}</div>
                                <div className="opcion-detalle">
                                  <span className="opcion-precio">${opcion.precioActual}</span>
                                  <span className="opcion-unidad">{opcion.unidades}</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="sin-opciones">
                        No hay marcas específicas configuradas para este insumo
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="no-insumos">No hay insumos registrados para esta receta</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecetaDetail;