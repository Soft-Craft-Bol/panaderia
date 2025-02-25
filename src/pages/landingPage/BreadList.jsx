import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getStockWithSucursal } from '../../service/api'; 
import styles from './BreadList.module.css';

const BreadList = () => {
  const navigate = useNavigate();

  const [items, setItems] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [selectedSucursal, setSelectedSucursal] = useState('');

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [pendingReservation, setPendingReservation] = useState(null);

  useEffect(() => {
    getStockWithSucursal()
      .then((response) => {
        setItems(response.data);
        console.log('Productos obtenidos:', response.data);
      })
      .catch((error) => {
        console.error('Error al obtener los productos:', error);
      });

    const storedFavs = localStorage.getItem('favoriteItems');
    if (storedFavs) {
      setFavorites(JSON.parse(storedFavs));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('favoriteItems', JSON.stringify(favorites));
  }, [favorites]);

  const isFavorite = (itemId) => {
    return favorites.includes(itemId);
  };

  const toggleFavorite = (itemId) => {
    if (isFavorite(itemId)) {
      setFavorites(prev => prev.filter(id => id !== itemId));
    } else {
      setFavorites(prev => [...prev, itemId]);
    }
  };

  const handleReserve = (productId) => {
    if (isLoggedIn) {
      console.log(`Reservando producto con ID: ${productId}`);
    } else {
      setPendingReservation(productId);
      setShowModal(true);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setPendingReservation(null);
  };

  const confirmRegister = () => {
    setShowModal(false);
    navigate('/register');
  };

  const filteredItems = items.filter((item) => {
    const matchesSearch = item.descripcion
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

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

  // Obtener todas las sucursales únicas
  const allSucursales = [...new Set(items.flatMap(item => 
    item.sucursales ? item.sucursales.map(s => s.nombre) : []
  ))];

  return (
    <div className={styles.pageContainer}>
    <h1>Productos</h1>
      <div className={styles.heroSection}>
        <h1 className={styles.mainTitle}>Variedad de Panes</h1>

        {/* Título general sobre los filtros */}
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

      {Object.keys(groupedItems)
        .filter((sucursal) => 
          selectedSucursal === '' || sucursal === selectedSucursal
        )
        .map((sucursal) => (
          <div key={sucursal} className={styles.sucursalSection}>
            <h2 className={styles.sucursalTitle}>{sucursal}</h2>
            <div className={styles.breadGrid}>
              {groupedItems[sucursal].map((item) => (
                <div
                  key={item.id}
                  className={`${styles.breadCard} ${styles.fadeInUp}`}
                >
                  <div className={styles.breadImageContainer}>
                    <img
                      src={item.imagen}
                      alt={item.descripcion}
                      className={styles.breadImage}
                    />
                  </div>

                  {/* Info */}
                  <div className={styles.breadInfo}>
                    <h2 className={styles.breadDescription}>
                      {item.descripcion}
                    </h2>
                    <p className={styles.breadPrice}>
                      Precio: <strong>${item.precioUnitario?.toFixed(2)}</strong>
                    </p>
                    {item.sucursal && (
                      <p className={styles.breadQuantity}>
                        Cantidad en {item.sucursal.nombre}: {item.sucursal.cantidad}
                      </p>
                    )}
                  </div>

                  <div className={styles.cardActions}>
                    <button
                      className={styles.favButton}
                      onClick={() => toggleFavorite(item.id)}
                    >
                      {isFavorite(item.id) ? '❤️' : '🤍'}
                    </button>

                    <button
                      onClick={() => handleReserve(item.id)}
                      className={styles.reserveButton}
                    >
                      Reservar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

      {showModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h2 className={styles.modalTitle}>Necesitas registrarte</h2>
            <p>
              Para poder reservar este producto, primero debes registrarte o iniciar sesión.
            </p>
            <div className={styles.modalActions}>
              <button onClick={confirmRegister} className={styles.modalButton}>
                Ir a registro
              </button>
              <button onClick={closeModal} className={styles.modalButtonSec}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BreadList;