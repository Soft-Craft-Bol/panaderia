import React, { useState } from 'react';
import Table from '../../components/table/Table';
import ButtonPrimary from '../../components/buttons/ButtonPrimary';
import Modal from '../../components/modal/Modal';
import InsumoForm from './InsumoForm';
import { FaPlus, FaFilter } from 'react-icons/fa';

import './InsumosTable.css';
import SelectSecondary from '../../components/selected/SelectSecondary';
import SearchInput from '../../components/search/SearchInput';
import ActionButtons from '../../components/buttons/ActionButtons';
import { useInsumosTable } from '../../hooks/useInsumosTable';

export const TIPOS_INSUMO = [
  { value: 'MATERIA_PRIMA', label: 'Materia Prima', color: '#1976d2', bg: '#e3f2fd' },
  { value: 'PRODUCTO_TERMINADO', label: 'Producto Terminado', color: '#388e3c', bg: '#e8f5e9' },
  { value: 'EMPAQUE_ETIQUETA', label: 'Empaques y Etiquetas', color: '#8e24aa', bg: '#f3e5f5' },
  { value: 'MATERIAL_LIMPIEZA', label: 'Material de Limpieza', color: '#f57c00', bg: '#fff3e0' },
];

const InsumosTable = () => {
  const [nombreFilter, setNombreFilter] = useState('');
  const [tipoFilter, setTipoFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedInsumo, setSelectedInsumo] = useState(null);
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const {
    data,
    isLoading,
    error,
    refetch
  } = useInsumosTable({
    nombre: nombreFilter,
    tipo: tipoFilter,
    page: page - 1,
    size: rowsPerPage
  });




  const insumos = data?.data?.content || [];
  const totalPages = data?.data?.totalPages || 1;
  const totalElements = data?.data?.totalElements || 0;

  const handleEdit = (row) => {
    setSelectedInsumo(row);
    setModalOpen(true);
  };

  const columns = [
    {
      accessor: 'nombre',
      header: 'Nombre',
      render: (row) => (
        <div className="insumo-cell">
          {row.imagen && (
            <img
              src={row.imagen}
              alt={row.nombre}
              className="insumo-image-table"
              onError={(e) => {
                e.target.src = 'https://via.placeholder.com/50';
              }}
            />
          )}
          <span>{row.nombre}</span>
        </div>
      )
    },
    {
      accessor: 'tipo',
      header: 'Tipo',
      render: (row) => {
        const tipo = TIPOS_INSUMO.find(t => t.value === row.tipo);
        return (
          <span
            className="tipo-badge"
            style={{
              backgroundColor: tipo?.bg || '#eee',
              color: tipo?.color || '#333'
            }}
          >
            {tipo?.label || row.tipo}
          </span>
        );
      }
    },
    {
      accessor: 'precioActual',
      header: 'Precio',
      render: (row) => `Bs ${row.precioActual?.toFixed(2) || '0.00'}`
    },
    {
      accessor: 'cantidad',
      header: 'Cantidad'
    },
    {
      accessor: 'unidades',
      header: 'Unidad'
    },
    {
      accessor: 'activo',
      header: 'Estado',
      render: (row) => (
        <span className={`status-badge ${row.activo ? 'active' : 'inactive'}`}>
          {row.activo ? 'Activo' : 'Inactivo'}
        </span>
      )
    },
    {
      accessor: 'actions',
      header: 'Acciones',
      render: (row) => (
        <ActionButtons
          onEdit={() => handleEdit(row)}
          showView={false}
          showDelete={false}
        />
      )
    }
  ];

  const handleSubmitSuccess = () => {
    setModalOpen(false);
    setSelectedInsumo(null);
    refetch();
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (newSize) => {
    setRowsPerPage(newSize);
    setPage(1);
  };

  return (
    <div className="insumos-table-container">
      <div className="table-header">
        <h2>Insumos</h2>

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
            <FaPlus /> Nuevo Insumo
          </ButtonPrimary>
        </div>
      </div>

      {showFilters && (
        <div className="filters-container">
          <div className="filter-group">
            <SearchInput
              placeholder="Filtrar por nombre"
              initialValue={nombreFilter}
              onSearch={(term) => setNombreFilter(term)}
              debounceTime={400}
            />
          </div>

          <div className="filter-group">
            <SelectSecondary
              value={tipoFilter}
              formikCompatible={false}
              onChange={(e) => setTipoFilter(e.target.value)}
              placeholder="Seleccionar tipo..."
            >
              <option value="">Todos</option>
              {TIPOS_INSUMO.map(tipo => (
                <option key={tipo.value} value={tipo.value}>{tipo.label}</option>
              ))}
            </SelectSecondary>

          </div>
        </div>
      )}

      {error && <div className="error-message">Error al cargar insumos: {error.message}</div>}

      <Table
        columns={columns}
        data={insumos}
        onRowClick={(row) => {
          setSelectedInsumo(row);
          setModalOpen(true);
        }}
        loading={isLoading}
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
        <InsumoForm
          insumo={selectedInsumo}
          onSuccess={handleSubmitSuccess}
          onCancel={() => {
            setModalOpen(false);
            setSelectedInsumo(null);
          }}
        />
      </Modal>
    </div>
  );
};

export default InsumosTable;