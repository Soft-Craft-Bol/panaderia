import React, { useState, useEffect, useCallback } from 'react';
import { asignarInsumosaSucursalMasivo, getSucursales } from '../../service/api';
import Modal from '../../components/modal/Modal';
import ButtonPrimary from '../../components/buttons/ButtonPrimary';
import CrearInsumoForm, { TIPOS_INSUMO, UNIDADES_MEDIDA } from './InsumoForm';
import AsignarInsumoSucursalForm from './AsignarInsumoSucursalForm';
import CompraInsumoForm from '../compras/CompraInsumoForm';
import './InsumosPanel.css';
import SelectorInsumoModal from './SelectorInsumoModal';
import ProveedorForm from '../proveedores/ProveedorForm';
import InsumoGenericoForm from './InsumoGenericoForm';
import { FaUserTie, FaBoxOpen, FaStore, FaPlus, FaList, FaShoppingCart, FaTruck, FaBoxes } from "react-icons/fa";
import BackButton from '../../components/buttons/BackButton';
import InsumosTable from './InsumosTable';
import ComprasPanel from '../compras/ComprasPanel';
import ProveedoresPanel from '../proveedores/ProveedoresPanel';
import { Tabs, Tab } from '../../components/tabs/Tabs';
import AsignarInsumosGenericosForm from './AsignarInsumosGenericosForm';
import InsumosGenericosTable from './InsumosGenericosTable';
import InsumosSucursalTable from './InsumosSucursalTable';
import { useInsumosSucursal } from '../../hooks/getInsumosBySucursal';
import SelectorInsumoMasivoModal from '../../components/forms/insumoForm/SelectorInsumoMasivoModal';
import { useNavigate } from 'react-router-dom';
import FiltersPanel from '../../components/search/FiltersPanel';


const InsumosPanel = () => {
    // Estados principales
    const [sucursales, setSucursales] = useState([]);
    const [selectedSucursal, setSelectedSucursal] = useState(null);
    const [soloActivos, setSoloActivos] = useState(true);
    const [page, setPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [activeTab, setActiveTab] = useState('insumos-sucursal');
    const navigate = useNavigate();

    const [modalOpen, setModalOpen] = useState({
        crear: false,
        asignar: false,
        asignarMasivo: false,
        comprar: false,
        proveedor: false,
        asignarGenerico: false
    });
    const [selectedInsumo, setSelectedInsumo] = useState(null);

    const [filters, setFilters] = useState({
        nombre: null,
        tipo: null,
        unidades: null
    });

    useEffect(() => {
        const fetchSucursales = async () => {
            try {
                const response = await getSucursales();
                setSucursales(response.data);
                if (response.data.length > 0) {
                    setSelectedSucursal(response.data[0].id);
                }
            } catch (err) {
                console.error('Error al cargar sucursales:', err);
            }
        };
        fetchSucursales();
    }, []);

    const {
        data,
        isLoading,
        isError,
        error,
        refetch
    } = useInsumosSucursal(
        selectedSucursal,
        soloActivos,
        page - 1,
        rowsPerPage,
        filters
    );

    const insumos = data?.content || [];
    const totalPages = data?.totalPages || 1;
    const totalElements = data?.totalElements || 0;



    const handleModalClose = (shouldRefresh = false) => {
        setModalOpen({
            crear: false,
            asignar: false,
            comprar: false,
            proveedor: false,
            asignarGenerico: false
        });
        setSelectedInsumo(null);


        if (shouldRefresh && selectedSucursal && activeTab === 'insumos-sucursal') {
            refetch();
        }
    };

    const handleCompraInsumo = (insumo) => {
        setSelectedInsumo(insumo);
        setModalOpen(prev => ({ ...prev, comprar: true }));
    };

    const handleAsignacionMasiva = async (insumosData) => {
        try {
            const payload = {
                sucursalId: selectedSucursal,
                insumos: insumosData
            };

            await asignarInsumosaSucursalMasivo(payload);
            handleModalClose(true);
            // Mostrar mensaje de éxito
        } catch (error) {
            console.error('Error en asignación masiva:', error);
            // Mostrar mensaje de error
        }
    };

    const handleFilterChange = (changedFilter) => {
        setFilters(prev => ({ ...prev, ...changedFilter }));
        setPage(1); // Reinicia a la primera página al filtrar
    };

    const handleResetFilters = () => {
        setFilters({ nombre: null, tipo: null, unidades: null });
        setPage(1);
    };


    const renderInsumosSucursal = () => (
        <>
            <div className="filters-container">
                <div className="sucursal-selector">
                    <label htmlFor="sucursal-select">Sucursal:</label>
                    <select
                        id="sucursal-select"
                        value={selectedSucursal || ''}
                        onChange={(e) => {
                            setSelectedSucursal(Number(e.target.value));
                            setPage(1); // Resetear a la primera página
                        }}
                        disabled={isLoading}
                    >
                        {sucursales.map(sucursal => (
                            <option key={sucursal.id} value={sucursal.id}>
                                {sucursal.nombre} - {sucursal.direccion}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="filter-group">
                    <label>
                        <input
                            type="checkbox"
                            checked={soloActivos}
                            onChange={() => setSoloActivos(!soloActivos)}
                        />
                        Solo activos
                    </label>
                </div>
            </div>

            <FiltersPanel
                filtersConfig={[
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
                ]}

                filters={filters}
                onFilterChange={handleFilterChange}
                onResetFilters={handleResetFilters}
                layout="grid"
            />


            <InsumosSucursalTable
                data={insumos}
                loading={isLoading}
                error={isError ? error : null}
                onPageChange={setPage}
                onRowsPerPageChange={(size) => {
                    setRowsPerPage(size);
                    setPage(1);
                }}
                onCompra={handleCompraInsumo}
                page={page}
                rowsPerPage={rowsPerPage}
                totalPages={totalPages}
                totalElements={totalElements}
                sucursalId={selectedSucursal}
                sucursalNombre={sucursales.find(s => s.id === selectedSucursal)?.nombre || 'Sucursal'}
                onStockMinimoUpdated={refetch}
            />

        </>
    );

    return (
        <div className="insumos-panel">
            <BackButton position="left" to="/productos" />

            <div className="panel-header">
                <h2>Administración de Insumos</h2>

                <div className="action-buttons">
                    <ButtonPrimary
                        onClick={() => setModalOpen(prev => ({ ...prev, asignarMasivo: true }))}
                        variant="primary"
                    >
                        <FaBoxes className="button-icon" /> Asignar Múltiples Insumos
                    </ButtonPrimary>

                    <ButtonPrimary
                        onClick={() => navigate(`/ajustes-inventario-insumos`)}
                        variant="primary"
                    >
                        <FaList className="button-icon" /> Ajustes de Inventario
                    </ButtonPrimary>
                </div>
            </div>

            <Tabs activeTab={activeTab} onChange={setActiveTab}>
                <Tab label="Insumos por Sucursal" value="insumos-sucursal" icon={FaStore}>
                    {renderInsumosSucursal()}
                </Tab>

                <Tab label="Todos los Insumos" value="todos-insumos" icon={FaList}>
                    <InsumosTable />
                </Tab>

                <Tab label="Insumos Genéricos" value="insumos-genericos" icon={FaList}>
                    <InsumosGenericosTable />
                </Tab>

                <Tab label="Compras" value="compras" icon={FaShoppingCart}>
                    <ComprasPanel />
                </Tab>

                <Tab label="Proveedores" value="proveedores" icon={FaTruck}>
                    <ProveedoresPanel />
                </Tab>
            </Tabs>

            <Modal isOpen={modalOpen.crear} onClose={() => handleModalClose(false)}>
                <CrearInsumoForm
                    onSuccess={() => handleModalClose(true)}
                    onCancel={() => handleModalClose(false)}
                />
            </Modal>
            <Modal
                isOpen={modalOpen.crearGenerico}
                onClose={() => handleModalClose(false)}
                closeOnOverlayClick={false}
            >
                <InsumoGenericoForm
                    onSuccess={() => handleModalClose(true)}
                    onCancel={() => handleModalClose(false)}
                />
            </Modal>

            <Modal
                isOpen={modalOpen.asignarGenerico}
                onClose={() => handleModalClose(false)}
                closeOnOverlayClick={false}
            >
                <AsignarInsumosGenericosForm
                    idInsumoGenerico={selectedInsumo?.id}
                    insumoGenericoNombre={selectedInsumo?.nombre || 'Insumo Genérico'}
                    onSuccess={() => handleModalClose(true)}
                    onCancel={() => handleModalClose(false)}
                />
            </Modal>

            <Modal isOpen={modalOpen.asignar} onClose={() => handleModalClose(false)} closeOnOverlayClick={false}>
                {!selectedInsumo ? (
                    <SelectorInsumoModal
                        onInsumoSelected={(insumo) => setSelectedInsumo(insumo)}
                        onCancel={() => handleModalClose(false)}
                    />
                ) : (
                    <AsignarInsumoSucursalForm
                        idInsumo={selectedInsumo.id}
                        insumoNombre={selectedInsumo.nombre}
                        onSuccess={() => handleModalClose(true)}
                        onCancel={() => handleModalClose(false)}
                    />
                )}
            </Modal>

            <Modal isOpen={modalOpen.proveedor} onClose={() => handleModalClose(false)}>
                <ProveedorForm
                    onSuccess={() => handleModalClose(true)}
                    onCancel={() => handleModalClose(false)}
                />
            </Modal>

            <Modal
                isOpen={modalOpen.comprar}
                onClose={() => handleModalClose(false)}
                size="lg"
            >
                {selectedInsumo && selectedSucursal && (
                    <CompraInsumoForm
                        insumoId={selectedInsumo.insumoId}
                        insumoNombre={selectedInsumo.nombre}
                        sucursalId={selectedSucursal}
                        onSuccess={() => handleModalClose(true)}
                        onCancel={() => handleModalClose(false)}
                    />
                )}
            </Modal>

            <Modal
                isOpen={modalOpen.asignarMasivo}
                onClose={() => handleModalClose(false)}
                size="xl"
                closeOnOverlayClick={false}
            >
                <SelectorInsumoMasivoModal
                    onInsumosSelected={handleAsignacionMasiva}
                    onCancel={() => handleModalClose(false)}
                    sucursalId={selectedSucursal}
                />
            </Modal>
        </div>
    );
};

export default InsumosPanel;