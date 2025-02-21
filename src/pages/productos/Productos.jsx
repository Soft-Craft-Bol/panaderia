import React, { useState,useEffect } from "react";
import { useNavigate } from "react-router-dom";
import './Productos.css';
import CardProducto from '../../components/cardProducto/cardProducto';
import ModalConfirm from '../../components/modalConfirm/ModalConfirm';
import { fetchItems, deleteItem } from '../../service/api';
import '../users/ListUser.css';

const Productos = () => {
  const [productos, setProductos] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [productoAEliminar, setProductoAEliminar] = useState(null);
  const navigate = useNavigate();
  const dataLabels={
    data1:'Unidad de medida:',
    data2:'Precio unitario:',
    data3:'Codigo Producto SIN:'
  };
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

  const confirmarAccion = async () => {
    if (productoAEliminar) {
      try {
        await deleteItem(productoAEliminar.id);
        // actualizamos el estado local
        setProductos(prevProductos => prevProductos.filter(p => p.id !== productoAEliminar.id));
      } catch (error) {
        console.error("Error al eliminar el producto:", error);
      }
    }
  
    setShowModal(false);
    setProductoAEliminar(null);
  };

  return (
    <div className="productos-contenedor">
      <h1>Productos en stock</h1>
      <button 
        className="btn-general"
        onClick={() => navigate("/addProduct")}
      >
        (+) &emsp; Agregar nuevo
      </button>
      <div className="cardsProducto-contenedor">
        {productos.map((product) => (
          <CardProducto
            dataLabels={dataLabels}
            key={product.id}
            product={product}
            onEliminar={() => handleOpenModal(product)}
            onEdit={`/editProduct/${product.id}`}
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