import React, { useState, useEffect } from "react";
import { useCarrito } from "../../context/CarritoContext";
import { getItemsPromocion } from "../../service/api";
import { useProductos } from "../../hooks/useProductos";
import Modal from "../../components/modal/Modal";
import CardProductExt from "../../components/cardProducto/CardProductExt";
import { Toaster, toast } from "sonner";
import "./Productos.css";
import { FaShoppingCart } from "react-icons/fa";
import InfiniteScroll from 'react-infinite-scroll-component';

const ProductosExternos = () => {
  const [promociones, setPromociones] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [cantidad, setCantidad] = useState(1);
  const { agregarAlCarrito } = useCarrito();

  const {
    productos,
    searchTerm,
    setSearchTerm,
    minPrice,
    setMinPrice,
    maxPrice,
    setMaxPrice,
    selectedSucursal,
    setSelectedSucursal,
    fetchNextPage,
    hasNextPage,
    isFetching,
    refetch
  } = useProductos();

  useEffect(() => {
    getItemsPromocion()
      .then((response) => {
        setPromociones(response.data);
      })
      .catch((error) => {
        console.error("Error al obtener las promociones:", error);
      });
  }, []);

  const handleAbrirModal = (product) => {
    const promo = promociones.find(p => p.item.id === product.id);
    if (promo) {
      const precioDescuento = product.precioUnitario * (1 - promo.descuento / 100);
      setSelectedProduct({
        ...product,
        descuento: promo.descuento,
        precioUnitario: parseFloat(precioDescuento.toFixed(2))
      });
    } else {
      setSelectedProduct({
        ...product,
        descuento: 0
      });
    }
    setShowModal(true);
  };

  const handleCerrarModal = () => {
    setShowModal(false);
    setSelectedProduct(null);
    setCantidad(1);
  };

  const handleAgregarAlCarrito = () => {
    if (selectedProduct) {
      agregarAlCarrito({
        ...selectedProduct,
        cantidad
      });
      handleCerrarModal();
      toast.success("Producto agregado al carrito");
    }
  };

  const productosSinPromocion = productos.filter((producto) => {
    return !promociones.some((promo) => promo.item.id === producto.id);
  });

  const groupBySucursal = (items) => {
    const grouped = {};
    items.forEach((item) => {
      if (item.sucursales && item.sucursales.length > 0) {
        item.sucursales.forEach((sucursal) => {
          if (!grouped[sucursal.nombre]) {
            grouped[sucursal.nombre] = [];
          }
          grouped[sucursal.nombre].push({ ...item, sucursal });
        });
      } else {
        if (!grouped["Sin Sucursal"]) {
          grouped["Sin Sucursal"] = [];
        }
        grouped["Sin Sucursal"].push(item);
      }
    });
    return grouped;
  };

  const groupedItems = groupBySucursal(productosSinPromocion);
  const allSucursales = [
    ...new Set(
      productos.flatMap((item) =>
        item.sucursales ? item.sucursales.map((s) => s.nombre) : []
      )
    ),
  ];

  return (
    <div className="productos-contenedor">
      <h2>Lista de Productos</h2>
      <Toaster
        dir="auto"
        closeButton
        richColors
        visibleToasts={2}
        duration={2000}
        position="bottom-right"
      />
      <div className="searchFilters">
        <input
          type="text"
          placeholder="Buscar pan..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="searchInput"
        />
        <select
          value={minPrice}
          onChange={(e) => setMinPrice(e.target.value)}
          className="priceInput"
        >
          <option value="">Precio mín.</option>
          <option value="0">0</option>
          <option value="10">10</option>
          <option value="20">20</option>
          <option value="50">50</option>
          <option value="100">100</option>
        </select>
        <select
          value={maxPrice}
          onChange={(e) => setMaxPrice(e.target.value)}
          className="priceInput"
        >
          <option value="">Precio máx.</option>
          <option value="10">10</option>
          <option value="20">20</option>
          <option value="50">50</option>
          <option value="100">100</option>
          <option value="200">200</option>
        </select>
        <select
          value={selectedSucursal}
          onChange={(e) => setSelectedSucursal(e.target.value)}
          className="priceInput"
        >
          <option value="">Todas las sucursales</option>
          {allSucursales.map((sucursal) => (
            <option key={sucursal} value={sucursal}>
              {sucursal}
            </option>
          ))}
          <option value="Sin Sucursal">Sin Sucursal</option>
        </select>
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
        {promociones.length > 0 && (
          <div className="promocionesSection">
            <h2 className="sucursalTitle">Productos en Promoción</h2>
            <div className="cardsProducto-contenedor">
              {promociones.map((promo) => {
                const precioConDescuento = promo.item.precioUnitario * (1 - promo.descuento / 100);
                const sucursalNombre = promo.sucursal ? promo.sucursal.nombre : "Sin sucursal";
                return (
                  <CardProductExt
                    key={promo.id}
                    item={promo.item}
                    onAgregarAlCarrito={handleAbrirModal}
                    tipoUsuario="externo"
                    descuento={promo.descuento}
                    precioConDescuento={precioConDescuento}
                    sucursalNombre={sucursalNombre}
                  />
                );
              })}
            </div>
          </div>
        )}

        {Object.keys(groupedItems)
          .filter((sucursal) => selectedSucursal === "" || sucursal === selectedSucursal)
          .map((sucursal) => (
            <div key={sucursal} className="sucursalSection">
              <h2 className="sucursalTitle">{sucursal}</h2>
              <div className="cardsProducto-contenedor">
                {groupedItems[sucursal].map((item) => (
                  <CardProductExt
                    key={item.id}
                    item={item}
                    onAgregarAlCarrito={handleAbrirModal}
                    tipoUsuario="externo"
                  />
                ))}
              </div>
            </div>
          ))}
      </InfiniteScroll>

      {showModal && selectedProduct && (
        <Modal isOpen={showModal} onClose={handleCerrarModal}>
          <h2>{selectedProduct.descripcion}</h2>
          {selectedProduct.descuento > 0 ? (
            <>
              <p className="precio-original-modal" style={{ textDecoration: 'line-through', color: '#999' }}>
                Precio original: Bs {((selectedProduct.precioUnitario) / (1 - selectedProduct.descuento / 100)).toFixed(2)}
              </p>
              <p className="precio-descuento-modal" style={{ color: '#e63946', fontWeight: 'bold' }}>
                ¡Oferta! Bs {selectedProduct.precioUnitario.toFixed(2)} (Ahorras {selectedProduct.descuento}%)
              </p>
            </>
          ) : (
            <p>Precio: Bs {selectedProduct.precioUnitario.toFixed(2)}</p>
          )}
          <label htmlFor="cantidad">Cantidad:</label>
          <input
            id="cantidad"
            className="cantidad-input"
            type="number"
            value={cantidad}
            min="1"
            onChange={(e) => setCantidad(parseInt(e.target.value) || 1)}
          />
          <button
            className="agregar-carrito-btn"
            onClick={handleAgregarAlCarrito}
          >
            <FaShoppingCart /> Agregar al carrito
          </button>
        </Modal>
      )}
    </div>
  );
};

export default ProductosExternos;
