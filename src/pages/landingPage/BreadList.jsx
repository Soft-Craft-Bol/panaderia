import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProductosGeneral } from '../../hooks/useProductoGeneral';
import { getItemsPromocion } from '../../service/api';
import styles from './BreadList.module.css';
import CardProductExt from '../../components/cardProducto/CardProductExt';
import { useInView } from 'react-intersection-observer';
import NavbarPublic from '../../components/sidebar/NavbarPublic';
import Footer from './Footer';
import { useCarrito } from '../../context/CarritoContext';
import { getUser } from '../../utils/authFunctions';
import { Toaster, toast } from 'sonner';
import Modal from '../../components/modal/Modal';
import { FaShoppingCart } from 'react-icons/fa';

const BreadList = () => {
  const navigate = useNavigate();
  const { agregarAlCarrito } = useCarrito();
  const currentUser = getUser();

  // Estados para el carrito
  const [showModal, setShowModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [cantidad, setCantidad] = useState(1);
  const [promociones, setPromociones] = useState([]);

  // Hook para productos
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
  } = useProductosGeneral();

  // Referencia para scroll infinito
  const [loadMoreRef, inView] = useInView({
    threshold: 0.1,
    triggerOnce: false
  });

  useEffect(() => {
    getItemsPromocion()
      .then((response) => {
        setPromociones(Array.isArray(response.data) ? response.data : []);
      })
      .catch((error) => {
        console.error('Error al obtener las promociones:', error);
        setPromociones([]);
      });
  }, []);

  useEffect(() => {
    if (inView && hasNextPage && !isFetching) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetching, fetchNextPage]);

  const handleAbrirModal = (product) => {
    if (!currentUser) {
      setShowModal(true);
      return;
    }

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

  const goToLogin = () => {
    setShowModal(false);
    navigate('/login');
  };

  const goToRegister = () => {
    setShowModal(false);
    navigate('/register');
  };

  // Filtrar productos que no están en promoción
  const productosSinPromocion = productos.filter((producto) => {
    return !promociones.some((promo) => promo.item.id === producto.id);
  });

  // Agrupar por sucursal
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
        if (!grouped['Sin Sucursal']) {
          grouped['Sin Sucursal'] = [];
        }
        grouped['Sin Sucursal'].push(item);
      }
    });
    return grouped;
  };

  const groupedItems = groupBySucursal(productosSinPromocion);
  const allSucursales = [...new Set(productos.flatMap(item =>
    item.sucursales ? item.sucursales.map(s => s.nombre) : []
  ))];

  return (
    <>
      <NavbarPublic />
      <div className={styles.pageContainer}>
        <Toaster richColors position="bottom-right" />

        <div className={styles.heroSection}>
          <h1 className={styles.mainTitle}>Variedad de Panes</h1>
          <h2 className={styles.filterTitle}>Filtros de Búsqueda</h2>
          <div className={styles.searchFilters}>
            <input
              type="text"
              placeholder="Buscar pan..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={styles.searchInput}
            />
            <select
              value={selectedSucursal}
              onChange={(e) => setSelectedSucursal(e.target.value)}
              className={styles.priceInput}
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
        </div>

        {promociones && promociones.length > 0 && (
          <div className={styles.promocionesSection}>
            <h2 className={styles.sucursalTitle}>Productos en Promoción</h2>
            <div className={styles.breadGrid}>
              {promociones.map((promo) => {
                const precioConDescuento = promo.item.precioUnitario * (1 - promo.descuento / 100);
                const sucursalNombre = promo.sucursal ? promo.sucursal.nombre : "Sin sucursal";
                return (
                  <CardProductExt
                    key={promo.id}
                    item={promo.item}
                    onReservar={handleAbrirModal}
                    tipoUsuario={currentUser ? "interno" : "externo"}
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
          .filter((sucursal) => selectedSucursal === '' || sucursal === selectedSucursal)
          .map((sucursal) => (
            <div key={sucursal} className={styles.sucursalSection}>
              <h2 className={styles.sucursalTitle}>{sucursal}</h2>
              <div className={styles.breadGrid}>
                {groupedItems[sucursal].map((item) => (
                  <CardProductExt
                    key={`${item.id}-${item.sucursal?.sucursalId || 'no-sucursal'}`}
                    item={item}
                    onReservar={handleAbrirModal}
                    tipoUsuario={currentUser ? "interno" : "externo"}
                  />

                ))}
              </div>
            </div>
          ))}

        <div ref={loadMoreRef} style={{ height: '20px', margin: '10px 0' }}>
          {isFetching && <div>Cargando más productos...</div>}
        </div>

        {/* Modal para agregar al carrito */}
        {showModal && selectedProduct && (
          <Modal isOpen={showModal} onClose={handleCerrarModal}>
            <h2>{selectedProduct.descripcion}</h2>
            {selectedProduct.descuento > 0 ? (
              <>
                <p className={styles.precioOriginalModal}>
                  Precio original: Bs {((selectedProduct.precioUnitario) / (1 - selectedProduct.descuento / 100)).toFixed(2)}
                </p>
                <p className={styles.precioDescuentoModal}>
                  ¡Oferta! Bs {selectedProduct.precioUnitario.toFixed(2)} (Ahorras {selectedProduct.descuento}%)
                </p>
              </>
            ) : (
              <p>Precio: Bs {selectedProduct.precioUnitario.toFixed(2)}</p>
            )}
            <label htmlFor="cantidad">Cantidad:</label>
            <input
              id="cantidad"
              className={styles.cantidadInput}
              type="number"
              value={cantidad}
              min="1"
              onChange={(e) => setCantidad(parseInt(e.target.value) || 1)}
            />
            <button
              className={styles.agregarCarritoBtn}
              onClick={handleAgregarAlCarrito}
            >
              <FaShoppingCart /> Agregar al carrito
            </button>
          </Modal>
        )}

        {showModal && !selectedProduct && (
          <div className={styles.modalOverlay}>
            <div className={styles.modal}>
              <h2 className={styles.modalTitle}>Necesitas una cuenta</h2>
              <p>Para reservar este producto, inicia sesión o regístrate.</p>
              <div className={styles.modalActions}>
                <button onClick={goToLogin} className={styles.modalButton}>
                  Iniciar sesión
                </button>
                <button onClick={goToRegister} className={styles.modalButtonSec}>
                  Registrarse
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </>
  );
};

export default BreadList;