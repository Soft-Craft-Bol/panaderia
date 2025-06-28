import React, { useState, useEffect } from 'react';
import { getInsumosBySucursal, getSucursales } from '../../service/api';
import Modal from '../../components/modal/Modal';
import ButtonPrimary from '../../components/buttons/ButtonPrimary';
import CrearInsumoForm from './InsumoForm';
import AsignarInsumoSucursalForm from './AsignarInsumoSucursalForm';
import CompraInsumoForm from './CompraInsumoForm';
import './InsumosPanel.css';
import SelectorInsumoModal from './SelectorInsumoModal';
import ProveedorForm from '../proveedores/ProveedorForm';
import {
    FaUserTie,       // Icono para proveedor
    FaBoxOpen,       // Icono para insumo
    FaStore,         // Icono para sucursal
    FaPlus           // Icono genérico para agregar
} from "react-icons/fa";

const InsumosPanel = () => {
    const [insumos, setInsumos] = useState([]);
    const [sucursales, setSucursales] = useState([]);
    const [selectedSucursal, setSelectedSucursal] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Estados para modales
    const [modalOpen, setModalOpen] = useState({
        crear: false,
        asignar: false,
        comprar: false,
        proveedor: false
    });
    const [selectedInsumo, setSelectedInsumo] = useState(null);

    // Obtener sucursales al cargar el componente
    useEffect(() => {
        const fetchSucursales = async () => {
            try {
                const response = await getSucursales();
                setSucursales(response.data);
                if (response.data.length > 0) {
                    setSelectedSucursal(response.data[0].id);
                }
            } catch (err) {
                setError('Error al cargar sucursales');
                console.error(err);
            }
        };

        fetchSucursales();
    }, []);

    // Obtener insumos cuando cambia la sucursal seleccionada
    useEffect(() => {
        if (selectedSucursal) {
            fetchInsumos(selectedSucursal);
        }
    }, [selectedSucursal]);

    const fetchInsumos = async (sucursalId) => {
        setLoading(true);
        setError(null);
        try {
            const response = await getInsumosBySucursal(sucursalId);
            // La respuesta de insumos por sucursal es un array directo
            setInsumos(Array.isArray(response.data) ? response.data : []);
        } catch (err) {
            setError('Error al cargar insumos');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };
    // Manejar cierre de modal y refrescar datos
    const handleModalClose = (shouldRefresh = false) => {
        setModalOpen({
            crear: false,
            asignar: false,
            comprar: false,
            proveedor: false
        });
        setSelectedInsumo(null);

        if (shouldRefresh && selectedSucursal) {
            fetchInsumos(selectedSucursal);
        }
    };

    // Formatear fecha para mostrar
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString();
    };

    // Verificar si el stock está bajo
    const isLowStock = (cantidad, stockMinimo) => {
        return cantidad <= stockMinimo;
    };

    return (
        <div className="insumos-panel">
            <div className="panel-header">
                <h2>Administración de Insumos</h2>

                <div className="sucursal-selector">
                    <label htmlFor="sucursal-select">Sucursal:</label>
                    <select
                        id="sucursal-select"
                        value={selectedSucursal || ''}
                        onChange={(e) => setSelectedSucursal(Number(e.target.value))}
                        disabled={loading}
                    >
                        {sucursales.map(sucursal => (
                            <option key={sucursal.id} value={sucursal.id}>
                                {sucursal.nombre} - {sucursal.direccion}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="action-buttons">
                    <ButtonPrimary
                        onClick={() => setModalOpen({ ...modalOpen, proveedor: true })}
                        variant="primary"
                    >
                        <FaUserTie className="button-icon" /> Registrar Proveedor
                    </ButtonPrimary>

                    <ButtonPrimary
                        onClick={() => setModalOpen({ ...modalOpen, crear: true })}
                        variant="primary"
                    >
                        <FaBoxOpen className="button-icon" /> Crear Insumo
                    </ButtonPrimary>

                    {selectedSucursal && (
                        <ButtonPrimary
                            onClick={() => setModalOpen({ ...modalOpen, asignar: true })}
                            variant="primary"
                        >
                            <FaStore className="button-icon" /> Asignar a Sucursal
                        </ButtonPrimary>
                    )}
                </div>
            </div>

            {error && <div className="error-message">{error}</div>}

            {loading ? (
                <div className="loading-message">Cargando insumos...</div>
            ) : (
                <div className="insumos-table-container">
                    <table className="insumos-table">
                        <thead>
                            <tr>
                                <th>Nombre</th>
                                <th>Tipo</th>
                                <th>Cantidad</th>
                                <th>Unidad</th>
                                <th>Stock Mínimo</th>
                                <th>Fecha Vencimiento</th>
                                <th>Estado</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {insumos.length > 0 ? (
                                insumos.map(insumo => (
                                    <tr
                                        key={insumo.insumoId}
                                        className={isLowStock(insumo.cantidad, insumo.stockMinimo) ? 'low-stock' : ''}
                                    >
                                        <td>{insumo.nombre}</td>
                                        <td>{insumo.tipo || 'N/A'}</td>
                                        <td>{insumo.cantidad}</td>
                                        <td>{insumo.unidades}</td>
                                        <td>{insumo.stockMinimo}</td>
                                        <td>{formatDate(insumo.fechaVencimiento)}</td>
                                        <td>
                                            {isLowStock(insumo.cantidad, insumo.stockMinimo) ? (
                                                <span className="status-badge warning">Stock Bajo</span>
                                            ) : (
                                                <span className="status-badge success">Disponible</span>
                                            )}
                                        </td>
                                        <td>
                                            <button
                                                className="action-button"
                                                onClick={() => {
                                                    setSelectedInsumo(insumo);
                                                    setModalOpen({ ...modalOpen, comprar: true });
                                                }}
                                            >
                                                Registrar Compra
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="8" className="no-data">
                                        No hay insumos registrados en esta sucursal
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Modales */}
            <Modal
                isOpen={modalOpen.crear}
                onClose={() => handleModalClose(false)}
            >
                <CrearInsumoForm
                    onSuccess={() => handleModalClose(true)}
                    onCancel={() => handleModalClose(false)}
                />
            </Modal>
            <Modal
                isOpen={modalOpen.asignar}
                onClose={() => handleModalClose(false)}
            >
                {!selectedInsumo ? (
                    <SelectorInsumoModal
                        onInsumoSelected={(insumo) => {
                            setSelectedInsumo(insumo);
                        }}
                        onCancel={() => handleModalClose(false)}
                    />
                ) : (
                    <AsignarInsumoSucursalForm
                        idInsumo={selectedInsumo.id}
                        insumoNombre={selectedInsumo.nombre}
                        onSuccess={() => {
                            setSelectedInsumo(null);
                            handleModalClose(true);
                        }}
                        onCancel={() => {
                            setSelectedInsumo(null);
                            handleModalClose(false);
                        }}
                    />
                )}
            </Modal>
            <Modal
                isOpen={modalOpen.proveedor}
                onClose={() => handleModalClose(false)}
            >
                <ProveedorForm
                    onSuccess={() => handleModalClose(true)}
                    onCancel={() => handleModalClose(false)}
                />
            </Modal>

            {selectedInsumo && (
                <Modal
                    isOpen={modalOpen.comprar}
                    onClose={() => handleModalClose(false)}
                >
                    <CompraInsumoForm
                        insumoNombre={selectedInsumo.nombre}
                        onSuccess={() => handleModalClose(true)}
                        onCancel={() => handleModalClose(false)}
                    />
                </Modal>
            )}
        </div>
    );
};

export default InsumosPanel;