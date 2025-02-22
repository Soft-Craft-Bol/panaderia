import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import './Productos.css';
import CardProducto from '../../components/cardProducto/cardProducto';
import { fetchItems } from '../../service/api';

const ProductosExternos = () => {
  const [productos, setProductos] = useState([]);
  const navigate = useNavigate();
  const dataLabels = {
    data1: 'Cantidad:',
    data2: 'Precio unitario:',
  };

  useEffect(() => {
    const getProducts = async () => {
      try {
        const response = await fetchItems();
        console.log(response.data);
        setProductos(response.data);
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };

    getProducts();
  }, []);

  const handleReservar = (product) => {
    alert(`Reservaste el producto: ${product.descripcion}`);
  };

  return (
    <div className="productos-contenedor">
      <h1>Productos disponibles</h1>
      <div className="cardsProducto-contenedor">
        {productos.map((product) => (
          <CardProducto
            dataLabels={dataLabels}
            key={product.id}
            product={product}
            tipoUsuario="externo"
            onReservar={() => handleReservar(product)}
          />
        ))}
      </div>
    </div>
  );
};

export default ProductosExternos;