import React, { useState, useEffect } from 'react';
import './Insumos.css';
import { Button } from '../../components/buttons/Button';
import Card from '../../components/card/cards/Card';
import { getInsumos, getInsumosAndSuccursales } from '../../service/api';

const Insumos = () => {
  const [insumos, setInsumos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchInsumos = async () => {
    try {
      const response = await getInsumosAndSuccursales();
      setInsumos(response.data);
      setLoading(false);
      console.log('Insumos:', response.data);
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
        <button className='btn-general'>Crear insumo</button>
      </div>
      <div className="cards-container">
        {insumos.map((insumo, index) => (
          <Card
            key={index}
            img={insumo.imagen}
            titulo={insumo.nombre}
            datos={{
              Proveedor: insumo.proveedor,
              Marca: insumo.marca,
            }}
            //cantidad={insumo.cantidad}
          />
        ))}
      </div>
    </main>
  );
};

export default Insumos;