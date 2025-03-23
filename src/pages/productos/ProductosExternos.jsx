import React, { useState, useEffect } from "react";
import { useCarrito } from "../../context/CarritoContext";
import { getStockWithSucursal, getItemsPromocion } from "../../service/api";
import Modal from "../../components/modal/Modal";
import CardProductExt from "../../components/cardProducto/CardProductExt";
import { Toaster, toast } from "sonner";
import "./Productos.css";
import { FaShoppingCart } from "react-icons/fa";

const ProductosExternos = () => {
  const [productos, setProductos] = useState([]);
  const [promociones, setPromociones] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [selectedSucursal, setSelectedSucursal] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [cantidad, setCantidad] = useState(1);
  const { agregarAlCarrito } = useCarrito();

  useEffect(() => {
    getStockWithSucursal()
      .then((response) => {
        setProductos(response.data);
      })
      .catch((error) => {
        console.error("Error al obtener los productos:", error);
      });

    getItemsPromocion()
      .then((response) => {
        setPromociones(response.data);
      })
      .catch((error) => {
        console.error("Error al obtener las promociones:", error);
      });
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
      toast.success("Producto agregado al carrito");
    }
  };

  // Filtrado de productos
  const filteredItems = productos.filter((item) => {
    const matchesSearch = item.descripcion
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const price = item.precioUnitario || 0;
    const min = minPrice === "" ? 0 : parseFloat(minPrice);
    const max = maxPrice === "" ? Number.MAX_VALUE : parseFloat(maxPrice);
    const inPriceRange = price >= min && price <= max;
    return matchesSearch && inPriceRange;
  });

  // Agrupación por sucursal
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

  const groupedItems = groupBySucursal(filteredItems);
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

      {promociones.length > 0 && (
        <div className="promocionesSection">
          <h2 className="sucursalTitle">Productos en Promoción</h2>
          <div className="cardsProducto-contenedor">
            {promociones.map((promo) => (
              <CardProductExt
                key={promo.id}
                item={promo.item}
                onAgregarAlCarrito={handleAbrirModal}
                tipoUsuario="externo"
                descuento={promo.descuento}
              />
            ))}
          </div>
        </div>
      )}

      {Object.keys(groupedItems)
        .filter(
          (sucursal) =>
            selectedSucursal === "" || sucursal === selectedSucursal
        )
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

      {showModal && selectedProduct && (
        <Modal isOpen={showModal} onClose={handleCerrarModal}>
          <h2>{selectedProduct.descripcion}</h2>
          <p>
            Precio: Bs{" "}
            {selectedProduct.precioUnitario
              ? selectedProduct.precioUnitario.toFixed(2)
              : "0.00"}
          </p>
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
             Agregar al carrito
          </button>
        </Modal>
      )}
    </div>
  );
};

export default ProductosExternos;