import React, { useState,useEffect } from "react";
import { useNavigate } from "react-router-dom";
import './Productos.css';
import CardProducto from '../../components/cardProducto/cardProducto';
import ModalConfirm from '../../components/modalConfirm/ModalConfirm';
import theProducts from "./theProducts.json";
import { fetchItems } from '../../service/api';

const Productos = () => {
  const [productos, setProductos] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [productoAEliminar, setProductoAEliminar] = useState(null);

  useEffect(() => {
    const getProducts = async () => {
      try {
        const response = await fetchItems();
        setProductos(response.data);
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };

    getProducts();
  }, []);

  const handleOpenModal = (product) => {
    setProductoAEliminar(product);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setProductoAEliminar(null);
  };

  const confirmarAccion = () => {
    if (productoAEliminar) {
      setProductos(prevProductos => prevProductos.filter(p => p.id !== productoAEliminar.id));
    }
    setShowModal(false);
    setProductoAEliminar(null);
  };

  return (
    <div className="productos-contenedor">
      <h1>Productos en stock</h1>
      <button 
        className="btn-general"
        onClick={() => navigate("/productos/addProduct")}
      >
        (+) &emsp; Agregar nuevo
      </button>
      <div className="cardsProducto-contenedor">
        {productos.map((product) => (
          <CardProducto
            key={product.id}
            product={product}
            onEliminar={() => handleOpenModal(product)}
          />
        ))}
      </div>
      <ModalConfirm 
        showModal={showModal}
        handleCloseModal={handleCloseModal}
        confirmarAccion={confirmarAccion}
      />
    </div>
  );
};

export default Productos;