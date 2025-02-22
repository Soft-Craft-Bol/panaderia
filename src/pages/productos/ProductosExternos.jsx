import React, { useState, useEffect } from "react";
import { useCarrito } from "../../context/CarritoContext";
import { fetchItems } from "../../service/api";
import CardProducto from "../../components/cardProducto/cardProducto";
import Modal from "../../components/modal/Modal";
import "./Productos.css";

const ProductosExternos = () => {
  const [productos, setProductos] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [cantidad, setCantidad] = useState(1);
  const { agregarAlCarrito } = useCarrito();

  const dataLabels = {
    data1: "Cantidad unidades:",
    data2: "Precio unitario:",
  };

  useEffect(() => {
    const getProducts = async () => {
      try {
        const response = await fetchItems();
        setProductos(response.data);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };
    getProducts();
  }, []);

  const handleAbrirModal = (product) => {
    setSelectedProduct(product);
    setShowModal(true);
  };

  const handleCerrarModal = () => {
    setShowModal(false);
    setSelectedProduct(null);
    setCantidad(1);
  };

  const handleAgregarAlCarrito = () => {
    if (selectedProduct) {
      agregarAlCarrito({ ...selectedProduct, cantidad });
      handleCerrarModal();
    }
  };

  return (
    <div className="productos-contenedor">
      <h1>Productos disponibles</h1>
      <div className="cardsProducto-contenedor">
        {productos.map((product) => (
          <CardProducto
            key={product.id}
            product={product}
            dataLabels={dataLabels}
            tipoUsuario="externo"
            onReservar={() => handleAbrirModal(product)}
          />
        ))}
      </div>

      {showModal && selectedProduct && (
        <Modal isOpen={showModal} onClose={handleCerrarModal}>
          <h2>{selectedProduct.descripcion}</h2>
          <p>Precio: Bs {selectedProduct.precioUnitario ? selectedProduct.precioUnitario.toFixed(2) : "0.00"}</p>

          <label htmlFor="cantidad">Cantidad:</label>
          <input
            id="cantidad"
            className="cantidad-input"
            type="number"
            value={cantidad}
            min="1"
            onChange={(e) => setCantidad(parseInt(e.target.value) || 1)}
          />

          <button className="agregar-carrito-btn" onClick={handleAgregarAlCarrito}>
            Agregar al carrito
          </button>
        </Modal>
      )}

    </div>
  );
};

export default ProductosExternos;
