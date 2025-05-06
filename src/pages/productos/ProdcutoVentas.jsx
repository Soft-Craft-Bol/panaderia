import React, { useState, useCallback, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import './ProductoVentas.css';
import { Toaster, toast } from "sonner";
import InfiniteScroll from 'react-infinite-scroll-component';
import Carrito from "./Carrito";
import { useProductos } from "../../hooks/useProductos";

const ID_SUCURSAL_ACTUAL = 1;

const ProductosVentas = () => {
    const {
        productos,
        searchTerm,
        setSearchTerm,
        fetchNextPage,
        hasNextPage,
        isFetching
    } = useProductos();
    
    const [isCartOpen, setIsCartOpen] = useState(true);
    const [cart, setCart] = useState([]);
    const navigate = useNavigate();

    // Persistir el carrito en localStorage
    useEffect(() => {
        const savedCart = localStorage.getItem('ventasCart');
        if (savedCart) {
            setCart(JSON.parse(savedCart));
        }
    }, []);

    useEffect(() => {
        localStorage.setItem('ventasCart', JSON.stringify(cart));
    }, [cart]);

    const getCurrentStock = useCallback((product) => {
        const sucursal = product.sucursales?.find(s => s.sucursalId === ID_SUCURSAL_ACTUAL);
        return sucursal ? sucursal.cantidad : 0;
    }, []);

    const addToCart = (product) => {
        const currentStock = getCurrentStock(product);
        if (currentStock < 1) {
            toast.error('No hay stock disponible');
            return;
        }

        setCart(prevCart => {
            const existingItem = prevCart.find(item => item.id === product.id);
            const currentSucursal = product.sucursales?.find(s => s.sucursalId === ID_SUCURSAL_ACTUAL)
            const precioConDescuento = currentSucursal?.tieneDescuento
                ? currentSucursal.precioConDescuento
                : product.precioUnitario;

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
                precioConDescuento: precioConDescuento,
                stockActual: currentStock,
                tieneDescuento: currentSucursal?.tieneDescuento || false
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
          const productosConStockVerificado = cart.map(item => {
            const currentStock = getCurrentStock(item);
            if (item.quantity > currentStock) {
              throw new Error(`No hay suficiente stock para ${item.descripcion}`);
            }
            
            const currentSucursal = item.sucursales?.find(s => s.sucursalId === ID_SUCURSAL_ACTUAL);
            return {
              ...item,
              stockActual: currentStock,
              tieneDescuento: currentSucursal?.tieneDescuento || false,
              precioConDescuento: currentSucursal?.tieneDescuento 
                ? currentSucursal.precioConDescuento 
                : item.precioUnitario
            };
          });
      
          navigate('/facturacion', { 
            state: { 
              productosSeleccionados: productosConStockVerificado,
              sucursalId: ID_SUCURSAL_ACTUAL
            } 
          });
        } catch (error) {
          toast.error(error.message);
        }
      };
      
    const totalCompra = useMemo(() => 
        cart.reduce((total, item) => 
            total + ((item.tieneDescuento ? item.precioConDescuento : item.precioUnitario) * item.quantity)
        , 0), 
    [cart]);
    

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
                        hasMore={!!hasNextPage && !isFetching}
                        className="productos-scroll"
                        style={{ overflow: 'visible' }}
                    >
                        <div className="productos-grid">
                            {productos.map((product) => {
                                const currentStock = getCurrentStock(product);
                                const currentSucursal = product.sucursales?.find(s => s.sucursalId === ID_SUCURSAL_ACTUAL)
                                const tieneDescuento = currentSucursal?.tieneDescuento || false;
                                const precioConDescuento = tieneDescuento
                                    ? currentSucursal.precioConDescuento
                                    : product.precioUnitario;

                                return (
                                    <div
                                        key={product.id}
                                        className={`producto-card ${currentStock < 1 ? 'no-stock' : ''} ${tieneDescuento ? 'has-discount' : ''}`}
                                        onClick={() => currentStock > 0 && addToCart(product)}
                                    >
                                        {tieneDescuento && (
                                            <div className="discount-badge">
                                                {Math.round((1 - (precioConDescuento / product.precioUnitario)) * 100)} % OFF
                                            </div>
                                        )}

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
                                                    <span className="detail-value">{product.codigo}</span>
                                                </div>
                                                <div className="detail-row">
                                                    <span className="detail-label">Precio:</span>
                                                    <div className="price-container">
                                                        {tieneDescuento && (
                                                            <span className="original-price">
                                                                Bs {product.precioUnitario.toFixed(2)}
                                                            </span>
                                                        )}
                                                        <span className={`detail-value price ${tieneDescuento ? 'discounted' : ''}`}>
                                                            Bs {precioConDescuento.toFixed(2)}
                                                        </span>
                                                    </div>
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