import React, { useState, useCallback, useEffect, useMemo, memo } from "react";
import { useNavigate } from "react-router-dom";
import './ProductoVentas.css';
import { Toaster, toast } from "sonner";
import InfiniteScroll from 'react-infinite-scroll-component';
import Carrito from "./Carrito";
import { useProductos } from "../../hooks/useProductos";
import LinkButton from "../../components/buttons/LinkButton";
import { useVentas } from "../../hooks/useVentas";
import ModalConfirm from "../../components/modalConfirm/ModalConfirm";
import { getUser } from "../../utils/authFunctions";

const currentUser = getUser();
if (!currentUser?.puntosVenta || currentUser.puntosVenta.length === 0) {
  alert('No cuenta con sucursales asignadas.');
}

const ID_SUCURSAL_ACTUAL = currentUser.puntosVenta[0].id;
// Componente memoizado para evitar rerenders innecesarios
const ProductoCard = memo(({ product, addToCart, getCurrentStock }) => {
    const currentStock = getCurrentStock(product);
    const currentSucursal = product.sucursales?.find(s => s.sucursalId === ID_SUCURSAL_ACTUAL);
    const tieneDescuento = currentSucursal?.tieneDescuento || false;
    const precioConDescuento = tieneDescuento ? currentSucursal.precioConDescuento : product.precioUnitario;
    const discountPercentage = tieneDescuento 
        ? Math.round((1 - (precioConDescuento / product.precioUnitario)) * 100 
        )
        : 0;

    const handleAddToCart = () => {
        if (currentStock > 0) addToCart(product);
    };

    return (
        <div
            className={`producto-card ${currentStock < 1 ? 'no-stock' : ''} ${tieneDescuento ? 'has-discount' : ''}`}
            onClick={handleAddToCart}
        >
            {tieneDescuento && (
                <div className="discount-badge">
                    {discountPercentage} % OFF
                </div>
            )}

            <div className="producto-image-container">
                {product.imagen ? (
                    <img
                        src={product.imagen}
                        alt={product.descripcion}
                        className="producto-image"
                        loading="lazy"
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
});

const ProductosVentas = () => {
    const {
        productos,
        searchTerm,
        setSearchTerm,
        fetchNextPage,
        hasNextPage,
        isFetching
    } = useProductos();
    
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [cart, setCart] = useState([]);
    const [ventaData, setVentaData] = useState(null);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const navigate = useNavigate();
    const { realizarVenta, isLoading, error, reset } = useVentas();
    const currentUser = getUser();

    const puntosDeVenta = currentUser?.puntosVenta? currentUser.puntosVenta[0].id : null;

    // Persistir el carrito en localStorage con debounce
    useEffect(() => {
        const savedCart = localStorage.getItem('ventasCart');
        if (savedCart) {
            setCart(JSON.parse(savedCart));
        }
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => {
            localStorage.setItem('ventasCart', JSON.stringify(cart));
        }, 300);
        
        return () => clearTimeout(timer);
    }, [cart]);

    const getCurrentStock = useCallback((product) => {
        const sucursal = product.sucursales?.find(s => s.sucursalId === ID_SUCURSAL_ACTUAL);
        return sucursal ? sucursal.cantidad : 0;
    }, []);

    const addToCart = useCallback((product) => {
        const currentStock = getCurrentStock(product);
        if (currentStock < 1) {
            toast.error('No hay stock disponible');
            return;
        }

        setCart(prevCart => {
            const existingItem = prevCart.find(item => item.id === product.id);
            const currentSucursal = product.sucursales?.find(s => s.sucursalId === ID_SUCURSAL_ACTUAL);
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
    }, [getCurrentStock]);

    const updateQuantity = useCallback((productId, newQuantity) => {
        setCart(prevCart => {
            const product = prevCart.find(item => item.id === productId);
            if (!product) return prevCart;

            const currentStock = product.stockActual;

            if (newQuantity <= 0) {
                return prevCart.filter(item => item.id !== productId);
            }

            newQuantity = Math.min(newQuantity, currentStock);

            return prevCart.map(item =>
                item.id === productId
                    ? { ...item, quantity: newQuantity }
                    : item
            );
        });
    }, []);

    const handleCheckout = useCallback(async () => {
    try {
        const productosConStockVerificado = cart.map(item => {
            if (item.quantity > item.stockActual) {
                throw new Error(`No hay suficiente stock para ${item.descripcion}`);
            }
            
            return {
                ...item,
                tieneDescuento: item.tieneDescuento || false,
                precioConDescuento: item.tieneDescuento 
                    ? item.precioConDescuento 
                    : item.precioUnitario,
                unidadMedida: item.unidadMedida || 1 // Asegurar que tenga unidad de medida
            };
        });
    
        navigate('/impuestos-form1', { 
            state: { 
                productosSeleccionados: productosConStockVerificado,
                sucursalId: ID_SUCURSAL_ACTUAL,
                puntoVentaId: puntosDeVenta,
            } 
        });
    } catch (error) {
        toast.error(error.message);
    }
}, [cart, navigate, currentUser]);

    const totalCompra = useMemo(() => 
        cart.reduce((total, item) => 
            total + ((item.tieneDescuento ? item.precioConDescuento : item.precioUnitario) * item.quantity)
        , 0), 
    [cart]);
    const totalConDescuentos = ventaData?.detalle.reduce((total, item) => {
        return total + (item.precioUnitario * item.cantidad - item.montoDescuento);
    }, 0);

    // Memoizar la lista de productos para evitar rerenders innecesarios
    const productosList = useMemo(() => (
        productos.map(product => (
            <ProductoCard 
                key={product.id} 
                product={product} 
                addToCart={addToCart} 
                getCurrentStock={getCurrentStock} 
            />
        ))
    ), [productos, addToCart, getCurrentStock]);

    const handleFinalizarVenta = useCallback(async () => {
        if (cart.length === 0) {
            toast.error('El carrito está vacío');
            return;
        }
    
        // Verificar stock antes de proceder
        const productosConStockVerificado = cart.map(item => {
            if (item.quantity > item.stockActual) {
                throw new Error(`No hay suficiente stock para ${item.descripcion}`);
            }
            return item;
        });
        // Preparar los datos para la venta sin factura
        const data = {
            idCliente: 1,
            idPuntoVenta: ID_SUCURSAL_ACTUAL,
            tipoComprobante: "RECIBO",
            username: "Gaspar",
            metodoPago: "EFECTIVO",
            detalle: productosConStockVerificado.map(item => {
                // Calcular el descuento unitario
                const descuentoUnitario = item.tieneDescuento 
                    ? (item.precioUnitario - item.precioConDescuento)
                    : 0;
                
                // Calcular el monto total de descuento
                const montoDescuento = descuentoUnitario * item.quantity;
                
                return {
                    idProducto: item.id,
                    cantidad: Number(item.quantity),
                    montoDescuento: Number(montoDescuento.toFixed(2)),
                    precioUnitario: Number(item.precioUnitario.toFixed(2)) // Siempre enviar precio original
                };
            })
        };
    
        setVentaData(data);
        setShowConfirmModal(true);
    }, [cart]);
    
    const confirmarVenta = async () => {
        setShowConfirmModal(false);
        
        try {
            const result = await realizarVenta(ventaData);
            
            if (result.success) {
                toast.success(`Venta exitosa! N° ${result.data.id}`, {
                    duration: 5000,
                });
                
                // Limpiar el carrito
                setCart([]);
                localStorage.removeItem('ventasCart');
                
                console.log("Venta completada:", result.data);
            } else {
                throw result.error;
            }
        } catch (error) {
            console.error("Error en la venta:", error);
            
            const errorMessage = error.response?.data?.message || 
                               error.response?.statusText || 
                               error.message || 
                               'Error al procesar la venta';
            
            toast.error(`Error: ${errorMessage}`, {
                duration: 7000,
                action: {
                    label: 'Reintentar',
                    onClick: () => confirmarVenta()
                }
            });
        }
    };


    return (
        <div className="ventas-container">
            <Toaster richColors position="top-center" />

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
                        loader={<div className="loading-message">Cargando más productos...</div>}
                        className="productos-scroll"
                        style={{ overflow: 'visible' }}
                    >
                        <div className="productos-grid">
                            {productosList}
                        </div>
                    </InfiniteScroll>
                </div>
            </div>
            <ModalConfirm
                isOpen={showConfirmModal}
                onClose={() => setShowConfirmModal(false)}
                onConfirm={confirmarVenta}
                title="Confirmar Venta"
                message={`¿Estás seguro de realizar esta venta por un total de Bs ${totalConDescuentos?.toFixed(2)}?`}
                confirmText={isLoading ? "Procesando..." : "Confirmar"}
                cancelText="Cancelar"
                danger={false}
            />

            <Carrito
    cart={cart}
    updateQuantity={updateQuantity}
    handleCheckout={handleCheckout}
    handleFinalizarVenta={handleFinalizarVenta}
    totalCompra={totalCompra}
    isOpen={isCartOpen}
    toggleCart={() => setIsCartOpen(!isCartOpen)}
/>
        </div>
    );
};

export default React.memo(ProductosVentas);