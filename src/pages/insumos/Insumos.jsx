import React, { useState, useEffect } from 'react';
import './Insumos.css';
import { Button } from '../../components/buttons/Button';
import Card from '../../components/card/cards/Card';
import { getSucursalWithInsumos } from '../../service/api';
import Tooltip from '../../components/tooltip/Tooltip';
import { useNavigate } from 'react-router-dom';

const Insumos = () => {
  const [sucursales, setSucursales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hoveredInsumoId, setHoveredInsumoId] = useState(null);
  const [hoveredElement, setHoveredElement] = useState(null);
  const navigate = useNavigate();

  const fetchSucursalesConInsumos = async () => {
    try {
      const response = await getSucursalWithInsumos();
      setSucursales(response.data); 
      setLoading(false);
    } catch (error) {
      console.error('Error fetching sucursales with insumos:', error);
      setError(error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSucursalesConInsumos();
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
      {sucursales.map((sucursal) => (
        <div key={sucursal.id} className="sucursal-container">
          <h2>{sucursal.nombre}</h2>
          <div className="cards-container">
            {sucursal.insumos.map((insumo) => (
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
                  sucursalId={sucursal.id}
                  fetchSucursalesConInsumos={fetchSucursalesConInsumos}
                />
                {hoveredInsumoId === insumo.id && (
                  <Tooltip insumo={insumo} targetElement={hoveredElement} />
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </main>
  );
};

export default Insumos;