import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import './Productos.css';
import CardProducto from '../../components/cardProducto/cardProducto';
import ModalConfirm from '../../components/modalConfirm/ModalConfirm';
import { getStockWithSucursal, deleteItem, getSucursales, sumarCantidadDeProducto, addItemToSucursal } from '../../service/api';
import '../users/ListUser.css';
import { Toaster, toast } from "sonner";
import InfiniteScroll from 'react-infinite-scroll-component';

const Productos = () => {
  const [productos, setProductos] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [productoAEliminar, setProductoAEliminar] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [sucursales, setSucursales] = useState([]);
  const [cantidades, setCantidades] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const dataLabels = {
    data1: 'Cantidad General:',
    data2: 'Precio unitario:',
    data3: 'Código Producto SIN:'
  };

  const getProducts = useCallback(async (pageNumber = 0, search = '') => { // Cambia a 0-based
    try {
      setLoading(true);
      const response = await getStockWithSucursal(pageNumber, search);
      const pageData = response.data; // Esto es el objeto Page completo
      const newProducts = pageData.content; // Los productos están aquí
      
      if (pageNumber === 0) {
        setProductos(newProducts);
      } else {
        setProductos(prev => [...prev, ...newProducts]);
      }
      
      // Usamos pageData.last para saber si hay más páginas
      setHasMore(!pageData.last);
      setPage(pageNumber + 1);
      
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Error al cargar productos');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchMoreData = () => {
    if (!loading && hasMore) { 
      getProducts(page, searchTerm);
    }
  };

  const fetchSucursales = async () => {
    try {
      const response = await getSucursales();
      setSucursales(response.data);
    } catch (error) {
      console.error('Error fetching sucursales:', error);
    }
  };

  useEffect(() => {
    getProducts(0, searchTerm); 
  }, [searchTerm, getProducts]);

  useEffect(() => {
    fetchSucursales();
  }, []);

  const getDescripcionProducto = (codigoProducto) => {
    const producto = productos.find(p => p.codigoProducto === codigoProducto);
    return producto ? producto.descripcionProducto : 'Descripción no disponible';
  };

  const handleOpenModal = (product) => {
    setProductoAEliminar(product);
    setShowModal(true);
  };

  const handleOpenModalAdd = (product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
    const initialCantidades = {};
    sucursales.forEach((sucursal) => {
      initialCantidades[sucursal.id] = "";
    });
    setCantidades(initialCantidades);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setProductoAEliminar(null);
  };

  const confirmarAccion = async () => {
    if (productoAEliminar) {
      try {
        await deleteItem(productoAEliminar.id);
        setProductos(prevProductos => prevProductos.filter(p => p.id !== productoAEliminar.id));
        toast.success("Producto eliminado correctamente");
      } catch (error) {
        console.error("Error al eliminar el producto:", error);
        toast.error("Error al eliminar el producto");
      }
    }

    setShowModal(false);
    setProductoAEliminar(null);
  };

  const handleConfirm = async () => {
    if (selectedProduct) {
      try {
        for (const sucursalId in cantidades) {
          const cantidad = cantidades[sucursalId];
          if (cantidad !== "" && cantidad > 0) {
            const productoEnSucursal = selectedProduct.sucursales.find((s) => s.id === Number(sucursalId));

            if (productoEnSucursal) {
              await sumarCantidadDeProducto(sucursalId, selectedProduct.id, cantidad);
            } else {
              await addItemToSucursal(sucursalId, selectedProduct.id, cantidad);
            }
          }
        }
        toast.success("Cantidades agregadas correctamente");
        getProducts(page, searchTerm); 
      } catch (error) {
        console.error('Error al agregar cantidades:', error);
        toast.error('Error al agregar cantidades');
      }
    }
    setIsModalOpen(false);
  };

  const handleKeyDown = (e) => {
    if (
      !/[0-9]/.test(e.key) &&
      e.key !== "Backspace" &&
      e.key !== "Delete" &&
      e.key !== "ArrowLeft" &&
      e.key !== "ArrowRight"
    ) {
      e.preventDefault();
    }
  };

  return (
    <div className="productos-contenedor">
      <Toaster dir="auto" closeButton richColors visibleToasts={2} duration={2000} position="bottom-right" />
      <h1>Productos en stock</h1>
      <button
        className="btn-general"
        onClick={() => navigate("/addProduct")}
      >
        (+) &emsp; Agregar nuevo
      </button>
      <div>
        <input
          type="text"
          placeholder="Buscar por descripción..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>
      
      <InfiniteScroll
        dataLength={productos.length}
        next={fetchMoreData}
        hasMore={hasMore}
        loader={<h4>Cargando...</h4>}
        endMessage={
          <p style={{ textAlign: 'center' }}>
            <b>No hay más productos para mostrar</b>
          </p>
        }
      >
        <div className="cardsProducto-contenedor">
          {productos.map((product) => (
            <CardProducto
              dataLabels={dataLabels}
              key={product.id}
              product={product}
              onEliminar={() => handleOpenModal(product)}
              onEdit={`/editProduct/${product.id}`}
              onAdd={() => handleOpenModalAdd(product)}
              descripcionProducto={getDescripcionProducto(product.codigoProductoSin)}
            />
          ))}
        </div>
      </InfiniteScroll>

      {isModalOpen && (
        <div className="modalCant">
          <div className="modalCant-content">
            <h2>Agregar Cantidad</h2>
            {sucursales.map((sucursal) => {
              const productoEnSucursal = selectedProduct.sucursales.find((s) => s.id === sucursal.id);
              return (
                <div key={sucursal.id} className="sucursal-item">
                  <label>{sucursal.nombre}</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="Ingrese la cantidad"
                    value={cantidades[sucursal.id] || ""}
                    onChange={(e) => setCantidades((prev) => ({
                      ...prev,
                      [sucursal.id]: e.target.value === "" ? "" : Number(e.target.value),
                    }))}
                    onKeyDown={handleKeyDown}
                  />
                  <label>Cantidad actual: {productoEnSucursal ? productoEnSucursal.cantidad : 0}</label>
                </div>
              );
            })}
            <div className="botones-footer">
              <button className="btn-edit" onClick={handleConfirm}>Confirmar</button>
              <button className="btn-cancel" onClick={() => setIsModalOpen(false)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
      
      <ModalConfirm
        showModal={showModal}
        handleCloseModal={handleCloseModal}
        confirmarAccion={confirmarAccion}
      />
    </div>
  );
};

export default Productos;