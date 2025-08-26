import React, { useState, useCallback, useEffect, useMemo, memo } from "react";
import { useNavigate } from "react-router-dom";
import './ProductoVentas.css';
import { Toaster, toast } from "sonner";
import InfiniteScroll from 'react-infinite-scroll-component';
import Carrito from "./Carrito";
import { useProductos } from "../../hooks/useProductos";
import { useVentas } from "../../hooks/useVentas";
import Modal from "../../components/modal/Modal";
import { getUser } from "../../utils/authFunctions";
import { FaCashRegister, FaEnvelope, FaPrint } from "react-icons/fa";
import ProductoCard from "../../components/card/ProductoCard";
import SelectSecondary from "../../components/selected/SelectSecondary";
import SearchInput from "../../components/search/SearchInput";
import InputText from "../../components/inputs/InputText";
import { Button } from "../../components/buttons/Button";
import { generateReciboPDF } from "../../utils/generateReciboPDF";
import { getCategorias } from "../../service/api";
import { useQuery } from "@tanstack/react-query";
import { useCajaActiva } from "../../hooks/useHistorialCajas";
import FiltrosVentas from "./FiltrosVentas";

const currentUser = getUser();
console.log("Usuario actual:", currentUser);
if (!currentUser?.puntosVenta || currentUser.puntosVenta.length === 0) {
    alert('No cuenta con sucursales asignadas.');
}

const ID_SUCURSAL_ACTUAL = currentUser.puntosVenta[0].id;

const ProductosVentas = () => {
    const {
        productos,
        searchTerm,
        setSearchTerm,
        codigoProductoSin,
        setCodigoProductoSin,
        loadMore,
        hasNextPage,
        isFetching,
        refetch,
        conDescuento,
        setConDescuento,
        categoriaId,
        setCategoriaId,
        sinStock,
        setSinStock,
        sortField,
        setSortField,
        invalidateAndRefetch
    } = useProductos(ID_SUCURSAL_ACTUAL);
    const [isCartOpen, setIsCartOpen] = useState(false);
    //const [cart, setCart] = useState([]);
    const [ventaData, setVentaData] = useState(null);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const navigate = useNavigate();
    const { realizarVenta, isLoading, error, reset } = useVentas();
    const [metodoPago, setMetodoPago] = useState("EFECTIVO");
    const [montoPagado, setMontoPagado] = useState("");
    const [ventaCompletada, setVentaCompletada] = useState(null);
    const [showReciboModal, setShowReciboModal] = useState(false);
    const [cajaAbierta, setCajaAbierta] = useState(null);
    const [nombreClienteRecibo, setNombreClienteRecibo] = useState("");
    const [activeCartIndex, setActiveCartIndex] = useState(0);
    const [carts, setCarts] = useState([[], [], [], []]);

    const cart = carts[activeCartIndex];

    const switchCart = (index) => {
        if (index >= 0 && index < carts.length) {
            setActiveCartIndex(index);
        }
    };

    const createNewCart = () => {
        if (carts.length >= 4) {
            toast.warning('Solo se permiten hasta 4 carritos simultáneos');
            return;
        }
        setCarts([...carts, []]);
    };

    const categories = useMemo(() => [
        { value: '', label: 'TODAS LAS CATEGORÍAS' },
        { value: '23410', label: 'GALLETAS' },
        { value: '23420', label: 'PAN DULCE' },
        { value: '23430', label: 'PASTELERÍA' },
        { value: '23490', label: 'PANADERÍA' },
        { value: '99100', label: 'OTROS' },
        { value: '234109', label: 'GALLETAS IMPORT.' },
        { value: '234209', label: 'PAN DULCE IMPORT.' },
        { value: '234309', label: 'PASTELERÍA IMPORT.' },
        { value: '234909', label: 'PANADERÍA IMPORT.' },
        { value: '991009', label: 'OTROS IMPORT.' }
    ], []);

    const {
        data: cajaActiva,
        isLoading: isLoadingCaja,
        refetch: refetchCaja
    } = useCajaActiva(currentUser?.id);

    useEffect(() => {
        const timer = setTimeout(() => {
            localStorage.setItem('ventasCarts', JSON.stringify(carts));
        }, 300);

        return () => clearTimeout(timer);
    }, [carts]);

    const { data: categoriasData, isLoading: categoriasLoading } = useQuery({
        queryKey: ['categorias'],
        queryFn: () => getCategorias()
            .then(res => {
                return res.data;
            })
            .catch(error => {
                console.error("Error obteniendo categorías:", error);
                return [];
            }),
    });

    const categoriasOptions = useMemo(() => {
        if (!Array.isArray(categoriasData)) {
            return [{ value: null, label: 'TODAS LAS CATEGORÍAS' }];
        }

        return [
            { value: null, label: 'TODAS LAS CATEGORÍAS' },
            ...categoriasData
                .filter(cat => cat?.id && cat?.nombre)
                .map(cat => ({
                    value: cat.id,
                    label: cat.nombre
                }))
        ];
    }, [categoriasData]);

    useEffect(() => {
        const timer = setTimeout(() => {
            localStorage.setItem('ventasCarts', JSON.stringify(cart));
        }, 300);

        return () => clearTimeout(timer);
    }, [cart]);

    const getCurrentStock = useCallback((product) => {
        return product.cantidadDisponible || 0;
    }, []);

    const addToCart = useCallback((product) => {
        const currentStock = getCurrentStock(product);
        if (currentStock < 1) {
            toast.error('No hay stock disponible');
            return;
        }

        setCarts(prevCarts => {
            return prevCarts.map((cart, index) => {
                if (index !== activeCartIndex) return cart;

                const existingItem = cart.find(item => item.id === product.id);
                if (existingItem) {
                    if (existingItem.quantity + 1 > currentStock) {
                        toast.error('No hay suficiente stock');
                        return cart;
                    }
                    return cart.map(item =>
                        item.id === product.id
                            ? { ...item, quantity: item.quantity + 1 }
                            : item
                    );
                }
                return [...cart, {
                    ...product,
                    quantity: 1,
                    precioUnitario: product.precioUnitario,
                    precioConDescuento: product.precioConDescuento,
                    stockActual: currentStock,
                    tieneDescuento: product.tieneDescuento || false
                }];
            });
        });
    }, [activeCartIndex, getCurrentStock]);

    const updateQuantity = useCallback((productId, newQuantity) => {
        setCarts(prevCarts => {
            return prevCarts.map((cart, index) => {
                if (index !== activeCartIndex) return cart;

                const product = cart.find(item => item.id === productId);
                if (!product) return cart;

                const currentStock = product.stockActual;

                if (newQuantity <= 0) {
                    return cart.filter(item => item.id !== productId);
                }

                newQuantity = Math.min(newQuantity, currentStock);

                return cart.map(item =>
                    item.id === productId
                        ? { ...item, quantity: newQuantity }
                        : item
                );
            });
        });
    }, [activeCartIndex]);

    const vaciarCarrito = useCallback(() => {
        if (cart.length === 0) {
            toast.info('El carrito ya está vacío');
            return;
        }

        const confirmar = window.confirm('¿Estás seguro de que deseas vaciar este carrito?');
        if (confirmar) {
            setCarts(prevCarts => {
                return prevCarts.map((c, index) =>
                    index === activeCartIndex ? [] : c
                );
            });
            toast.success('Carrito vaciado correctamente');
        }
    }, [activeCartIndex, cart.length]);

    // Modificamos el localStorage para guardar todos los carritos




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
                    unidadMedida: item.unidadMedida || 1
                };
            });

            navigate('/impuestos-form1', {
                state: {
                    productosSeleccionados: productosConStockVerificado,
                    sucursalId: ID_SUCURSAL_ACTUAL,
                    puntoVentaId: ID_SUCURSAL_ACTUAL,
                }
            });
        } catch (error) {
            toast.error(error.message);
        }
    }, [cart, navigate]);

    const totalCompra = useMemo(() =>
        cart.reduce((total, item) =>
            total + ((item.tieneDescuento ? item.precioConDescuento : item.precioUnitario) * item.quantity)
            , 0),
        [cart]);
    const totalConDescuentos = ventaData?.detalle.reduce((total, item) => {
        return total + (item.precioUnitario * item.cantidad - item.montoDescuento);
    }, 0);


    const cambio = useMemo(() => {
        if (metodoPago !== "EFECTIVO") return "0.00";

        const total = totalConDescuentos || 0;
        const pagado = parseFloat(montoPagado) || total;
        return pagado > total ? (pagado - total).toFixed(2) : "0.00";
    }, [montoPagado, totalConDescuentos, metodoPago]);

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


    const confirmarVenta = async () => {
        try {
            const result = await realizarVenta(ventaData);

            if (result.success) {
                console.log("Venta realizada con éxito:", result.data);
                toast.success(`Venta exitosa! N° ${result.data.idVenta}`, { duration: 5000 });
                setVentaCompletada(result.data);
                setCart([]);
                localStorage.removeItem('ventasCarts');

                await invalidateAndRefetch();

                if (nombreClienteRecibo.trim()) {
                    setShowReciboModal(true);
                } else {
                    toast.info("Venta completada sin recibo", { duration: 3000 });
                    resetearFormulario();
                }
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

    const handleFinalizarVenta = useCallback(async () => {
        if (cart.length === 0) {
            toast.error('El carrito está vacío');
            return;
        }

        try {
            const productosConStockVerificado = cart.map(item => {
                if (item.quantity > item.stockActual) {
                    throw new Error(`No hay suficiente stock para ${item.descripcion}`);
                }
                return item;
            });

            const totalVenta = productosConStockVerificado.reduce((total, item) => {
                const precio = item.tieneDescuento ? item.precioConDescuento : item.precioUnitario;
                return total + (precio * item.quantity);
            }, 0);

            const montoRecibidoValue = metodoPago === "EFECTIVO"
                ? parseFloat(montoPagado) || totalVenta
                : totalVenta;

            const data = {
                idCliente: 1,
                idPuntoVenta: ID_SUCURSAL_ACTUAL,
                tipoComprobante: "RECIBO",
                username: currentUser.username,
                metodoPago,
                montoRecibido: montoRecibidoValue,
                montoDevuelto: metodoPago === "EFECTIVO" ? parseFloat(cambio) || 0 : 0,
                cajaId: cajaActiva.id,
                nombreCliente: nombreClienteRecibo.trim() || "CONSUMIDOR FINAL",
                detalle: productosConStockVerificado.map(item => {
                    const descuentoUnitario = item.tieneDescuento
                        ? (item.precioUnitario - item.precioConDescuento)
                        : 0;
                    const montoDescuento = descuentoUnitario * item.quantity;

                    return {
                        idProducto: item.id,
                        cantidad: Number(item.quantity),
                        montoDescuento: Number(montoDescuento.toFixed(2)),
                        precioUnitario: Number(item.precioUnitario.toFixed(2))
                    };
                })
            };

            console.log("Datos preparados para venta:", data);
            setVentaData(data);
            setShowConfirmModal(true);
        } catch (error) {
            toast.error(error.message);
        }
    }, [cart, currentUser, metodoPago, montoPagado, cambio, nombreClienteRecibo]);

    const searchInputRef = React.useRef(null);

    const handleKeyDown = useCallback((e) => {
        if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) {
            return;
        }

        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
            e.preventDefault();
            searchInputRef.current?.focus();
            return;
        }

        switch (e.key) {
            case 'F1':
                e.preventDefault();
                navigate('/addProduct');
                break;
            case 'F2':
                e.preventDefault();
                setIsCartOpen(prev => !prev);
                break;
            case 'F3':
                e.preventDefault();
                if (cart.length > 0) {
                    handleFinalizarVenta();
                } else {
                    toast.warning('El carrito está vacío');
                }
                break;
            case 'F4':
                e.preventDefault();
                navigate('/cierre-caja');
                break;
            case 'F5':
                e.preventDefault();
                if (cart.length > 0) {
                    vaciarCarrito();
                } else {
                    toast.warning('El carrito está vacío');
                }
                break;
            case 'Escape':
                e.preventDefault();
                if (isCartOpen) setIsCartOpen(false);
                if (showConfirmModal) setShowConfirmModal(false);
                if (showReciboModal) setShowReciboModal(false);
                break;
            case '+':
                if (cart.length > 0) {
                    e.preventDefault();
                    const lastItem = cart[cart.length - 1];
                    updateQuantity(lastItem.id, lastItem.quantity + 1);
                }
                break;
            case '-':
                if (cart.length > 0) {
                    e.preventDefault();
                    const lastItem = cart[cart.length - 1];
                    updateQuantity(lastItem.id, lastItem.quantity - 1);
                }
                break;
            case 'ArrowRight':
                if (isCartOpen) {
                    e.preventDefault();
                    handleCheckout();
                }
                break;
            default:
                break;
        }
    }, [cart, isCartOpen, showConfirmModal, showReciboModal, navigate, handleFinalizarVenta, updateQuantity, handleCheckout]);


    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [handleKeyDown]);

    const resetearFormulario = () => {
        setNombreClienteRecibo("");
        setMetodoPago("EFECTIVO");
        setMontoPagado("");
        setVentaData(null);
        setVentaCompletada(null);
        setShowConfirmModal(false);
        setShowReciboModal(false);
    };


    const handlePrintReceipt = () => {
        if (!ventaCompletada) {
            toast.error("No hay datos de venta para generar el recibo.");
            return;
        }

        if (!nombreClienteRecibo) {
            toast.error("Debes ingresar el nombre para el recibo.");
            return;
        }

        const quiereImprimir = window.confirm(`¿Desea imprimir el recibo para ${nombreClienteRecibo}?`);
        if (!quiereImprimir) {
            toast.info("No se imprimió el recibo.");
            return;
        }

        const pdfData = {
            ...ventaCompletada,
            cliente: nombreClienteRecibo,
            vendedor: {
                firstName: currentUser.firstName,
                lastName: currentUser.lastName
            },
            puntoVenta: {
                sucursal: {
                    empresa: {
                        razonSocial: "INPASEP"
                    },
                    nombre: "VILLA ARMONIA",
                    direccion: "ENTRE AV. ATAHUALLPA Y A DOS CUADRAS DE LA FELCC, CASA DE TRES PISOS COLOR BLANCO BARRIO VILLA ARMONIA Nro.: 8 Zona/Barrio.: VILLA ARMONIA",
                    telefono: "62982552"
                }
            },
            detalles: ventaCompletada.detalles.map(detalle => ({
                ...detalle,
                descripcionProducto: detalle.producto?.descripcion || "Producto sin nombre",
                monto: detalle.precioUnitario * detalle.cantidad - detalle.montoDescuento
            }))
        };

        generateReciboPDF(pdfData);
        toast.success(`Recibo generado para ${nombreClienteRecibo}`);
        setShowConfirmModal(false);
    };


    return (
        <div className={`ventas-container ${isCartOpen ? 'cart-open' : 'cart-closed'}`}>
            <Toaster richColors position="top-center" />
            <div className="keyboard-shortcuts-hint">
                <span>Atajos: F1(Nuevo) | F2(Carrito) | F3(Finalizar) | F4(Cierre) | Esc(Cerrar)</span>
            </div>
            <h1>Punto de Venta</h1>
            <button
                className="cierre-caja-button"
                onClick={() => navigate('/cierre-caja')}
            >
                <FaCashRegister className="button-icon" />
                Cierre de Caja
            </button>
            <div className="cart-switcher">
                {carts.map((_, index) => (
                    <button
                        key={index}
                        className={`cart-tab ${activeCartIndex === index ? 'active' : ''}`}
                        onClick={() => switchCart(index)}
                    >
                        Carrito {index + 1}
                        {carts[index].length > 0 && (
                            <span className="cart-tab-badge">
                                {carts[index].length}
                            </span>
                        )}
                    </button>
                ))}
                {carts.length < 4 && (
                    <button
                        className="cart-tab new-cart"
                        onClick={createNewCart}
                    >
                        + Nuevo
                    </button>
                )}
            </div>
            <FiltrosVentas
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                sortField={sortField}
                setSortField={setSortField}
                categoriasOptions={categoriasOptions}
                categoriaId={categoriaId}
                setCategoriaId={setCategoriaId}
                codigoProductoSin={codigoProductoSin}
                setCodigoProductoSin={setCodigoProductoSin}
                conDescuento={conDescuento}
                setConDescuento={setConDescuento}
                sinStock={sinStock}
                setSinStock={setSinStock}
                categories={categories}
            />

            <div className="ventas-main-content">
                <div className="productos-section">
                    <InfiniteScroll
                        dataLength={productos.length}
                        next={loadMore}
                        hasMore={hasNextPage}
                        loader={<div className="loading-message">Cargando más productos...</div>}
                        className="productos-scroll"
                        style={{ overflow: 'visible' }}
                        scrollThreshold={0.8}
                    >
                        <div className="productos-grid">
                            {productosList}
                        </div>
                    </InfiniteScroll>
                </div>
            </div>

            <Modal isOpen={showConfirmModal} onClose={() => {
                setShowConfirmModal(false);
                resetearFormulario();
            }}>
                <h2>Confirmar Venta</h2>
                <p>Total a pagar: <strong>Bs {totalCompra.toFixed(2)}</strong></p>

                <div className="modal-field">
                    <SelectSecondary
                        name="metodoPago"
                        label="Método de Pago"
                        value={metodoPago}
                        onChange={(e) => setMetodoPago(e.target.value)}
                        formikCompatible={false}
                    >
                        <option value="EFECTIVO">EFECTIVO</option>
                        <option value="QR">QR</option>
                        <option value="TARJETA">TARJETA</option>
                        <option value="TRANSFERENCIA">TRANSFERENCIA</option>
                    </SelectSecondary>
                </div>

                {metodoPago === "EFECTIVO" && (
                    <>
                        <div className="modal-field">
                            <InputText
                                label="Monto recibido (opcional)"
                                type="number"
                                formik={false}
                                value={montoPagado}
                                onChange={(e) => {
                                    const value = parseFloat(e.target.value) || 0;
                                    setMontoPagado(value);
                                }}
                                placeholder={`Mínimo Bs ${totalCompra.toFixed(2)}`}
                            />
                            <small style={{ color: '#666', fontSize: '0.85em', marginTop: '5px', display: 'block' }}>
                                💡 Si no ingresa monto, se considerará el pago exacto
                            </small>
                        </div>

                        <div className="modal-field">
                            <InputText
                                label="Cambio"
                                type="text"
                                formik={false}
                                readOnly
                                value={`Bs ${Math.max(0, (parseFloat(montoPagado) || totalCompra) - totalCompra).toFixed(2)}`}
                            />
                        </div>
                    </>
                )}

                <div className="modal-field">
                    <InputText
                        label="Nombre para recibo (opcional):"
                        type="text"
                        formik={false}
                        placeholder="Dejar vacío si no requiere recibo"
                        value={nombreClienteRecibo}
                        onChange={(e) => setNombreClienteRecibo(e.target.value)}
                    />
                    <small style={{ color: '#666', fontSize: '0.85em', marginTop: '5px', display: 'block' }}>
                        💡 Solo complete este campo si el cliente solicita un recibo impreso
                    </small>
                </div>

                <div className="modal-actions">
                    <Button
                        variant="primary"
                        onClick={confirmarVenta}
                        disabled={isLoading}
                    >
                        {isLoading ? "Procesando..." : "Finalizar Venta"}
                    </Button>
                    <Button variant="secondary" onClick={() => {
                        setShowConfirmModal(false);
                        resetearFormulario();
                    }}>
                        Cancelar
                    </Button>
                </div>
            </Modal>

            <Modal isOpen={showReciboModal} onClose={() => {
                setShowReciboModal(false);
                resetearFormulario();
            }}>
                <h2>¿Generar Recibo?</h2>
                <p>Venta N°: <strong>{ventaCompletada?.id}</strong></p>
                <p>Cliente: <strong>{nombreClienteRecibo}</strong></p>
                <p>Total: <strong>Bs {ventaCompletada?.totalVenta?.toFixed(2)}</strong></p>

                <p style={{ marginBottom: '20px', color: '#666' }}>
                    Seleccione cómo desea entregar el recibo al cliente:
                </p>

                <div className="receipt-actions">
                    <Button
                        variant="primary"
                        onClick={() => {
                            handlePrintReceipt();
                            setShowReciboModal(false);
                            resetearFormulario();
                        }}
                        icon={<FaPrint />}
                    >
                        Imprimir Recibo
                    </Button>
                    <Button
                        variant="secondary"
                        onClick={() => {
                            // Lógica para enviar por correo
                            toast.success(`Recibo enviado por correo a ${nombreClienteRecibo}`);
                            setShowReciboModal(false);
                            resetearFormulario();
                        }}
                        icon={<FaEnvelope />}
                    >
                        Enviar por Correo
                    </Button>
                    <Button
                        variant="tertiary"
                        onClick={() => {
                            toast.info("Venta completada sin generar recibo");
                            setShowReciboModal(false);
                            resetearFormulario();
                        }}
                    >
                        No generar recibo
                    </Button>
                </div>
            </Modal>

            <Carrito
                cart={cart}
                isCajaAbierta={cajaActiva?.id}
                updateQuantity={updateQuantity}
                handleCheckout={handleCheckout}
                handleFinalizarVenta={handleFinalizarVenta}
                totalCompra={totalCompra}
                isOpen={isCartOpen}
                toggleCart={() => setIsCartOpen(!isCartOpen)}
                vaciarCarrito={vaciarCarrito}
                cartIndex={activeCartIndex}
                cartCount={carts.length}
            />
        </div>
    );
};

export default memo(ProductosVentas);