import { useState } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import {
  getEgresos,
  createEgreso,
  updateEgreso,
  deleteEgreso,
} from '../../service/api';
import Modal from '../../components/modal/Modal';
import ModalConfirm from '../../components/modalConfirm/ModalConfirm';
import Table from '../../components/table/Table';
import { toast } from 'sonner';
import './EgresosPanel.css';
import ActionButtons from '../../components/buttons/ActionButtons';
import { Button } from '../../components/buttons/Button';
import { FaFilter } from 'react-icons/fa';
import FiltersPanel from '../../components/search/FiltersPanel';
import EgresoForm from './AddEgreso';

const EgresosPanel = () => {
  const queryClient = useQueryClient();

  const [filters, setFilters] = useState({
    searchTerm: '',
    fechaInicio: null,
    fechaFin: null,
    tipoGasto: null,
    tipoPago: null,
    page: 0,
    size: 10,
  });

  const [selectedEgreso, setSelectedEgreso] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Query para listar egresos (adaptar si tu backend devuelve paginado o lista simple)
  const { data: egresosData, isLoading, isError } = useQuery({
    queryKey: ['egresos', filters],
    queryFn: () => getEgresos().then((res) => res.data),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteEgreso,
    onSuccess: () => {
      queryClient.invalidateQueries(['egresos']);
      toast.success('Egreso eliminado correctamente');
      setConfirmDeleteOpen(false);
    },
    onError: () => {
      toast.error('Error al eliminar egreso');
    },
  });

  // 🔹 Configuración de filtros
  const filtersConfig = [
    {
      type: 'search',
      name: 'searchTerm',
      placeholder: 'Buscar por descripción...',
      config: { debounceTime: 500 },
    },
    {
      type: 'select',
      name: 'tipoGasto',
      label: 'Categoría',
      config: {
        options: [
          { id: 'ALQUILER', nombre: 'Alquiler' },
          { id: 'SERVICIOS', nombre: 'Servicios' },
          { id: 'INSUMOS', nombre: 'Insumos' },
          { id: 'OTROS', nombre: 'Otros' },
        ],
        valueKey: 'id',
        labelKey: 'nombre',
      },
    },
    {
      type: 'select',
      name: 'tipoPago',
      label: 'Tipo de Pago',
      config: {
        options: [
          { id: 'EFECTIVO', nombre: 'Efectivo' },
          { id: 'TRANSFERENCIA', nombre: 'Transferencia' },
          { id: 'TARJETA', nombre: 'Tarjeta' },
        ],
        valueKey: 'id',
        labelKey: 'nombre',
      },
    },
    {
      type: 'date',
      name: 'fechaInicio',
      label: 'Fecha desde',
    },
    {
      type: 'date',
      name: 'fechaFin',
      label: 'Fecha hasta',
    },
  ];

  const handleFilterChange = (newFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters, page: 0 }));
  };

  const handleResetFilters = () => {
    setFilters({
      searchTerm: '',
      fechaInicio: null,
      fechaFin: null,
      tipoGasto: null,
      tipoPago: null,
      page: 0,
      size: 10,
    });
  };

  const handleEdit = (row) => {
    setSelectedEgreso(row);
    setModalOpen(true);
  };

  const handleDelete = (row) => {
    setSelectedEgreso(row);
    setConfirmDeleteOpen(true);
  };

  const columns = [
    { header: 'Fecha', accessor: 'fechaDePago', render: (row) => new Date(row.fechaDePago).toLocaleDateString() },
    { header: 'Descripción', accessor: 'descripcion' },
    { header: 'Categoría', accessor: 'gastoEnum' },
    { header: 'Monto', accessor: 'monto', render: (row) => `Bs ${row.monto}` },
    { header: 'Tipo Pago', accessor: 'tipoPagoEnum' },
    { header: 'Pagado a', accessor: 'pagadoA' },
    {
      header: 'Acciones',
      accessor: 'acciones',
      render: (row) => (
        <ActionButtons
          onEdit={() => handleEdit(row)}
          onDelete={() => handleDelete(row)}
          editTitle="Editar egreso"
          deleteTitle="Eliminar egreso"
        />
      ),
    },
  ];

  if (isError) {
    return <div>Error al cargar los egresos</div>;
  }

  return (
    <div className="egresos-panel">
      <div className="panel-header">
        <h2>Egresos</h2>
        <Button onClick={() => setModalOpen(true)} variant="primary">
          + Nuevo Egreso
        </Button>
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
        data={egresosData || []}
        loading={isLoading}
        pagination={{
          currentPage: filters.page,
          totalPages: 1, 
          onPageChange: (newPage) => setFilters((prev) => ({ ...prev, page: newPage })),
        }}
      />

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)}>
        <EgresoForm
          egreso={selectedEgreso}
          onCancel={() => setModalOpen(false)}
          onSuccess={() => {
            setModalOpen(false);
            queryClient.invalidateQueries(['egresos']);
          }}
        />
      </Modal>

      <ModalConfirm
        isOpen={confirmDeleteOpen}
        onClose={() => setConfirmDeleteOpen(false)}
        onConfirm={() => deleteMutation.mutate(selectedEgreso.id)}
        title="Eliminar Egreso"
        message={`¿Está seguro que desea eliminar el egreso: ${selectedEgreso?.descripcion}?`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        danger
        isLoading={deleteMutation.isLoading}
      />
    </div>
  );
};

export default EgresosPanel;
