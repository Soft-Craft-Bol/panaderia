import React, { useState, useCallback, useEffect, useMemo, memo } from "react";
import { Toaster, toast } from "sonner";
import { getUser } from "../../utils/authFunctions";
import { useInsumorSucursalInf } from "../../hooks/useInsumorSucursalInf";
import { Button } from "../../components/buttons/Button";
import Modal from "../../components/modal/Modal";
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { createAjusteInsumos } from "../../service/api";
import './AjustesInventario.css';
import FiltersPanel from "../../components/search/FiltersPanel";
import { TIPOS_INSUMO, UNIDADES_MEDIDA } from "../insumos/InsumoForm";
import BackButton from "../../components/buttons/BackButton";
import AjustesInsumoList from "./AjustesInsumoList";

const AjustesInventarioInsumos = () => {
    const [currentUser, setCurrentUser] = useState(null);
    const [ID_SUCURSAL_ACTUAL, setID_SUCURSAL_ACTUAL] = useState(null);
    const [isInitialized, setIsInitialized] = useState(false);
    const [insumosSeleccionados, setInsumosSeleccionados] = useState([]);
    const [showConfirmModal, setShowConfirmModal] = useState(false);

    // Esquema de validación para el formulario
    const validationSchema = Yup.object().shape({
        motivoGeneral: Yup.string().max(500, 'El motivo no puede exceder los 500 caracteres')
    });

    const initialValues = { motivoGeneral: "" };

    useEffect(() => {
        const user = getUser();
        setCurrentUser(user);

        if (user?.sucursal?.length > 0) {
            setID_SUCURSAL_ACTUAL(user.sucursal[0].id);
        } else {
            alert('No cuenta con sucursales asignadas.');
        }
        setIsInitialized(true);
    }, []);

    const {
        insumos,
        loadMore,
        hasNextPage,
        isFetchingNextPage,
        filters,
        updateFilter,
        clearFilters,
        isLoading,
        error,
        searchTerm,
        setSearchTerm
    } = useInsumorSucursalInf(ID_SUCURSAL_ACTUAL, true, {
        tipo: null,
        unidades: null
    });

    const filtersConfig = [
        {
            type: 'search',
            name: 'nombre',
            label: 'Buscar Insumo',
            placeholder: 'Ej. Harina, Azúcar...',
        },
        {
            type: 'select',
            name: 'tipo',
            label: 'Tipo de Insumo',
            config: {
                options: TIPOS_INSUMO.map(opt => ({
                    id: opt.value,
                    nombre: opt.label
                })),
                valueKey: 'id',
                labelKey: 'nombre'
            }
        },
        {
            type: 'select',
            name: 'unidades',
            label: 'Unidad de Medida',
            config: {
                options: UNIDADES_MEDIDA.map(opt => ({
                    id: opt.value,
                    nombre: opt.label
                })),
                valueKey: 'id',
                labelKey: 'nombre'
            }
        }
    ];

    const handleFilterChange = (newFilters) => {
        Object.entries(newFilters).forEach(([key, value]) => {
            if (key === "nombre") {
                setSearchTerm(value);
            } else {
                updateFilter(key, value);
            }
        });
    };

    const agregarInsumoAjuste = useCallback((insumo) => {
        const existe = insumosSeleccionados.some(p => p.insumoId === insumo.insumoId);
        if (!existe) {
            setInsumosSeleccionados(prev => [
                ...prev,
                {
                    ...insumo,
                    cantidadAjuste: 0,
                    motivo: "",
                    sucursalId: ID_SUCURSAL_ACTUAL,
                    usuarioResponsable: currentUser?.username || "admin"
                }
            ]);
            toast.success(`${insumo.nombre} agregado para ajuste`);
        } else {
            toast.info("El insumo ya está en la lista de ajustes");
        }
    }, [insumosSeleccionados, ID_SUCURSAL_ACTUAL, currentUser]);

    const eliminarInsumoAjuste = useCallback((insumoId) => {
        setInsumosSeleccionados(prev => prev.filter(p => p.insumoId !== insumoId));
    }, []);

    const actualizarAjuste = useCallback((insumoId, campo, valor) => {
        setInsumosSeleccionados(prev =>
            prev.map(insumo =>
                insumo.insumoId === insumoId
                    ? { ...insumo, [campo]: valor }
                    : insumo
            )
        );
    }, []);

    const realizarAjustes = useCallback(async (values) => {
        try {
            const ajustesValidos = insumosSeleccionados.filter(p => p.cantidadAjuste !== 0);
            if (ajustesValidos.length === 0) {
                toast.error("Debe especificar al menos un ajuste de cantidad");
                return;
            }

            if (!ID_SUCURSAL_ACTUAL) {
                toast.error("No se pudo determinar la sucursal actual");
                return;
            }

            const currentUs = getUser();
            const ajustesData = {
                ajustes: ajustesValidos.map(insumo => ({
                    sucursalId: ID_SUCURSAL_ACTUAL,
                    insumoId: insumo.insumoId,
                    cantidadAjuste: Number(insumo.cantidadAjuste),
                    motivo: insumo.motivo || values.motivoGeneral,
                    usuarioResponsable: insumo.usuarioResponsable || currentUs?.username || "admin"
                }))
            };

            console.log("Datos de ajuste a enviar:", ajustesData);
            const response = await createAjusteInsumos(ajustesData);
            console.log("Respuesta completa de la API:", response);

            toast.success("Ajustes de insumos realizados correctamente");
            setInsumosSeleccionados([]);
            setShowConfirmModal(false);

        } catch (error) {
            console.error("Error completo al realizar ajustes:", error);
            if (error.response) {
                toast.error(`Error del servidor (${error.response.status}): ${error.response.data?.message || 'Error desconocido'}`);
            } else if (error.request) {
                toast.error("Error de conexión. Verifique su conexión a internet.");
            } else {
                toast.error(error.message || "Error inesperado al realizar los ajustes");
            }
        }
    }, [insumosSeleccionados, ID_SUCURSAL_ACTUAL]);

    const totalAjuste = useMemo(() => {
        return insumosSeleccionados.reduce((total, insumo) => {
            return total + (insumo.cantidadAjuste || 0);
        }, 0);
    }, [insumosSeleccionados]);

    return (
        <div className="inventory-adjustment-container">
            <Toaster richColors position="top-center" />
            <BackButton to="/productos/insumos" />
            <h1 className="inventory-adjustment-title">Ajustes de Inventario - Insumos</h1>

            <div className="inventory-filters-section">
                <FiltersPanel
                    filtersConfig={filtersConfig}
                    filters={filters}
                    onFilterChange={handleFilterChange}
                    onResetFilters={clearFilters}
                    layout="grid"
                />
            </div>

            <div className="inventory-adjustment-header">
                <div className="inventory-summary">
                    <h3 className="inventory-summary-title">Resumen de Ajustes</h3>
                    <p className="inventory-summary-text">Insumos seleccionados: <strong>{insumosSeleccionados.length}</strong></p>
                    <p className="inventory-summary-text">Total de ajuste: <strong>{totalAjuste}</strong> unidades</p>
                    <Button
                        variant="primary"
                        onClick={() => setShowConfirmModal(true)}
                        disabled={insumosSeleccionados.length === 0}
                        className="inventory-adjustment-button"
                    >
                        Realizar Ajustes
                    </Button>
                </div>
            </div>

            <div className="inventory-main-content">
                <div className="inventory-available-products">
                    <h2 className="inventory-section-title">Insumos Disponibles</h2>

                    {isLoading ? (
                        <p className="inventory-loading">Cargando insumos...</p>
                    ) : (
                        <>
                            <div className="inventory-products-grid">
                                {insumos.map(insumo => (
                                    <div key={insumo.insumoId} className="inventory-product-card">
                                        <div className="inventory-product-info">
                                            <h4 className="inventory-product-name">{insumo.nombre}</h4>
                                            <p className="inventory-product-detail">Tipo: {insumo.tipo}</p>
                                            <p className="inventory-product-detail">Stock actual: {insumo.cantidad || 0}</p>
                                            <p className="inventory-product-detail">Unidad: {insumo.unidades || 'N/A'}</p>
                                            <p className="inventory-product-detail">Stock Mínimo: {insumo.stockMinimo || 'N/A'}</p>
                                        </div>
                                        <Button
                                            variant="secondary"
                                            onClick={() => agregarInsumoAjuste(insumo)}
                                            className="inventory-add-button"
                                        >
                                            Agregar para ajuste
                                        </Button>
                                    </div>
                                ))}
                            </div>

                            {hasNextPage && (
                                <div className="inventory-load-more">
                                    <Button
                                        variant="outline"
                                        onClick={loadMore}
                                        disabled={isFetchingNextPage}
                                        className="inventory-load-button"
                                    >
                                        {isFetchingNextPage ? 'Cargando...' : 'Cargar más insumos'}
                                    </Button>
                                </div>
                            )}

                            {insumos.length === 0 && !isLoading && (
                                <div className="inventory-no-results">
                                    <p>No se encontraron insumos con los filtros aplicados.</p>
                                    <Button onClick={clearFilters} className="inventory-clear-filters">Limpiar filtros</Button>
                                </div>
                            )}
                        </>
                    )}
                </div>

                <div className="inventory-adjustment-products">
                    <h2 className="inventory-section-title">Insumos para Ajuste</h2>
                    {insumosSeleccionados.length === 0 ? (
                        <p className="inventory-no-products">No hay insumos seleccionados para ajuste</p>
                    ) : (
                        <table className="inventory-adjustment-table">
                            <thead>
                                <tr>
                                    <th>Insumo</th>
                                    <th>Stock Actual</th>
                                    <th>Ajuste (+/-)</th>
                                    <th>Nuevo Stock</th>
                                    <th>Motivo</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {insumosSeleccionados.map(insumo => {
                                    const stockActual = insumo.cantidad || 0;
                                    const cantidadAjuste = insumo.cantidadAjuste || 0;
                                    const nuevoStock = stockActual + cantidadAjuste;
                                    return (
                                        <tr key={insumo.insumoId}>
                                            <td>
                                                <div>
                                                    <strong>{insumo.nombre}</strong>
                                                    <br />
                                                    <small>Tipo: {insumo.tipo}</small>
                                                </div>
                                            </td>
                                            <td>{stockActual}</td>
                                            <td>
                                                <input
                                                    type="number" 
                                                    step="1"   
                                                    value={cantidadAjuste === 0 ? '' : cantidadAjuste} 
                                                    onChange={(e) => {
                                                        const value = e.target.value;
                                                        if (value === '' || /^-?\d*\.?\d*$/.test(value)) {
                                                            actualizarAjuste(
                                                                insumo.insumoId,
                                                                'cantidadAjuste',
                                                                value === '' ? '' : parseFloat(value) || 0
                                                            );
                                                        }
                                                    }}
                                                    placeholder="0.00" 
                                                    className="inventory-table-input"
                                                />
                                            </td>
                                            <td className={nuevoStock < 0 ? 'inventory-negative-stock' : ''}>
                                                {nuevoStock}
                                            </td>
                                            <td>
                                                <input
                                                    type="text"
                                                    value={insumo.motivo}
                                                    onChange={(e) =>
                                                        actualizarAjuste(insumo.insumoId, 'motivo', e.target.value)
                                                    }
                                                    placeholder="Motivo del ajuste"
                                                    className="inventory-table-input"
                                                />
                                            </td>
                                            <td>
                                                <Button
                                                    variant="danger"
                                                    onClick={() => eliminarInsumoAjuste(insumo.insumoId)}
                                                    className="inventory-remove-button"
                                                >
                                                    Eliminar
                                                </Button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* MODAL CONFIRMACION */}
            <Modal isOpen={showConfirmModal} onClose={() => setShowConfirmModal(false)}>
                <h2 className="inventory-modal-title">Confirmar Ajustes de Inventario - Insumos</h2>
                <p className="inventory-modal-description">Se realizarán los siguientes ajustes:</p>

                <div className="inventory-confirmation-list">
                    {insumosSeleccionados
                        .filter(p => p.cantidadAjuste !== 0)
                        .map(insumo => {
                            const stockActual = insumo.cantidad || 0;
                            const cantidadAjuste = insumo.cantidadAjuste || 0;
                            const nuevoStock = stockActual + cantidadAjuste;
                            return (
                                <div key={insumo.insumoId} className="inventory-confirmation-item">
                                    <strong className="inventory-confirmation-product">{insumo.nombre}</strong>
                                    <span className="inventory-confirmation-detail">Stock actual: {stockActual}</span>
                                    <span className="inventory-confirmation-detail">Ajuste: {cantidadAjuste > 0 ? '+' : ''}{cantidadAjuste}</span>
                                    <span className="inventory-confirmation-detail">Nuevo stock: {nuevoStock}</span>
                                    <small className="inventory-confirmation-note">Motivo: {insumo.motivo}</small>
                                </div>
                            );
                        })}
                </div>

                <Formik
                    initialValues={initialValues}
                    validationSchema={validationSchema}
                    onSubmit={realizarAjustes}
                >
                    {({ handleSubmit, handleChange, values }) => (
                        <Form>
                            <div className="inventory-form-group">
                                <label className="inventory-label">Motivo general (opcional)</label>
                                <Field
                                    as="textarea"
                                    name="motivoGeneral"
                                    value={values.motivoGeneral}
                                    onChange={handleChange}
                                    placeholder="Motivo general para los ajustes"
                                    className="inventory-textarea"
                                    rows="3"
                                />
                                <ErrorMessage
                                    name="motivoGeneral"
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
            <AjustesInsumoList />
        </div>
    );
};

export default memo(AjustesInventarioInsumos);