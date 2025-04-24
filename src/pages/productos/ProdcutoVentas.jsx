import React, { useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import './ProductoVentas.css';
import { getStockWithSucursal } from '../../service/api';
import { Toaster, toast } from "sonner";
import InfiniteScroll from 'react-infinite-scroll-component';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useDebounce } from 'use-debounce';
import Carrito from "./Carrito";



const ID_SUCURSAL_ACTUAL = 1;

const ProductosVentas = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isCartOpen, setIsCartOpen] = useState(true);
  const [cart, setCart] = useState([]);
  const [debouncedSearchTerm] = useDebounce(searchTerm, 400);

  const navigate = useNavigate();

  const getCurrentStock = useCallback((product) => {
    const sucursal = product.sucursales?.find(s => s.id === ID_SUCURSAL_ACTUAL);
    return sucursal ? sucursal.cantidad : 0;
  }, []);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ['productos', debouncedSearchTerm],
    queryFn: ({ pageParam = 0 }) => getStockWithSucursal(pageParam, 10, debouncedSearchTerm).then(res => ({
      productos: res.data.content,
      nextPage: !res.data.last ? pageParam + 1 : undefined
    })),
    getNextPageParam: lastPage => lastPage.nextPage
  });

  const productos = data?.pages.flatMap(p => p.productos) || [];

  const addToCart = (product) => {
    const currentStock = getCurrentStock(product);
    if (currentStock < 1) {
      toast.error('No hay stock disponible');
      return;
    }

    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === product.id);
      if (existingItem) {
        if (existingItem.quantity + 1 > currentStock) {
          toast.error('No hay suficiente stock');
          return prevCart;
        }
        return prevCart.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prevCart, {
        ...product,
        quantity: 1,
        precioUnitario: product.precioUnitario,
        stockActual: currentStock
      }];
    });
  };

  const updateQuantity = (productId, newQuantity) => {
    const product = productos.find(p => p.id === productId);
    const currentStock = getCurrentStock(product);

    if (newQuantity <= 0) {
      setCart(prevCart => prevCart.filter(item => item.id !== productId));
      return;
    }

    newQuantity = Math.min(newQuantity, currentStock);

    setCart(prevCart =>
      prevCart.map(item =>
        item.id === productId
          ? { ...item, quantity: newQuantity }
          : item
      )
    );
  };

  const handleCheckout = async () => {
    try {
      toast.success("Venta realizada exitosamente");
      setCart([]);
    } catch (error) {
      toast.error("Error al procesar la venta");
    }
  };

  const totalCompra = cart.reduce((total, item) =>
    total + (item.precioUnitario * item.quantity), 0);  

  return (
    <div className="ventas-container">
      <Toaster richColors position="bottom-right" />

      <div className="ventas-header">
        <h1>Punto de Venta</h1>
        <div className="search-box">
        <input
  type="text"
  placeholder="🔍 Buscar producto..."
  value={searchTerm}
  onChange={(e) => setSearchTerm(e.target.value)}
/>

        </div>
      </div>

      <div className="ventas-main-content">
        <div className="productos-section">
          <InfiniteScroll
            dataLength={productos.length}
            next={fetchNextPage}
            hasMore={!!hasNextPage}
            loader={<div className="loading">Cargando más productos...</div>}
            className="productos-scroll"
            style={{ overflow: 'visible' }}
          >
            <div className="productos-grid">
              {productos.map((product) => {
                const currentStock = getCurrentStock(product);
                return (
                  <div
                    key={product.id}
                    className={`producto-card ${currentStock < 1 ? 'no-stock' : ''}`}
                    onClick={() => currentStock > 0 && addToCart(product)}
                  >
                    <div className="producto-image-container">
                      {product.imagen ? (
                        <img
                          src={product.imagen}
                          alt={product.descripcion}
                          className="producto-image"
                          onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/150?text=Sin+Imagen';
                          }}
                        />
                      ) : (
                        <div className="producto-image-placeholder">
                          <span>Sin imagen</span>
                        </div>
                      )}
                    </div>

                    <div className="producto-info">
                      <h3 className="producto-name">{product.descripcion}</h3>
                      <div className="producto-details">
                        <div className="detail-row">
                          <span className="detail-label">Código:</span>
                          <span className="detail-value">{product.codigoProductoSin}</span>
                        </div>
                        <div className="detail-row">
                          <span className="detail-label">Precio:</span>
                          <span className="detail-value price">Bs {product.precioUnitario.toFixed(2)}</span>
                        </div>
                        <div className="detail-row">
                          <span className="detail-label">Stock:</span>
                          <span className={`detail-value stock ${currentStock < 5 ? 'low-stock' : ''}`}>
                            {currentStock}
                          </span>
                        </div>
                      </div>
                    </div>

                    {currentStock > 0 && (
                      <button className="add-button">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                          <path d="M12 6V18M6 12H18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                        Agregar
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </InfiniteScroll>
        </div>
      </div>

      <Carrito
        cart={cart}
        updateQuantity={updateQuantity}
        handleCheckout={handleCheckout}
        totalCompra={totalCompra}
        isOpen={isCartOpen}
        toggleCart={() => setIsCartOpen(!isCartOpen)}
      />
    </div>
  );
};

export default ProductosVentas;
