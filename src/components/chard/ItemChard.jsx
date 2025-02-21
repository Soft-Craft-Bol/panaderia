import React, { useEffect, useState } from 'react';
import './Chard.css';
import { getItemsLimited } from '../../service/api';

const ItemChard = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getItemsLimited();
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
            <th>Descripción</th>
            <th>Unidad de Medida</th>
            <th>Precio Unitario</th>
            <th>Código Producto SIN</th>
            {/* <th>Imagen</th> */}
          </tr>
        </thead>
        <tbody>
          {Array.isArray(data) && data.map((item, index) => (
            <tr key={index}>
              <td>{item.id}</td>
              <td>{item.descripcion}</td>
              <td>{item.unidadMedida}</td>
              <td>{item.precioUnitario}</td>
              <td>{item.codigoProductoSin}</td>
              {/* <td><img src={item.imagen} alt={item.descripcion} width="50" /></td> */}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ItemChard;