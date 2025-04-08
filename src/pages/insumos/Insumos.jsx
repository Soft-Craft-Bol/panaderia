import React, { useState, useEffect } from 'react';
import './Insumos.css';
import Card from '../../components/card/cards/Card';
import { getSucursalWithInsumos, getInsumos } from '../../service/api';
import Tooltip from '../../components/tooltip/Tooltip';
import { useNavigate } from 'react-router-dom';

const Insumos = () => {
  const [insumos, setInsumos] = useState([]); // Cambiado de sucursales a insumos
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hoveredInsumoId, setHoveredInsumoId] = useState(null);
  const [hoveredElement, setHoveredElement] = useState(null);
  const navigate = useNavigate();

  const fetchInsumos = async () => {
    try {
      const response = await getInsumos();
      console.log('response:', response);
      setInsumos(response.data); // Guardamos directamente los insumos
      setLoading(false);
    } catch (error) {
      console.error('Error fetching insumos:', error);
      setError(error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInsumos();
  }, []);

  if (loading) return <div>Cargando...</div>;
  if (error) return <div>Error al cargar los insumos</div>;

  return (
    <main className='main-insumos'>
      <h1>Insumos</h1>
      <div>
        <button className='btn-general' onClick={() => navigate('/insumos/crear')}>
          Crear insumo
        </button>
      </div>
      <div className="cards-container">
        {insumos.map((insumo) => (
          <div 
            key={insumo.id} 
            style={{ position: 'relative' }}
            ref={(el) => hoveredInsumoId === insumo.id ? setHoveredElement(el) : null}
          >
            <Card
              img={insumo.imagen}
              titulo={insumo.nombre}
              datos={{
                Proveedor: insumo.proveedor,
                Marca: insumo.marca,
              }}
              cantidad={insumo.cantidad} 
              onTitleHover={(e) => {
                if (e.type === 'mouseenter') {
                  setHoveredInsumoId(insumo.id);
                } else {
                  setHoveredInsumoId(null);
                }
              }}
              insumoId={insumo.id}
              insumoData={insumo}
              fetchInsumos={fetchInsumos} // Cambiado el nombre de la función
            />
            {hoveredInsumoId === insumo.id && (
              <Tooltip insumo={insumo} targetElement={hoveredElement} />
            )}
          </div>
        ))}
      </div>
    </main>
  );
};

export default Insumos;