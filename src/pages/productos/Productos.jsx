import React, { useState,useEffect } from "react";
import { useNavigate } from "react-router-dom";
import './Productos.css';
import CardProducto from '../../components/cardProducto/cardProducto';
import ModalConfirm from '../../components/modalConfirm/ModalConfirm';
import { fetchItems, deleteItem } from '../../service/api';
import '../users/ListUser.css';
import { addCantidadItem } from "../../service/api";
import LinkButton from "../../components/buttons/LinkButton";

const Productos = () => {
  const [productos, setProductos] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [productoAEliminar, setProductoAEliminar] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [cantidad, setCantidad] = useState(1);


  const navigate = useNavigate();
  const dataLabels={
    data1:'Cantidad unidades:',
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
  const handleOpenModalAdd = (product) => {
    setSelectedProduct(product);
    setCantidad(1);
    setIsModalOpen(true);
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

  const handleConfirm = async () => {
    if (selectedProduct && cantidad > 0) {
      try {
        await addCantidadItem(selectedProduct.id, cantidad);
        alert('Cantidad añadida correctamente');
      } catch (error) {
        console.error('Error al agregar cantidad:', error);
      }
    }
    setIsModalOpen(false);
  };


  return (
    <div className="productos-contenedor">
      <h1>Productos en stock</h1>
      <LinkButton to="/productos-externos">PRODUCTOS EXTERNOS</LinkButton>
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
            onAdd={() => handleOpenModalAdd(product)}
          />
        ))}
        {isModalOpen && (
          <div className="modalCant">
            <div className="modalCant-content">
              <h2>Agregar Cantidad</h2>
            <input
              type="number"
              value={cantidad}
              onChange={(e) => setCantidad(Number(e.target.value))}
              min="1"
            />
            <div className="botones-footer">
              <button className="btn-edit" onClick={handleConfirm}>Confirmar</button>
              <button className="btn-cancel" onClick={() => setIsModalOpen(false)}>Cancelar</button>              
            </div>
            </div>
            
          </div>)}
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