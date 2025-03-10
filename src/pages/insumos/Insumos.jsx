import React, { useState, useEffect } from 'react';
import './Insumos.css';
import { Button } from '../../components/buttons/Button';
import Card from '../../components/card/cards/Card';
import { getInsumosAndSuccursales } from '../../service/api';
import Tooltip from '../../components/tooltip/Tooltip';
import { useNavigate } from 'react-router-dom';

const Insumos = () => {
  const [insumos, setInsumos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hoveredInsumoId, setHoveredInsumoId] = useState(null);
  const [hoveredElement, setHoveredElement] = useState(null);
  const navigate = useNavigate();

  const fetchInsumos = async () => {
    try {
      const cachedInsumos = localStorage.getItem('insumos');
      if (cachedInsumos) {
        setInsumos(JSON.parse(cachedInsumos));
        setLoading(false);
      } else {
        const response = await getInsumosAndSuccursales();
        setInsumos(response.data);
        localStorage.setItem('insumos', JSON.stringify(response.data));
        setLoading(false);
      }
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
              onTitleHover={(e) => {
                if (e.type === 'mouseenter') {
                  setHoveredInsumoId(insumo.id);
                } else {
                  setHoveredInsumoId(null);
                }
              }}
              insumoId={insumo.id}
              insumoData={insumo} 
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