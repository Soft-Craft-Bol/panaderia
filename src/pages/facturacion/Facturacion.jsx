import React, { useState } from 'react';
import './Facturacion.css';
import { getAllClient } from '../../service/api';
import { useNavigate } from 'react-router-dom';

const Facturacion = () => {
  const [nit, setNit] = useState('');
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    setNit(e.target.value);
  };

  const handleButtonClick = async () => {
    try {
      const response = await getAllClient();
      const clients = response.data;
      const client = clients.find(client => client.numeroDocumento.toString() === nit);
      if (client) {
        navigate('/impuestos-form', { state: { client } });
      } else {
        alert('Cliente no encontrado, CREAR CLIENTE');
        navigate('/clientes/crear-cliente');
      }
    } catch (error) {
      console.error('Error fetching clients:', error);
      alert('Error al buscar el cliente');
    }
  };
  return (
    <main className='fact-main-cont'>
      <div className='card'>
        <div className='card-body'>
          <h1>Facturación en linea</h1>
          <input 
            type="text" 
            placeholder="Ingrese el NIT o numero de documento" 
            value={nit}
            onChange={handleInputChange}
          />
          <button className='btn-general' onClick={handleButtonClick}>Continuar a la facturacion</button>
          <p
            className='link-fact'
            onClick={() => navigate('/impuestos-form')}
          >Venta sin facturación</p>
        </div>
      </div>
    </main>
  );
};

export default Facturacion;