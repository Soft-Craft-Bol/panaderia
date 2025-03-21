import React, { useEffect, useState } from 'react';
import './Chard.css';
import { getClientLimited } from '../../service/api';

const Chard = () => {
  const [data, setData] = useState([]);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getClientLimited();
        if (Array.isArray(response.data)) {
          setData(response.data);
        } else {
          console.error('Response data is not an array:', response.data);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);
  return (
    <div className="table-container">
      <table className="custom-table">
        <thead>
          <tr>
            <th>Id</th>
            <th>Nombre/Razón Social</th>
            <th>Código Tipo Documento Identidad</th>
            <th>Número Documento</th>
            <th>Complemento</th>
            <th>Código Cliente</th>
            <th>Email</th>
          </tr>
        </thead>
        <tbody>
          {Array.isArray(data) && data.map((item, index) => (
            <tr key={index}>
              <td>{item.id}</td>
              <td>{item.nombreRazonSocial}</td>
              <td>{item.codigoTipoDocumentoIdentidad}</td>
              <td>{item.numeroDocumento}</td>
              <td>{item.complemento}</td>
              <td>{item.codigoCliente}</td>
              <td>{item.email}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Chard;