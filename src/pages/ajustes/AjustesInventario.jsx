import React, { useState, useCallback, useEffect, useMemo, memo } from "react";
import { Toaster, toast } from "sonner";
import { getUser } from "../../utils/authFunctions";
import { useProductos } from "../../hooks/useProductos";
import { Button } from "../../components/buttons/Button";
import Modal from "../../components/modal/Modal";
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { createAjuste } from "../../service/api";
import './AjustesInventario.css';
import BackButton from "../../components/buttons/BackButton";
import AjustesList from "./AjustesList";

const AjustesInventario = () => {
    const [currentUser, setCurrentUser] = useState(null);
    const [ID_SUCURSAL_ACTUAL, setID_SUCURSAL_ACTUAL] = useState(null);
    const [isInitialized, setIsInitialized] = useState(false);
    const [productosSeleccionados, setProductosSeleccionados] = useState([]);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [filtroCategoria, setFiltroCategoria] = useState("");
    const [filtroCodigo, setFiltroCodigo] = useState("");

    // Esquema de validación para el formulario
    const validationSchema = Yup.object().shape({
        observacionGeneral: Yup.string()
            .max(500, 'La observación no puede exceder los 500 caracteres')
    });

    // Valores iniciales del formulario
    const initialValues = {
        observacionGeneral: ""
    };

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
        categoriaIds,
        setCategoriaIds,
        sortField,
        setSortField,
        invalidateAndRefetch
    } = useProductos(ID_SUCURSAL_ACTUAL);

    // Filtrar productos según criterios
    const productosFiltrados = useMemo(() => {
        return productos.filter(producto => {
            const coincideCategoria = !filtroCategoria || producto.categoriaId == filtroCategoria;
            const coincideCodigo = !filtroCodigo || producto.codigo.includes(filtroCodigo);
            const coincideBusqueda = !searchTerm ||
                producto.descripcion.toLowerCase().includes(searchTerm.toLowerCase()) ||
                producto.codigo.toLowerCase().includes(searchTerm.toLowerCase());

            return coincideCategoria && coincideCodigo && coincideBusqueda;
        });
    }, [productos, filtroCategoria, filtroCodigo, searchTerm]);

    const agregarProductoAjuste = useCallback((producto) => {
        // Verificar si el producto ya está en la lista de ajustes
        const existe = productosSeleccionados.some(p => p.id === producto.id);
        if (!existe) {
            setProductosSeleccionados(prev => [
                ...prev,
                {
                    ...producto,
                    cantidadAjuste: 0,
                    observacion: "",
                    sucursalId: ID_SUCURSAL_ACTUAL,
                    usuario: currentUser?.username || "admin"
                }
            ]);
            toast.success(`${producto.descripcion} agregado para ajuste`);
        } else {
            toast.info("El producto ya está en la lista de ajustes");
        }
    }, [productosSeleccionados, ID_SUCURSAL_ACTUAL, currentUser]);

    const eliminarProductoAjuste = useCallback((productoId) => {
        setProductosSeleccionados(prev => prev.filter(p => p.id !== productoId));
    }, []);

    const actualizarAjuste = useCallback((productoId, campo, valor) => {
        setProductosSeleccionados(prev =>
            prev.map(producto =>
                producto.id === productoId
                    ? { ...producto, [campo]: valor }
                    : producto
            )
        );
    }, []);

    const realizarAjustes = useCallback(async (values) => {
        try {
            const ajustesValidos = productosSeleccionados.filter(p => p.cantidadAjuste !== 0);

            if (ajustesValidos.length === 0) {
                toast.error("Debe especificar al menos un ajuste de cantidad");
                return;
            }
            const currentUs = getUser();

            if (!currentUs?.sucursal?.[0]?.id) {
                toast.error("No se pudo determinar la sucursal actual");
                return;
            }

            const ajustesData = {
                ajustes: ajustesValidos.map(producto => ({
                    sucursalId: currentUs.sucursal[0].id,
                    itemId: producto.id,
                    cantidadAjuste: Number(producto.cantidadAjuste),
                    observacion: producto.observacion || values.observacionGeneral,
                    usuario: producto.usuario || currentUs?.username || "admin"
                }))
            };

            console.log("Datos de ajuste a enviar:", ajustesData);

            const response = await createAjuste(ajustesData);

            console.log("Respuesta completa de la API:", response);
            toast.success("Ajustes realizados correctamente");
            setProductosSeleccionados([]);
            setShowConfirmModal(false);

            await invalidateAndRefetch();

        } catch (error) {
            console.error("Error completo al realizar ajustes:", error);

            if (error.response) {
                console.error("Error HTTP:", error.response.status, error.response.data);
                toast.error(`Error del servidor (${error.response.status}): ${error.response.data?.message || 'Error desconocido'}`);
            } else if (error.request) {
                console.error("Error de conexión:", error.request);
                toast.error("Error de conexión. Verifique su conexión a internet.");
            } else {
                toast.error(error.message || "Error inesperado al realizar los ajustes");
            }
        }
    }, [productosSeleccionados, invalidateAndRefetch]);

    const totalAjuste = useMemo(() => {
        return productosSeleccionados.reduce((total, producto) => {
            return total + (producto.cantidadAjuste || 0);
        }, 0);
    }, [productosSeleccionados]);

    return (
        <div className="inventory-adjustment-container">
            <Toaster richColors position="top-center" />
            <BackButton to="/punto-ventas" />
            <h1 className="inventory-adjustment-title">Ajustes de Inventario</h1>

            <div className="inventory-adjustment-header">
                <div className="inventory-filters-section">
                    <div className="inventory-form-group">
                        <label className="inventory-label">Buscar producto</label>
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Código o descripción"
                            className="inventory-input"
                        />
                    </div>

                    <div className="inventory-form-group">
                        <label className="inventory-label">Filtrar por código</label>
                        <input
                            type="text"
                            value={filtroCodigo}
                            onChange={(e) => setFiltroCodigo(e.target.value)}
                            placeholder="Código específico"
                            className="inventory-input"
                        />
                    </div>

                    <div className="inventory-form-group">
                        <label className="inventory-label">Filtrar por categoría</label>
                        <select
                            value={filtroCategoria}
                            onChange={(e) => setFiltroCategoria(e.target.value)}
                            className="inventory-select"
                        >
                            <option value="">Todas las categorías</option>
                            <option value="23410">GALLETAS</option>
                            <option value="23420">PAN DULCE</option>
                            <option value="23430">PASTELERÍA</option>
                            <option value="23490">PANADERÍA</option>
                            <option value="99100">OTROS</option>
                        </select>
                    </div>
                </div>

                <div className="inventory-summary">
                    <h3 className="inventory-summary-title">Resumen de Ajustes</h3>
                    <p className="inventory-summary-text">Productos seleccionados: <strong>{productosSeleccionados.length}</strong></p>
                    <p className="inventory-summary-text">Total de ajuste: <strong>{totalAjuste}</strong> unidades</p>
                    <Button
                        variant="primary"
                        onClick={() => setShowConfirmModal(true)}
                        disabled={productosSeleccionados.length === 0}
                        className="inventory-adjustment-button"
                    >
                        Realizar Ajustes
                    </Button>
                </div>
            </div>

            <div className="inventory-main-content">
                <div className="inventory-available-products">
                    <h2 className="inventory-section-title">Productos Disponibles</h2>
                    <div className="inventory-products-grid">
                        {productosFiltrados.map(producto => (
                            <div key={producto.id} className="inventory-product-card">
                                <div className="inventory-product-info">
                                    <h4 className="inventory-product-name">{producto.descripcion}</h4>
                                    <p className="inventory-product-detail">Código: {producto.codigo}</p>
                                    <p className="inventory-product-detail">Stock actual: {producto.cantidadDisponible}</p>
                                    <p className="inventory-product-detail">Categoría: {producto.categoriaNombre}</p>
                                </div>
                                <Button
                                    variant="secondary"
                                    onClick={() => agregarProductoAjuste(producto)}
                                    className="inventory-add-button"
                                >
                                    Agregar para ajuste
                                </Button>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="inventory-adjustment-products">
                    <h2 className="inventory-section-title">Productos para Ajuste</h2>

                    {productosSeleccionados.length === 0 ? (
                        <p className="inventory-no-products">No hay productos seleccionados para ajuste</p>
                    ) : (
                        <table className="inventory-adjustment-table">
                            <thead>
                                <tr>
                                    <th>Producto</th>
                                    <th>Stock Actual</th>
                                    <th>Ajuste (+/-)</th>
                                    <th>Nuevo Stock</th>
                                    <th>Observación</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {productosSeleccionados.map(producto => (
                                    <tr key={producto.id}>
                                        <td>
                                            <div>
                                                <strong>{producto.descripcion}</strong>
                                                <br />
                                                <small>Código: {producto.codigo}</small>
                                            </div>
                                        </td>
                                        <td>{producto.cantidadDisponible}</td>
                                        <td>
                                            <input
                                                type="number"
                                                step="1" 
                                                value={producto.cantidadAjuste}
                                                onChange={(e) => {
                                                    const value = e.target.value;
                                                    if (value === '' || /^-?\d*\.?\d*$/.test(value)) {
                                                        actualizarAjuste(
                                                            producto.id,
                                                            'cantidadAjuste',
                                                            value === '' ? '' : parseFloat(value) || 0
                                                        );
                                                    }
                                                }}
                                                onBlur={(e) => {
                                                    if (e.target.value === '') {
                                                        actualizarAjuste(producto.id, 'cantidadAjuste', 0);
                                                    }
                                                }}
                                                placeholder="0" // Placeholder en lugar de valor 0
                                                className="inventory-table-input"
                                            />
                                        </td>
                                        <td>
                                            {producto.cantidadDisponible + (producto.cantidadAjuste || 0)}
                                        </td>
                                        <td>
                                            <input
                                                type="text"
                                                value={producto.observacion}
                                                onChange={(e) =>
                                                    actualizarAjuste(producto.id, 'observacion', e.target.value)
                                                }
                                                placeholder="Motivo del ajuste"
                                                className="inventory-table-input"
                                            />
                                        </td>
                                        <td>
                                            <Button
                                                variant="danger"
                                                onClick={() => eliminarProductoAjuste(producto.id)}
                                                className="inventory-remove-button"
                                            >
                                                Eliminar
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            <Modal isOpen={showConfirmModal} onClose={() => setShowConfirmModal(false)}>
                <h2 className="inventory-modal-title">Confirmar Ajustes de Inventario</h2>
                <p className="inventory-modal-description">Se realizarán los siguientes ajustes:</p>

                <div className="inventory-confirmation-list">
                    {productosSeleccionados
                        .filter(p => p.cantidadAjuste !== 0)
                        .map(producto => (
                            <div key={producto.id} className="inventory-confirmation-item">
                                <strong className="inventory-confirmation-product">{producto.descripcion}</strong>
                                <span className="inventory-confirmation-detail">Stock actual: {producto.cantidadDisponible}</span>
                                <span className="inventory-confirmation-detail">Ajuste: {producto.cantidadAjuste > 0 ? '+' : ''}{producto.cantidadAjuste}</span>
                                <span className="inventory-confirmation-detail">Nuevo stock: {producto.cantidadDisponible + producto.cantidadAjuste}</span>
                                <small className="inventory-confirmation-note">Observación: {producto.observacion}</small>
                            </div>
                        ))
                    }
                </div>

                <Formik
                    initialValues={initialValues}
                    validationSchema={validationSchema}
                    onSubmit={realizarAjustes}
                >
                    {({ handleSubmit, handleChange, values, errors, touched }) => (
                        <Form>
                            <div className="inventory-form-group">
                                <label className="inventory-label">Observación general (opcional)</label>
                                <Field
                                    as="textarea"
                                    name="observacionGeneral"
                                    value={values.observacionGeneral}
                                    onChange={handleChange}
                                    placeholder="Motivo general para los ajustes"
                                    className="inventory-textarea"
                                    rows="3"
                                />
                                <ErrorMessage
                                    name="observacionGeneral"
                                    component="div"
                                    className="inventory-error-message"
                                />
                            </div>

                            <div className="inventory-modal-actions">
                                <Button
                                    variant="primary"
                                    onClick={handleSubmit}
                                    type="button"
                                    className="inventory-confirm-button"
                                >
                                    Confirmar Ajustes
                                </Button>
                                <Button
                                    variant="secondary"
                                    onClick={() => setShowConfirmModal(false)}
                                    type="button"
                                    className="inventory-cancel-button"
                                >
                                    Cancelar
                                </Button>
                            </div>
                        </Form>
                    )}
                </Formik>
            </Modal>
            <AjustesList />
        </div>
    );
};

export default memo(AjustesInventario);