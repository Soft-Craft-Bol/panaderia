import React, { useEffect, useState } from 'react';
import './ListaRecetas.css';
import { fetchItems } from '../../service/api';

const ListaRecetas = () => {
  const [items, setItems] = useState([]);

  useEffect(() => {
    const getItems = async () => {
      try {
        const response = await fetchItems();
        console.log('Items:', response.data);
        setItems(response.data);
      } catch (error) {
        console.error('Error fetching items:', error);
      }
    };
    getItems();
  }, []);

  const handleEstablecerReceta = (itemId) => {
    console.log(`Establecer receta para el item con ID: ${itemId}`);
    // Aquí puedes manejar la lógica para establecer la receta
  };

  return (
    <div className="recetas-container">
      <h1 className="recetas-title">Recetas</h1>
      <table className="recetas-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Descripción</th>
            <th>Código</th>
            <th>Código Producto SIN</th>
            <th>Precio Unitario</th>
            <th>Unidad de Medida</th>
            <th>Imagen</th>
            <th>Acción</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id}>
              <td>{item.id}</td>
              <td>{item.descripcion}</td>
              <td>{item.codigo}</td>
              <td>{item.codigoProductoSin}</td>
              <td>{item.precioUnitario} Bs</td>
              <td>{item.unidadMedida}</td>
              <td>
                <img
                  src={item.imagen}
                  alt={item.descripcion}
                  className="recetas-item-image"
                />
              </td>
              <td>
              <button
                className="btn-establecer-receta"
                onClick={() => handleEstablecerReceta(item.id)}
              >
                Establecer Receta
              </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ListaRecetas;