import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import './Productos.css';
import CardProducto from '../../components/cardProducto/cardProducto';
import ModalConfirm from '../../components/modalConfirm/ModalConfirm';
import { getStockWithSucursal, deleteItem, getSucursales, sumarCantidadDeProducto, addItemToSucursal, quitarPromocion } from '../../service/api';
import '../users/ListUser.css';
import { Toaster, toast } from "sonner";
import InfiniteScroll from 'react-infinite-scroll-component';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useDebounce } from 'use-debounce';

const Productos = () => {
  const [showModal, setShowModal] = useState(false);
  const [showPromoModal, setShowPromoModal] = useState(false);
  const [selectedProductForPromo, setSelectedProductForPromo] = useState(null);
  const [productoAEliminar, setProductoAEliminar] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [sucursales, setSucursales] = useState([]);
  const [cantidades, setCantidades] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm] = useDebounce(searchTerm, 400);

  const navigate = useNavigate();
  const dataLabels = {
    data1: 'Cantidad General:',
    data2: 'Precio unitario:',
    data3: 'Código Producto SIN:'
  };

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetching,
    refetch
  } = useInfiniteQuery({
    queryKey: ['productos', debouncedSearchTerm],
    queryFn: ({ pageParam = 0 }) =>
      getStockWithSucursal(pageParam, 10, debouncedSearchTerm).then(res => ({
        productos: res.data.content,
        nextPage: !res.data.last ? pageParam + 1 : undefined
      })),
    getNextPageParam: (lastPage) => lastPage.nextPage,
    staleTime: 5 * 60 * 1000,
    cacheTime: 15 * 60 * 1000,
    keepPreviousData: true
  });

  const productos = data?.pages.flatMap(p => p.productos) || [];

  const fetchSucursales = async () => {
    try {
      const response = await getSucursales();
      setSucursales(response.data);
    } catch (error) {
      console.error('Error fetching sucursales:', error);
    }
  };

  useEffect(() => {
    fetchSucursales();
  }, []);

  const getDescripcionProducto = (codigoProducto) => {
    const producto = productos.find(p => p.codigoProductoSin === codigoProducto);
    return producto ? producto.descripcion : 'Descripción no disponible';
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
        refetch(); // Refetch data after deletion
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
            const productoEnSucursal = selectedProduct.sucursales.find((s) => s.sucursalId === Number(sucursalId));

            if (productoEnSucursal) {
              await sumarCantidadDeProducto(sucursalId, selectedProduct.id, cantidad);
            } else {
              await addItemToSucursal(sucursalId, selectedProduct.id, cantidad);
            }
          }
        }
        toast.success("Cantidades agregadas correctamente");
        refetch(); // Refetch data after adding quantities
      } catch (error) {
        console.error('Error al agregar cantidades:', error);
        toast.error('Error al agregar cantidades');
      }
    }
    setIsModalOpen(false);
  };

  const handleRemovePromocionInit = (product) => {
    setSelectedProductForPromo(product);
    setShowPromoModal(true);
  };

  const handleRemovePromocionConfirm = async (sucursalId) => {
    try {
      await quitarPromocion(selectedProductForPromo.id, sucursalId);
      toast.success("Promoción eliminada correctamente");
      refetch();
      setShowPromoModal(false);
    } catch (error) {
      console.error("Error al eliminar la promoción:", error);
      toast.error(error.response?.data?.message || "Error al eliminar la promoción");
    }
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

  // Function to check if product has any discount in any branch
  const hasDiscount = (product) => {
    return product.sucursales.some(s => s.tieneDescuento);
  };



  return (
    <div className="productos-contenedor">
      <Toaster dir="auto" closeButton richColors visibleToasts={2} duration={2000} position="bottom-right" />
      <h1>Productos en stock</h1>
      <div className="botones-header">
        <button className="btn-general1" onClick={() => navigate("/addProduct")}>
          (+) &emsp; Agregar nuevo
        </button>
        <button className="btn-general1" onClick={() => navigate("/insumos")}>
          🍞 &emsp; Gestionar Insumos
        </button>
        <button className="btn-general1" onClick={() => navigate("/recetas")}>
          📋 &emsp; Gestionar recetas
        </button>
        <button className="btn-general1" onClick={() => navigate("/insumos/produccion")}>
          🍪 &emsp; Producir producto
        </button>
      </div>

      <div>
        <input
          type="text"
          placeholder="Buscar por descripción..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>

      <InfiniteScroll
        dataLength={productos.length}
        next={fetchNextPage}
        hasMore={hasNextPage}
        loader={<h4>Cargando...</h4>}
        endMessage={
          <p style={{ textAlign: 'center' }}>
            <b>No hay más productos para mostrar</b>
          </p>
        }
      >
        <div className="cardsProducto-contenedor">
          {productos.map((product) => (
            <div
              key={product.id}
              className={`product-card-container ${hasDiscount(product) ? 'has-discount' : ''}`}
            >
              {hasDiscount(product) && (
                <div className="discount-badge">
                  ¡EN DESCUENTO!
                  <button
                    className="btn-remove-promo"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemovePromocionInit(product);
                    }}
                    title="Eliminar promoción"
                  >
                    ✕
                  </button>
                </div>
              )}
              <CardProducto
                dataLabels={dataLabels}
                product={product}
                onEliminar={() => handleOpenModal(product)}
                onEdit={`/editProduct/${product.id}`}
                onAdd={() => handleOpenModalAdd(product)}
                descripcionProducto={getDescripcionProducto(product.codigoProductoSin)}
                onPromocionAplicada={refetch}
              />
            </div>
          ))}
        </div>
      </InfiniteScroll>

      {showPromoModal && selectedProductForPromo && (
        <div className="modal-promo">
          <div className="modal-promo-content">
            <h2>Eliminar promoción</h2>
            <p>Selecciona la sucursal donde quieres quitar la promoción:</p>

            <div className="sucursal-list">
              {selectedProductForPromo.sucursales
                .filter(s => s.tieneDescuento)
                .map(sucursal => (
                  <div key={sucursal.sucursalId} className="sucursal-item-promo">
                    <button
                      onClick={() => handleRemovePromocionConfirm(sucursal.sucursalId)}
                      className="btn-sucursal-promo"
                    >
                      {sucursal.nombre}
                    </button>
                  </div>
                ))
              }
            </div>

            <div className="botones-footer">
              <button
                className="btn-cancel"
                onClick={() => setShowPromoModal(false)}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="modalCant">
          <div className="modalCant-content">
            <h2>Agregar Cantidad</h2>
            {sucursales.map((sucursal) => {
              const productoEnSucursal = selectedProduct.sucursales.find((s) => s.sucursalId === sucursal.id);
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