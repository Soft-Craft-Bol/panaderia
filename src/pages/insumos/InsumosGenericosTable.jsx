import React, { useState } from 'react';
import Table from '../../components/table/Table';
import ButtonPrimary from '../../components/buttons/ButtonPrimary';
import Modal from '../../components/modal/Modal';
import { FaPlus, FaFilter, FaTrash } from 'react-icons/fa';
import SearchInput from '../../components/search/SearchInput';
import ActionButtons from '../../components/buttons/ActionButtons';
import { useInsumosGenericosTable } from '../../hooks/useInsumosGenericosTable';
import InsumoGenericoDetalle from './InsumoGenericoDetalle';
import { toast } from 'sonner';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteInsumoGenerico } from '../../service/api';
import AsignarInsumosGenericosForm from './AsignarInsumosGenericosForm';
import './InsumosGenericosTable.css';
import InsumoGenericoForm from './InsumoGenericoForm';
import { render } from 'react-dom';

const InsumosGenericosTable = () => {
  const [nombreFilter, setNombreFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedInsumo, setSelectedInsumo] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [showAsignacionModal, setShowAsignacionModal] = useState(false);
  const queryClient = useQueryClient();

  const {
    data,
    isLoading,
    error,
    isFetching,
  } = useInsumosGenericosTable({
    nombre: nombreFilter,
    page: page - 1,
    size: rowsPerPage
  });

  const deleteMutation = useMutation({
    mutationFn: deleteInsumoGenerico,
    onSuccess: () => {
      toast.success('Insumo genérico eliminado correctamente');
      queryClient.invalidateQueries(['insumosGenericos']);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Error al eliminar insumo genérico');
    }
  });

  const insumosGenericos = data?.data?.content || [];
  const totalPages = data?.data?.totalPages || 1;
  const totalElements = data?.data?.totalElements || 0;

  const handleEdit = (row) => {
    setSelectedInsumo(row);
    setShowEditModal(true);
  };

  const handleAsignarClick = (row) => {
    setSelectedInsumo(row);
    setShowAsignacionModal(true);
  };

  const handleDelete = (id, tieneAsignaciones) => {
    if (tieneAsignaciones) {
      toast.warning('No se puede eliminar un insumo genérico con asignaciones');
      return;
    }

    if (window.confirm('¿Está seguro que desea eliminar este insumo genérico?')) {
      deleteMutation.mutate(id);
    }
  };


  const columns = [
    {
      accessor: 'nombre',
      header: 'Nombre',
      render: (row) => (
        <div className="insumo-cell">
          <span className={row.insumosAsociados?.length === 0 ? 'no-insumos' : ''}>
            {row.nombre}
          </span>
        </div>
      )
    },
    {
      accessor: 'unidadMedida',
      header: 'Unidad de Medida'
    },
    {
      accessor: 'descripcion',
      header: 'Descripción',
      render: (row) => row.descripcion || '-'
    },
    {
      accessor: 'insumosAsociados',
      header: 'Insumos Específicos',
      render: (row) => (
        <span
          className={`insumos-count ${row.insumosAsociados?.length === 0 ? 'no-insumos' : 'clickeable'}`}
          onClick={() => handleAsignarClick(row)}
          title={row.insumosAsociados?.length === 0 ? "Haz click para asignar insumos" : "Haz click para editar asignaciones"}
        >
          {row.insumosAsociados?.length || 0}
          {row.insumosAsociados?.length === 0 && ' (Sin especificar)'}
        </span>
      )
    },
    {
      accessor: 'actions',
      header: 'Acciones',
      render: (row) => (
        <div className="actions-container">
          <ActionButtons
            onEdit={() => handleEdit(row)}
            showView={true}
            showDelete={true}
            onView={() => {
              setSelectedInsumo(row);
              setModalOpen(true);
            }}
            onDelete={() => handleDelete(row.id, row.insumosAsociados?.length > 0)}
          />
        </div>
      )
    },
    {
      accessor: 'asignar',
      header: 'Asignar/Editar',
      render: (row) => (
        <div>
          <ButtonPrimary
            variant="primary"
            size="sm"
            onClick={() => handleAsignarClick(row)}
          >
            {row.insumosAsociados?.length === 0 ? 'Asignar' : 'Editar'}
          </ButtonPrimary>
        </div>
      )
    }
  ];

  const handleSubmitSuccess = () => {
    setModalOpen(false);
    setShowAsignacionModal(false);
    setSelectedInsumo(null);
    queryClient.invalidateQueries(['insumosGenericos']);
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (newSize) => {
    setRowsPerPage(newSize);
    setPage(1);
  };

  return (
    <div className="insumos-genericos-table-container">
      <div className="table-header">
        <h2>Insumos Genéricos</h2>

        <div className="table-actions">
          <ButtonPrimary
            onClick={() => setShowFilters(!showFilters)}
            variant="secondary"
          >
            <FaFilter /> {showFilters ? 'Ocultar Filtros' : 'Mostrar Filtros'}
          </ButtonPrimary>

          <ButtonPrimary
            onClick={() => {
              setSelectedInsumo(null);
              setModalOpen(true);
            }}
          >
            <FaPlus /> Nuevo Insumo Genérico
          </ButtonPrimary>
        </div>
      </div>

      {showFilters && (
        <div className="filters-container">
          <div className="filter-group">
            <SearchInput
              placeholder="Filtrar por nombre"
              initialValue={nombreFilter}
              onSearch={(term) => {
                setNombreFilter(term);
                setPage(1);
              }}
              debounceTime={400}
            />
          </div>
        </div>
      )}

      {error && <div className="error-message">Error al cargar insumos genéricos: {error.message}</div>}

      <Table
        columns={columns}
        data={insumosGenericos}
        loading={isLoading || isFetching}
        pagination={{
          currentPage: page,
          totalPages: totalPages,
          totalElements: totalElements,
          rowsPerPage: rowsPerPage
        }}
        onPageChange={handlePageChange}
        onRowsPerPageChange={handleRowsPerPageChange}
      />

      <Modal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedInsumo(null);
        }}
        size="lg"
      >
        <InsumoGenericoDetalle
          insumoGenerico={selectedInsumo}
          onSuccess={handleSubmitSuccess}
          onCancel={() => {
            setModalOpen(false);
            setSelectedInsumo(null);
          }}
        />
      </Modal>

      <Modal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedInsumo(null);
        }}
        size="lg"
      >
        <InsumoGenericoForm
          initialData={selectedInsumo}
          onSuccess={() => {
            setShowEditModal(false);
            handleSubmitSuccess();
          }}
          onCancel={() => {
            setShowEditModal(false);
            setSelectedInsumo(null);
          }}
        />
      </Modal>

      <Modal
        isOpen={showAsignacionModal}
        onClose={() => setShowAsignacionModal(false)}
        size="xl"
      >
        <AsignarInsumosGenericosForm
          insumoGenerico={selectedInsumo}
          onSuccess={handleSubmitSuccess}
          onCancel={() => setShowAsignacionModal(false)}
        />
      </Modal>
    </div>
  );
};

export default InsumosGenericosTable;