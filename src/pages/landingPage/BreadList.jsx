import React, { useEffect, useRef, useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProductos } from '../../hooks/useProductos';
import { getItemsPromocion } from '../../service/api';
import styles from './BreadList.module.css';
import CardProductExt from '../../components/cardProducto/CardProductExt';
import { useInView } from 'react-intersection-observer';
import NavbarPublic from './NavbarPublic';

const BreadList = () => {
  const navigate = useNavigate();
  
  // Usamos el hook personalizado para productos normales
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
  
  const [promociones, setPromociones] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showModal, setShowModal] = useState(false);
  
  // Referencia para el scroll infinito
  const [loadMoreRef, inView] = useInView({
    threshold: 0.1,
    triggerOnce: false
  });

  // Cargar promociones al montar el componente
  useEffect(() => {
    getItemsPromocion()
      .then((response) => {
        setPromociones(response.data);
      })
      .catch((error) => {
        console.error('Error al obtener las promociones:', error);
      });
  }, []);

  // Efecto para cargar más productos cuando el elemento de carga es visible
  useEffect(() => {
    if (inView && hasNextPage && !isFetching) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetching, fetchNextPage]);

  const handleReserve = (productId) => {
    if (isLoggedIn) {
      console.log(`Reservando producto con ID: ${productId}`);
    } else {
      setShowModal(true);
    }
  };

  const closeModal = () => {
    setShowModal(false);
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
    <NavbarPublic/>
    <div className={styles.pageContainer}>
    
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
          <input
            type="number"
            placeholder="Precio mín."
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            className={styles.priceInput}
            min="0"
          />
          <input
            type="number"
            placeholder="Precio máx."
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            className={styles.priceInput}
            min="0"
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

      {promociones.length > 0 && (
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
                  onReservar={handleReserve}
                  tipoUsuario="interno"
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
                  onReservar={handleReserve}
                  tipoUsuario="interno"
                />
              ))}
            </div>
          </div>
        ))}

      {/* Elemento para detectar cuando hacer scroll infinito */}
      <div ref={loadMoreRef} style={{ height: '20px', margin: '10px 0' }}>
        {isFetching && <div>Cargando más productos...</div>}
      </div>

      {showModal && (
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
  </>
  );
};

export default BreadList;