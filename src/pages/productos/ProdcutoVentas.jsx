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
import InputText from "../../components/inputs/InputText";
import { Button } from "../../components/buttons/Button";
import { generateReciboPDF } from "../../utils/generateReciboPDF";
import { getCategorias } from "../../service/api";
import { useQuery } from "@tanstack/react-query";
import { useCajaActiva } from "../../hooks/useHistorialCajas";
import FiltrosVentas from "./FiltrosVentas";
import RefetchButton from "../../components/buttons/RefetchButton";

const ProductosVentas = () => {
    const [currentUser, setCurrentUser] = useState(null);
    const [ID_SUCURSAL_ACTUAL, setID_SUCURSAL_ACTUAL] = useState(null);
    const [isInitialized, setIsInitialized] = useState(false);

    useEffect(() => {
        const user = getUser();
        setCurrentUser(user);

        if (user?.puntosVenta?.length > 0) {
            setID_SUCURSAL_ACTUAL(user.puntosVenta[0].id);
        } else {
            alert('No cuenta con sucursales asignadas.');
        }
        setIsInitialized(true);
    }, []);

    const {
        productos,
        searchTerm,
        setSearchTerm,
        loadMore,
        hasNextPage,
        isFetching,
        refetch,
        conDescuento,
        setConDescuento,
        categoriaIds,
        setCategoriaIds,
        sinStock,
        setSinStock,
        sortField,
        setSortField,
        invalidateAndRefetch
    } = useProductos(ID_SUCURSAL_ACTUAL);

    const [isCartOpen, setIsCartOpen] = useState(false);
    const [ventaData, setVentaData] = useState(null);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const navigate = useNavigate();
    const { realizarVenta, isLoading, error, reset } = useVentas();
    const [metodoPago, setMetodoPago] = useState("");
    const [montoPagado, setMontoPagado] = useState("");
    const [ventaCompletada, setVentaCompletada] = useState(null);
    const [showReciboModal, setShowReciboModal] = useState(false);
    const [nombreClienteRecibo, setNombreClienteRecibo] = useState("");
    const [activeCartIndex, setActiveCartIndex] = useState(0);
    const [pagoCombinado, setPagoCombinado] = useState(false);
    const [metodosPagoList, setMetodosPagoList] = useState([]);

    const [carts, setCarts] = useState([[], [], [], []]);

    useEffect(() => {
        if (!isInitialized) return;

        try {
            const storedCarts = localStorage.getItem('ventasCarts');
            if (storedCarts) {
                const parsedCarts = JSON.parse(storedCarts);
                const filledCarts = [];
                for (let i = 0; i < 4; i++) {
                    filledCarts[i] = Array.isArray(parsedCarts[i]) ? parsedCarts[i] : [];
                }
                setCarts(filledCarts);
            }
        } catch (error) {
            console.error("Error cargando carritos:", error);
            setCarts([[], [], [], []]);
        }
    }, [isInitialized]);

    useEffect(() => {
        if (!isInitialized || carts.length === 0) return;

        const timer = setTimeout(() => {
            try {
                localStorage.setItem('ventasCarts', JSON.stringify(carts));
            } catch (error) {
                console.error("Error guardando carritos:", error);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [carts, isInitialized]);

    const cart = useMemo(() => {
        if (!Array.isArray(carts) || carts.length === 0) {
            return [];
        }

        if (activeCartIndex < 0 || activeCartIndex >= carts.length) {
            return [];
        }

        const selectedCart = carts[activeCartIndex];
        return Array.isArray(selectedCart) ? selectedCart : [];
    }, [carts, activeCartIndex]);

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
        setCarts(prev => [...prev, []]);
    };

    const {
        data: cajaActiva,
        isLoading: isLoadingCaja,
        refetch: refetchCaja
    } = useCajaActiva(currentUser?.id);

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
        if (!cart || cart.length === 0) {
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
    }, [activeCartIndex, cart]);

    const handleCheckout = useCallback(async () => {
        try {
            if (!ID_SUCURSAL_ACTUAL) {
                toast.error('No se ha seleccionado una sucursal válida');
                return;
            }

            if (!cart || cart.length === 0) {
                toast.error('El carrito está vacío');
                return;
            }

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
    }, [cart, navigate, ID_SUCURSAL_ACTUAL]);

    const totalCompra = useMemo(() => {
        if (!cart || !Array.isArray(cart) || cart.length === 0) {
            return 0;
        }

        try {
            return cart.reduce((total, item) => {
                if (!item || typeof item.quantity !== 'number') return total;

                const precio = (item.tieneDescuento && item.precioConDescuento)
                    ? item.precioConDescuento
                    : (item.precioUnitario || 0);

                return total + (precio * item.quantity);
            }, 0);
        } catch (error) {
            console.error("Error calculating totalCompra:", error);
            return 0;
        }
    }, [cart]);

    const totalConDescuentos = useMemo(() => {
        if (!ventaData?.detalle || !Array.isArray(ventaData.detalle)) return totalCompra;

        return ventaData.detalle.reduce((total, item) => {
            return total + (item.precioUnitario * item.cantidad - item.montoDescuento);
        }, 0);
    }, [ventaData, totalCompra]);

    const sumaPagosCombinados = useMemo(() => {
        return metodosPagoList.reduce((acc, mp) => {
            const monto = parseFloat(mp.monto) || 0;
            return acc + monto;
        }, 0);
    }, [metodosPagoList]);

    const diferenciaPagos = useMemo(() => {
    if (!pagoCombinado) return 0;
    const suma = sumaPagosCombinados;
    const total = totalCompra || 0;
    const diferencia = total - suma;
    
    return Math.round(diferencia * 100) / 100;
    }, [totalCompra, sumaPagosCombinados, pagoCombinado]);

    const cambio = useMemo(() => {
        if (metodoPago !== "EFECTIVO") return "0.00";

        const total = totalConDescuentos || totalCompra || 0;
        const pagado = parseFloat(montoPagado) || total;
        return pagado > total ? (pagado - total).toFixed(2) : "0.00";
    }, [montoPagado, totalConDescuentos, totalCompra, metodoPago]);

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

    // En la función confirmarVenta, reemplaza esta sección:

    const confirmarVenta = async () => {
        try {
            if (!ventaData) {
                toast.error('Error: Datos de venta no disponibles');
                return;
            }

            let ventaDataFinal;
            if (pagoCombinado) {
                // Validar que hay métodos de pago
                if (metodosPagoList.length === 0) {
                    toast.error('Debe agregar al menos un método de pago');
                    return;
                }

                // Validar que todos los métodos tienen datos completos
                const metodosIncompletos = metodosPagoList.filter(mp =>
                    !mp.metodoPago || mp.monto <= 0
                );
                if (metodosIncompletos.length > 0) {
                    toast.error('Todos los métodos de pago deben tener método y monto válidos');
                    return;
                }

                const sumaPagos = metodosPagoList.reduce((acc, mp) => acc + (parseFloat(mp.monto) || 0), 0);
                if (Math.abs(sumaPagos - totalCompra) > 0.01) {
                    toast.error(`Los montos no coinciden. Total: Bs ${totalCompra.toFixed(2)}, Suma pagos: Bs ${sumaPagos.toFixed(2)}, Diferencia: Bs ${Math.abs(sumaPagos - totalCompra).toFixed(2)}`);
                    return;
                }

                ventaDataFinal = {
                    ...ventaData,
                    metodoPago: metodosPagoList[0]?.metodoPago || "",
                    metodosPago: metodosPagoList,
                    montoRecibido: sumaPagos,
                    montoDevuelto: 0
                };
            } else {
                if (!metodoPago || metodoPago.trim() === "") {
                    toast.error('Por favor seleccione un método de pago');
                    return;
                }

                ventaDataFinal = {
                    ...ventaData,
                    metodoPago,
                    montoRecibido: metodoPago === "EFECTIVO"
                        ? parseFloat(montoPagado) || totalCompra
                        : totalCompra,
                    montoDevuelto: metodoPago === "EFECTIVO"
                        ? parseFloat(cambio) || 0
                        : 0
                };
            }
            console.log("Datos de venta final:", ventaDataFinal);
            const result = await realizarVenta(ventaDataFinal);

            if (result.success) {
                toast.success(`Venta exitosa! N° ${result.data.idVenta}`, { duration: 5000 });
                setVentaCompletada(result.data);

                setCarts(prevCarts =>
                    prevCarts.map((cart, index) =>
                        index === activeCartIndex ? [] : cart
                    )
                );

                const updatedCarts = carts.map((cart, index) =>
                    index === activeCartIndex ? [] : cart
                );
                localStorage.setItem('ventasCarts', JSON.stringify(updatedCarts));

                await invalidateAndRefetch();

                if (ventaData.nombreCliente && ventaData.nombreCliente !== "CONSUMIDOR FINAL") {
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

    const handleFinalizarVenta = useCallback(async (tipoVenta = null) => {
        if (!cart || cart.length === 0) {
            toast.error('El carrito está vacío');
            return;
        }

        if (!ID_SUCURSAL_ACTUAL) {
            toast.error('No se ha seleccionado una sucursal válida');
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
                username: currentUser?.username || "admin",
                metodoPago: metodoPago,
                montoRecibido: montoRecibidoValue,
                montoDevuelto: metodoPago === "EFECTIVO" ? parseFloat(cambio) || 0 : 0,
                cajaId: cajaActiva?.id || 0,
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
            console.log("Datos para la venta:", data);
            setVentaData(data);
            if (tipoVenta === 'PAGO_POSTERIOR') {
                navigate('/venta-credito', {
                    state: {
                        productosSeleccionados: productosConStockVerificado,
                        sucursalId: ID_SUCURSAL_ACTUAL,
                        puntoVentaId: ID_SUCURSAL_ACTUAL,
                        tipoVenta: tipoVenta
                    }
                });
            }
            setShowConfirmModal(true);

        } catch (error) {
            toast.error(error.message);
        }
    }, [cart, currentUser, metodoPago, montoPagado, cambio, nombreClienteRecibo, ID_SUCURSAL_ACTUAL, cajaActiva]);

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
        setMetodoPago("");
        setMontoPagado("");
        setVentaData(null);
        setVentaCompletada(null);
        setShowConfirmModal(false);
        setShowReciboModal(false);
        setPagoCombinado(false);
        setMetodosPagoList([]);
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
                firstName: currentUser?.firstName || "Usuario",
                lastName: currentUser?.lastName || "Sistema"
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
            detalles: ventaCompletada.detalles?.map(detalle => ({
                ...detalle,
                descripcionProducto: detalle.producto?.descripcion || "Producto sin nombre",
                monto: detalle.precioUnitario * detalle.cantidad - detalle.montoDescuento
            })) || []
        };

        generateReciboPDF(pdfData);
        toast.success(`Recibo generado para ${nombreClienteRecibo}`);
        setShowConfirmModal(false);
    };

    if (!currentUser) {
        return <div>Cargando información del usuario...</div>;
    }

    if (!ID_SUCURSAL_ACTUAL) {
        return <div>No tiene sucursales asignadas. Contacte al administrador.</div>;
    }

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

            <RefetchButton
                onRefetch={invalidateAndRefetch}
            />
            <div className="ventaButtons">
                <Button
                    className="cierre-caja-button}"
                    onClick={() => navigate('/ajuste')}
                >
                    Ajustes de Inventario
                </Button>

                <Button
                    className="cierre-caja-button}"
                    onClick={() => navigate('/egresos')}
                >
                    Egresos
                </Button>
            </div>

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
                categoriaIds={categoriaIds}
                setCategoriaIds={setCategoriaIds}
                conDescuento={conDescuento}
                setConDescuento={setConDescuento}
                sinStock={sinStock}
                setSinStock={setSinStock}
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
                    <Button
                        variant={pagoCombinado ? "primary" : "secondary"}
                        onClick={() => {
                            const nuevoValor = !pagoCombinado;
                            setPagoCombinado(nuevoValor);
                            setMetodosPagoList(nuevoValor ? [{ metodoPago: "", monto: 0 }] : []);
                        }}
                        style={{ flex: 1, padding: '12px' }}
                    >
                        {pagoCombinado ? "Pago Combinado ✅" : "Pago Combinado"}
                    </Button>

                    <Button
                        variant="secondary"
                        onClick={() => handleFinalizarVenta("PAGO_POSTERIOR")}
                        style={{ flex: 1, padding: '12px' }}
                    >
                        PAGO POSTERIOR
                    </Button>
                </div>

                {!pagoCombinado && (
                    <>
                        <div className="modal-field">
                            <SelectSecondary
                                name="metodoPago"
                                label="Método de Pago *"
                                value={metodoPago}
                                onChange={(e) => setMetodoPago(e.target.value)}
                                formikCompatible={false}
                                required
                            >
                                <option value="" disabled>Seleccione método de pago</option>
                                <option value="EFECTIVO">EFECTIVO</option>
                                <option value="BILLETERA_MOVIL">BILLETERA MOVIL</option>
                                <option value="TARJETA">TARJETA</option>
                                <option value="TRANSFERENCIA_BANCARIA">TRANSFERENCIA BANCARIA</option>
                                <option value="EFECTIVO_PAGO_POSTERIOR">EFECTIVO PAGO POSTERIOR</option>
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
                                        min={totalCompra}
                                    />

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
                    </>
                )}

                {pagoCombinado && (
                    <div className="pago-combinado-section">
                        <h3 style={{ marginBottom: '15px', color: '#333' }}>Métodos de Pago</h3>

                        {/* Resumen de totales */}
                        <div className="pago-resumen" style={{
                            backgroundColor: '#f8f9fa',
                            padding: '12px',
                            borderRadius: '6px',
                            marginBottom: '15px',
                            border: diferenciaPagos !== 0 ? '2px solid #dc3545' : '2px solid #28a745'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                                <span><strong>Total a pagar:</strong></span>
                                <span><strong>Bs {totalCompra.toFixed(2)}</strong></span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                                <span>Suma de pagos:</span>
                                <span style={{ color: sumaPagosCombinados === totalCompra ? '#28a745' : '#dc3545' }}>
                                    Bs {sumaPagosCombinados.toFixed(2)}
                                </span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #dee2e6', paddingTop: '5px' }}>
                                <span><strong>Diferencia:</strong></span>
                                <span style={{
                                    color: diferenciaPagos === 0 ? '#28a745' : '#dc3545',
                                    fontWeight: 'bold'
                                }}>
                                    {diferenciaPagos === 0 ? '✓ Correcto' : `Bs ${Math.abs(diferenciaPagos).toFixed(2)} ${diferenciaPagos > 0 ? 'faltante' : 'excedente'}`}
                                </span>
                            </div>
                        </div>

                        <div className="metodos-pago-list">
                            {metodosPagoList.map((mp, index) => (
                                <div key={index} className="pago-item" style={{
                                    display: 'flex',
                                    gap: '10px',
                                    alignItems: 'flex-end',
                                    marginBottom: '15px',
                                    padding: '12px',
                                    border: '1px solid #dee2e6',
                                    borderRadius: '6px',
                                    backgroundColor: '#fff'
                                }}>
                                    <div style={{ flex: '1' }}>
                                        <SelectSecondary
                                            value={mp.metodoPago}
                                            formikCompatible={false}
                                            label={`Método ${index + 1}`}
                                            onChange={(e) => {
                                                const updated = [...metodosPagoList];
                                                updated[index].metodoPago = e.target.value;
                                                setMetodosPagoList(updated);
                                            }}
                                        >
                                            <option value="" disabled>Seleccione método</option>
                                            <option value="EFECTIVO">EFECTIVO</option>
                                            <option value="BILLETERA_MOVIL">BILLETERA MOVIL</option>
                                            <option value="TARJETA">TARJETA</option>
                                            <option value="TRANSFERENCIA_BANCARIA">TRANSFERENCIA BANCARIA</option>
                                            <option value="DEPOSITO_EN_CUENTA">DEPOSITO EN CUENTA</option>
                                            <option value="EFECTIVO_PAGO_POSTERIOR">EFECTIVO PAGO POSTERIOR</option>
                                        </SelectSecondary>
                                    </div>

                                    <div style={{ flex: '0 0 120px' }}>
                                        <InputText
                                            type="number"
                                            value={mp.monto === 0 ? '' : mp.monto}
                                            formik={false}
                                            label="Monto"
                                            onChange={(e) => {
                                                const updated = [...metodosPagoList];
                                                const inputValue = e.target.value;
                                                updated[index].monto = inputValue === '' ? 0 : parseFloat(inputValue);
                                                setMetodosPagoList(updated);
                                            }}
                                            placeholder="0.00"
                                            step="0.01"
                                            min="0"
                                        />
                                    </div>

                                    {(mp.metodoPago === "TARJETA" || mp.metodoPago === "TRANSFERENCIA_BANCARIA") && (
                                        <div style={{ flex: '0 0 140px' }}>
                                            <InputText
                                                type="text"
                                                placeholder="Referencia"
                                                formik={false}
                                                label="Referencia"
                                                value={mp.referencia || ""}
                                                onChange={(e) => {
    const updated = [...metodosPagoList];
    const value = e.target.value;
    
    // Si está vacío, lo dejamos vacío temporalmente
    if (value === '') {
        updated[index].monto = 0;
    } else {
        const numValue = parseFloat(value);
        updated[index].monto = isNaN(numValue) ? 0 : numValue;
    }
    
    setMetodosPagoList(updated);
}}
                                            />
                                        </div>
                                    )}

                                    <Button
                                        variant="danger"
                                        onClick={() => {
                                            setMetodosPagoList(metodosPagoList.filter((_, i) => i !== index));
                                        }}
                                        style={{ flexShrink: 0 }}
                                        disabled={metodosPagoList.length === 1}
                                    >
                                        Eliminar
                                    </Button>
                                </div>
                            ))}

                            {metodosPagoList.length < 3 && (
                                <Button
                                    onClick={() => setMetodosPagoList([...metodosPagoList, { metodoPago: "", monto: 0 }])}
                                    style={{ width: '100%', marginBottom: '15px' }}
                                    variant="secondary"
                                >
                                    + Agregar método de pago
                                </Button>
                            )}

                            {diferenciaPagos > 0.01 && metodosPagoList.length > 0 && (
                            <Button
                                onClick={() => {
                                const updated = [...metodosPagoList];
                                const lastIndex = updated.length - 1;
                                
                                if (updated[lastIndex].metodoPago) {
                                    // Sumamos la diferencia al monto actual
                                    const montoActual = parseFloat(updated[lastIndex].monto) || 0;
                                    updated[lastIndex].monto = montoActual + diferenciaPagos;
                                    setMetodosPagoList(updated);
                                } else {
                                    toast.error('Primero seleccione un método de pago para el último item');
                                }
                                }}
                                style={{ width: '100%', marginBottom: '10px' }}
                                variant="secondary"
                            >
                                💡 Auto-completar faltante (Bs {diferenciaPagos.toFixed(2)})
                            </Button>
                            )}
                        </div>
                    </div>
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
                </div>

                <div className="modal-actions">
                    <Button
                        variant="primary"
                        onClick={confirmarVenta}
                        disabled={isLoading || (!pagoCombinado && !metodoPago) || (pagoCombinado && diferenciaPagos !== 0)}
                        autoFocus
                        style={{
                            opacity: (pagoCombinado && diferenciaPagos !== 0) ? 0.6 : 1
                        }}
                    >
                        {isLoading ? "Procesando..." : "Confirmar"}
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