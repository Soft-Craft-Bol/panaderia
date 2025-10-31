import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
    deleteCompraInsumo,
    getSucursales,
    getProveedores
} from '../../service/api';
import { useComprasInsumos } from '../../hooks/useComprasInsumos';
import Modal from '../../components/modal/Modal';
import ModalConfirm from '../../components/modalConfirm/ModalConfirm';
import Table from '../../components/table/Table';
import CompraInsumoForm from './CompraInsumoForm';
import CompraInsumoDetails from './CompraInsumoDetails';
import FiltersPanel from '../../components/search/FiltersPanel'; 
import { toast } from 'sonner';
import './ComprasPanel.css';
import ActionButtons from '../../components/buttons/ActionButtons';
import { Button } from '../../components/buttons/Button';
import { FaFilter } from 'react-icons/fa';
import { useQuery } from '@tanstack/react-query';

const ComprasPanel = () => {
    const queryClient = useQueryClient();
    const [filters, setFilters] = useState({
        searchTerm: '',
        sucursalId: null,
        proveedorId: null,
        fechaInicio: null,
        fechaFin: null,
        tipoInsumo: null,
        page: 0,
        size: 10
    });

    const [selectedCompra, setSelectedCompra] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [detailsOpen, setDetailsOpen] = useState(false);
    const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
    const [showFilters, setShowFilters] = useState(false);

    // Obtener datos para los filtros
    const { data: sucursales = [] } = useQuery({
        queryKey: ['sucursales'],
        queryFn: () => getSucursales().then(res => res.data),
    });

    const { data: proveedores = [] } = useQuery({
        queryKey: ['proveedores'],
        queryFn: () => getProveedores().then(res => res.data),
    });

    const {
        data: comprasData,
        isLoading,
        isError
    } = useComprasInsumos(filters);

    const deleteMutation = useMutation({
        mutationFn: deleteCompraInsumo,
        onSuccess: () => {
            queryClient.invalidateQueries(['comprasInsumos']);
            toast.success('Compra eliminada correctamente');
            setConfirmDeleteOpen(false);
        },
        onError: () => {
            toast.error('Error al eliminar compra');
        }
    });

    const handleFilterChange = (newFilters) => {
        setFilters(prev => ({ ...prev, ...newFilters, page: 0 }));
    };

    const handleResetFilters = () => {
        setFilters({
            searchTerm: '',
            sucursalId: null,
            proveedorId: null,
            fechaInicio: null,
            fechaFin: null,
            tipoInsumo: null,
            page: 0,
            size: 10
        });
    };

    const handlePageChange = (newPage) => {
        setFilters(prev => ({ ...prev, page: newPage }));
    };

    const handleView = (row) => {
        setSelectedCompra(row);
        setDetailsOpen(true);
    };

    const handleEdit = (row) => {
        setSelectedCompra(row);
        setModalOpen(true);
    };

    const handleDelete = (row) => {
        setSelectedCompra(row);
        setConfirmDeleteOpen(true);
    };

    // Configuración de filtros para ComprasPanel
    const filtersConfig = [
        {
            type: 'search',
            name: 'searchTerm',
            placeholder: 'Buscar por nombre de insumo...',
            config: {
                debounceTime: 500
            }
        },
        {
            type: 'select',
            name: 'sucursalId',
            label: 'Sucursal',
            config: {
                options: sucursales,
                valueKey: 'id',
                labelKey: 'nombre'
            }
        },
        {
            type: 'select',
            name: 'proveedorId',
            label: 'Proveedor',
            config: {
                options: proveedores,
                valueKey: 'id',
                labelKey: 'nombreRazonSocial'
            }
        },
        {
            type: 'select',
            name: 'tipoInsumo',
            label: 'Tipo de Insumo',
            config: {
                options: [
                    { id: 'MATERIA_PRIMA', nombre: 'Materia Prima' },
                    { id: 'PRODUCTO_TERMINADO', nombre: 'Producto Terminado' }
                ],
                valueKey: 'id',
                labelKey: 'nombre'
            }
        },
        {
            type: 'date',
            name: 'fechaInicio',
            label: 'Fecha desde'
        },
        {
            type: 'date',
            name: 'fechaFin',
            label: 'Fecha hasta'
        }
    ];

    const columns = [
        { header: 'Fecha', accessor: 'fecha', render: (row) => new Date(row.fecha).toLocaleDateString() },
        { header: 'Insumo', accessor: 'insumoNombre' },
        { header: 'Tipo', accessor: 'tipoInsumo' },
        { header: 'Sucursal', accessor: 'sucursalNombre' },
        { header: 'Proveedor', accessor: 'proveedorNombre' },
        { header: 'Cantidad', accessor: 'cantidad' },
        { header: 'Precio Unitario', accessor: 'precioUnitario', render: (row) => `Bs ${row.precioUnitario}` },
        { header: 'Total', accessor: 'total', render: (row) => `Bs ${row.total}` },
        {
            header: 'Acciones',
            accessor: 'acciones',
            render: (row) => (
                <ActionButtons
                    onView={() => handleView(row)}
                    onEdit={() => handleEdit(row)}
                    onDelete={() => handleDelete(row)}
                    viewTitle="Ver detalles"
                    editTitle="Editar compra"
                    deleteTitle="Eliminar compra"
                />
            )
        }
    ];

    if (isError) {
        return <div>Error al cargar las compras</div>;
    }

    return (
        <div className="compras-panel">
            <div className="panel-header">
                <h2>Compras</h2>
            </div>

            <div className="filters-toggle">
                <Button
                    onClick={() => setShowFilters(!showFilters)}
                    variant="secondary"
                    className="toggle-filters-btn"
                >
                    <FaFilter /> {showFilters ? 'Ocultar Filtros' : 'Mostrar Filtros'}
                </Button>
            </div>

            {showFilters && (
                <FiltersPanel
                    filtersConfig={filtersConfig}
                    filters={filters}
                    onFilterChange={handleFilterChange}
                    onResetFilters={handleResetFilters}
                    layout="auto"
                />
            )}

            <Table
                columns={columns}
                data={comprasData?.content || []}
                loading={isLoading}
                onRowClick={(row) => {
                    setSelectedCompra(row);
                    setDetailsOpen(true);
                }}
                pagination={{
                    currentPage: comprasData?.page || 0,
                    totalPages: comprasData?.totalPages || 0,
                    onPageChange: handlePageChange
                }}
            />

            <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)}>
                <CompraInsumoForm
                    compra={selectedCompra}
                    insumoId={selectedCompra?.insumoId}
                    insumoNombre={selectedCompra?.insumoNombre}
                    sucursalId={selectedCompra?.sucursalId}
                    onCancel={() => setModalOpen(false)}
                    onSuccess={() => {
                        setModalOpen(false);
                        queryClient.invalidateQueries(['comprasInsumos']);
                    }}
                />
            </Modal>

            <Modal isOpen={detailsOpen} onClose={() => setDetailsOpen(false)}>
                <CompraInsumoDetails
                    compra={selectedCompra}
                    onClose={() => setDetailsOpen(false)}
                    onEdit={() => {
                        setDetailsOpen(false);
                        setModalOpen(true);
                    }}
                />
            </Modal>

            <ModalConfirm
                isOpen={confirmDeleteOpen}
                onClose={() => setConfirmDeleteOpen(false)}
                onConfirm={() => deleteMutation.mutate(selectedCompra.id)}
                title="Eliminar Compra"
                message={`¿Está seguro que desea eliminar la compra de ${selectedCompra?.insumoNombre}?`}
                confirmText="Eliminar"
                cancelText="Cancelar"
                danger
                isLoading={deleteMutation.isLoading}
            />
        </div>
    );
};

export default ComprasPanel;