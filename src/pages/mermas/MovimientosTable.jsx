import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import Table from '../../components/table/Table';
import Modal from '../../components/modal/Modal';
import MovimientoMermaDetails from './MovimientoMermaDetails';
import FiltersPanel from './FiltersPanel';
import ActionButtons from '../../components/buttons/ActionButtons';
import { getMermas } from '../../service/api';
import { getUser } from '../../utils/authFunctions';

const MovimientosTable = () => {
  const currentUser = getUser();
  const sucursalId = currentUser?.puntosVenta?.[0]?.id || null;

  const [filters, setFilters] = useState({
    sucursalId: sucursalId,
    tipo: '',
    motivo: '',
    fechaInicio: '',
    fechaFin: '',
    page: 0,
    size: 10
  });

  const [selectedMovimiento, setSelectedMovimiento] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['movimientosMermas', filters],
    queryFn: () => getMermas(filters),
    keepPreviousData: true
  });

  const handleFilterChange = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters, page: 0 }));
  };

  const handlePageChange = (newPage) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  const handleView = (row) => {
    setSelectedMovimiento(row);
    setDetailsOpen(true);
  };

  const columns = [
    { header: 'ID', accessor: 'id' },
    {
      header: 'Fecha',
      accessor: 'fecha',
      render: (row) => new Date(row.fecha).toLocaleDateString()
    },
    { header: 'Tipo', accessor: 'tipo' },
    { header: 'Motivo', accessor: 'motivo' },
    { header: 'Cantidad', accessor: 'cantidad' },
    { header: 'Sucursal', accessor: 'sucursalNombre' },
    { header: 'Producto', accessor: 'itemNombre' },
    { header: 'Insumo', accessor: 'insumoNombre' },
    { header: 'Registrado por', accessor: 'registradoPor' },
    {
      header: 'Acciones',
      accessor: 'acciones',
      render: (row) => (
        <ActionButtons
          onView={() => handleView(row)}
          viewTitle="Ver detalles"
        />
      )
    }
  ];

  if (isError) {
    toast.error('Error al cargar los movimientos');
    return <div>Error: {error.message}</div>;
  }

  return (
    <div className="movimientos-panel">
      <div className="panel-header">
        <h2>Mermas y Donaciones</h2>
      </div>

      <FiltersPanel
        filters={filters}
        onFilterChange={handleFilterChange}
        onResetFilters={() => setFilters({
          tipo: '',
          motivo: '',
          fechaInicio: '',
          fechaFin: '',
          page: 0,
          size: 10
        })}
      />

      <Table
        columns={columns}
        data={data?.data?.content || []}
        loading={isLoading}
        onRowClick={handleView}
        pagination={{
          currentPage: filters.page,
          totalPages: data?.data?.totalPages || 0,
          onPageChange: handlePageChange
        }}
      />


      <Modal isOpen={detailsOpen} onClose={() => setDetailsOpen(false)}>
        {selectedMovimiento && (
          <MovimientoMermaDetails
            movimiento={selectedMovimiento}
            onClose={() => setDetailsOpen(false)}
          />
        )}
      </Modal>
    </div>
  );
};

export default MovimientosTable;
