import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getStockWithSucursal, getItemsPromocion } from '../../service/api';
import styles from './BreadList.module.css';
import CardProductExt from '../../components/cardProducto/CardProductExt';

const BreadList = () => {
  const navigate = useNavigate();

  const [items, setItems] = useState([]);
  const [promociones, setPromociones] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [selectedSucursal, setSelectedSucursal] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    getStockWithSucursal()
      .then((response) => {
        setItems(response.data);
      })
      .catch((error) => {
        console.error('Error al obtener los productos:', error);
      });

    getItemsPromocion()
      .then((response) => {
        setPromociones(response.data);
      })
      .catch((error) => {
        console.error('Error al obtener las promociones:', error);
      });
  }, []);

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

  const productosSinPromocion = items.filter((producto) => {
    return !promociones.some((promo) => promo.item.id === producto.id);
  });

  const filteredItems = productosSinPromocion.filter((item) => {
    const matchesSearch = item.descripcion.toLowerCase().includes(searchTerm.toLowerCase());
    const price = item.precioUnitario || 0;
    const min = minPrice === '' ? 0 : parseFloat(minPrice);
    const max = maxPrice === '' ? Number.MAX_VALUE : parseFloat(maxPrice);
    const inPriceRange = price >= min && price <= max;
    return matchesSearch && inPriceRange;
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
        if (!grouped['Sin Sucursal']) {
          grouped['Sin Sucursal'] = [];
        }
        grouped['Sin Sucursal'].push(item);
      }
    });
    return grouped;
  };

  const groupedItems = groupBySucursal(filteredItems);
  const allSucursales = [...new Set(items.flatMap(item => item.sucursales ? item.sucursales.map(s => s.nombre) : []))];

  return (
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
          <select
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            className={styles.priceInput}
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
            className={styles.priceInput}
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
                  key={item.id}
                  item={item}
                  onReservar={handleReserve}
                  tipoUsuario="interno"
                />
              ))}
            </div>
          </div>
        ))}

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
  );
};

export default BreadList;