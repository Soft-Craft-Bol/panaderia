import React, { useState, useMemo, useCallback } from 'react';
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import Table from '../../components/table/Table';
import { useProduccion } from '../../hooks/useProduccion';
import Modal from '../../components/modal/Modal';
import ProduccionDetail from './ProduccionDetail';
import { deleteProduccion, getRecetasByPage } from '../../service/api';
import { toast, Toaster } from 'sonner';
import ActionButtons from '../../components/buttons/ActionButtons';
import ButtonPrimary from '../../components/buttons/ButtonPrimary';
import SelectorRecetasPaginado from '../../components/selected/SelectorRecetasPaginado';
import SelectorProductosPaginado from '../../components/selected/SelectorProductosPaginado';
import './ProduccionFilters.css';
import { getUser } from '../../utils/authFunctions';
import { useProductos } from '../../hooks/useProductos';
import { debounce } from 'lodash';

const CACHE_SETTINGS = {
  staleTime: 5 * 60 * 1000, 
  cacheTime: 30 * 60 * 1000,
};

const ProduccionTable = () => {
  const queryClient = useQueryClient();
  const currentUser = getUser();
  const puntoVentaId = currentUser?.puntosVenta[0]?.id || null;
  
  const [recetaSearchTerm, setRecetaSearchTerm] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filters, setFilters] = useState({
    recetaId: null,
    productoId: null,
    fechaInicio: null,
    fechaFin: null
  });
  const [selectedProduccion, setSelectedProduccion] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const debouncedSetRecetaSearchTerm = useMemo(
    () => debounce(setRecetaSearchTerm, 300),
    []
  );

  const {
    data: recetasPages,
    fetchNextPage: fetchNextRecetas,
    hasNextPage: hasNextRecetas,
    isFetchingNextPage: isFetchingNextRecetas,
  } = useInfiniteQuery({
    queryKey: ['recetas-table', recetaSearchTerm],
    queryFn: ({ pageParam = 0 }) =>
      getRecetasByPage({
        page: pageParam,
        size: 10,
        nombre: recetaSearchTerm
      }),
    getNextPageParam: (lastPage) => {
      if (lastPage.page < lastPage.totalPages - 1) {
        return lastPage.page + 1;
      }
      return undefined;
    },
    ...CACHE_SETTINGS
  });

  const {
    productos,
    loadMore: loadMoreProductos,
    hasNextPage: hasNextProductos,
    isFetching: isFetchingProductos,
    searchTerm: productoSearchTerm,
    setSearchTerm: setProductoSearchTerm,
  } = useProductos(puntoVentaId);

  const allRecetas = useMemo(() => 
    recetasPages?.pages?.flatMap(page =>
      page.data?.content?.map(receta => ({
        ...receta,
        producto: {
          ...receta.producto,
          nombre: receta.nombreProducto || `Producto ${receta.productoId}`,
        },
      }))
    ) || [],
    [recetasPages]
  );

  const apiFilters = useMemo(() => ({
    ...filters,
    sucursalId: puntoVentaId
  }), [filters, puntoVentaId]);

  const { 
    data, 
    isLoading, 
    isError, 
    error 
  } = useProduccion(page, rowsPerPage, apiFilters);

  const handleDelete = useCallback(async (id) => {
    try {
      await deleteProduccion(id);
      queryClient.invalidateQueries(['produccion']);
      toast.success('Producción eliminada correctamente');
    } catch (err) {
      toast.error('Error al eliminar la producción');
      console.error(err);
    }
  }, [queryClient]);

  const handleFilterChange = useCallback((newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setPage(0); 
  }, []);

  const handleRecetaChange = useCallback((receta) => {
    handleFilterChange({ recetaId: receta?.id || null });
  }, [handleFilterChange]);

  const formatDateForInput = useCallback((date) => {
    if (!date) return '';
    if (typeof date === 'string') return date;
    return date.toISOString().split('T')[0];
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({
      recetaId: null,
      productoId: null,
      fechaInicio: null,
      fechaFin: null
    });
    setPage(0);
    setRecetaSearchTerm('');
    setProductoSearchTerm('');
  }, []);

  const columns = useMemo(() => [
    { header: 'ID', accessor: 'id' },
    {
      header: 'Fecha',
      accessor: 'fecha',
      render: (row) => new Date(row.fecha).toLocaleDateString()
    },
    {
      header: 'Receta',
      accessor: 'recetaNombre',
      render: (row) => row.recetaNombre || `ID: ${row.recetaId}`
    },
    {
      header: 'Producto',
      accessor: 'productoNombre',
      render: (row) => row.productoNombre || `ID: ${row.productoId}`
    },
    {
      header: 'Cantidad',
      accessor: 'cantidadProducida',
      render: (row) => row.cantidadProducida || 0
    },
    {
      header: 'Estado',
      accessor: 'estado',
      render: (row) => row.estado || 'Completado'
    },
    {
      header: 'Acciones',
      accessor: 'actions',
      render: (row) => (
        <ActionButtons
          onView={() => handleViewProduccion(row)}
          onEdit={false}
          onDelete={() => {
            if (window.confirm('¿Estás seguro de eliminar esta producción?')) {
              handleDelete(row.id);
            }
          }}
        />
      ),
    },
  ], [handleDelete]);

  const handleViewProduccion = useCallback((produccion) => {
    setSelectedProduccion(produccion);
    setIsModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedProduccion(null);
  }, []);

  if (isError) return <div className="error">Error: {error.message}</div>;

  return (
    <div className="produccion-container">
      <Toaster position="top-right" richColors />

      <div className="produccion-filters-panel">
        <div className="filter-group">
          <label>Receta</label>
          <SelectorRecetasPaginado
            recetas={allRecetas}
            value={filters.recetaId}
            onChange={handleRecetaChange}
            onLoadMore={fetchNextRecetas}
            hasNextPage={hasNextRecetas}
            isFetchingNextPage={isFetchingNextRecetas}
            onSearch={debouncedSetRecetaSearchTerm}
            placeholder="Buscar receta..."
          />
        </div>

        <div className="filter-group">
          <label>Producto</label>
          <SelectorProductosPaginado
            productos={productos}
            value={selectedItem?.id}
            onChange={(item) => {
              setSelectedItem(item);
              handleFilterChange({ productoId: item?.id || null });
            }}
            onLoadMore={loadMoreProductos}
            hasNextPage={hasNextProductos}
            isFetchingNextPage={isFetchingProductos}
            isLoading={false}
            placeholder="Seleccionar producto terminado..."
            onSearch={setProductoSearchTerm}
          />
        </div>

        <div className="filter-group">
          <label>Fecha desde</label>
          <input
            type="date"
            name="fechaInicio"
            value={formatDateForInput(filters.fechaInicio)}
            onChange={(e) => handleFilterChange({ fechaInicio: e.target.value })}
            max={filters.fechaFin ? formatDateForInput(filters.fechaFin) : undefined}
            className="native-date-input"
          />
        </div>

        <div className="filter-group">
          <label>Fecha hasta</label>
          <input
            type="date"
            name="fechaFin"
            value={formatDateForInput(filters.fechaFin)}
            onChange={(e) => handleFilterChange({ fechaFin: e.target.value })}
            min={filters.fechaInicio ? formatDateForInput(filters.fechaInicio) : undefined}
            className="native-date-input"
          />
        </div>

        <div className="filter-actions">
          <ButtonPrimary
            variant="secondary"
            onClick={resetFilters}
          >
            Limpiar Filtros
          </ButtonPrimary>
        </div>
      </div>

      <Table
        columns={columns}
        data={data?.producciones?.content || []}
        onRowClick={handleViewProduccion}
        pagination={{
          currentPage: page + 1,
          totalPages: data?.totalPages || 1,
          totalElements: data?.totalElements || 0,
          rowsPerPage: rowsPerPage,
        }}
        onPageChange={(newPage) => setPage(newPage - 1)}
        onRowsPerPageChange={setRowsPerPage}
        loading={isLoading}
        showColumnVisibility={true}
        storageKey="produccionTableHiddenColumns"
      />

      <Modal isOpen={isModalOpen} onClose={closeModal}>
        {selectedProduccion && (
          <ProduccionDetail
            produccion={selectedProduccion}
            onClose={closeModal}
          />
        )}
      </Modal>
    </div>
  );
};

export default React.memo(ProduccionTable);