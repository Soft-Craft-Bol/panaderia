import React, { useState } from 'react';
import { FaBoxOpen, FaExclamationTriangle, FaEdit } from 'react-icons/fa';
import { format } from 'date-fns';
import Table from '../../components/table/Table';
import './InsumosSucursalTable.css';
import EditStockMinimoModal from '../../components/forms/insumoForm/EditStockMinimoModal';

const InsumosSucursalTable = ({ 
  data, 
  loading, 
  error, 
  onPageChange, 
  onRowsPerPageChange,
  onCompra,
  page,
  rowsPerPage,
  totalPages,
  totalElements,
  sucursalId,
  sucursalNombre,
  onStockMinimoUpdated,
}) => {
  const [editingInsumo, setEditingInsumo] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);

  const isExpired = (fechaVencimiento) => {
    if (!fechaVencimiento) return false;
    return new Date(fechaVencimiento) < new Date();
  };

  const handleEditStockMinimo = (insumo) => {
    setEditingInsumo({
      ...insumo,
      sucursalNombre: sucursalNombre
    });
    setEditModalOpen(true);
  };

  const handleStockMinimoUpdated = () => {
    setEditModalOpen(false);
    setEditingInsumo(null);
    if (onStockMinimoUpdated) {
      onStockMinimoUpdated();
    }
  };

  const columns = [
    {
      header: 'Nombre',
      accessor: 'nombre'
    },
    {
      header: 'Tipo',
      accessor: 'tipo'
    },
    {
      header: 'Cantidad',
      accessor: 'cantidad',
      render: (row) => (
        <span className={row.cantidad <= row.stockMinimo ? 'text-warning' : ''}>
          {row.cantidad}
        </span>
      )
    },
    {
      header: 'Unidad',
      accessor: 'unidades'
    },
    {
      header: 'Stock Mínimo',
      accessor: 'stockMinimo',
      render: (row) => (
        <div className="stock-minimo-cell">
          <span>{row.stockMinimo || 'N/A'}</span>
          <button
            className="edit-stock-btn"
            onClick={() => handleEditStockMinimo(row)}
            title="Editar stock mínimo"
          >
            <FaEdit size={14} />
          </button>
        </div>
      )
    },
    {
      header: 'Fecha Vencimiento',
      accessor: 'fechaVencimiento',
      render: (row) => (
        <span className={isExpired(row.fechaVencimiento) ? 'text-danger' : ''}>
          {row.fechaVencimiento ? format(new Date(row.fechaVencimiento), 'dd/MM/yyyy') : 'N/A'}
          {isExpired(row.fechaVencimiento) && (
            <FaExclamationTriangle className="ml-2 text-danger" title="Insumo vencido" />
          )}
        </span>
      )
    },
    {
      header: 'Estado',
      accessor: 'activo',
      render: (row) => (
        <span className={`badge ${row.activo ? 'bg-success' : 'bg-secondary'}`}>
          {row.activo ? 'Activo' : 'Inactivo'}
        </span>
      )
    },
    {
      header: 'Acciones',
      accessor: 'actions',
      render: (row) => (
        <div className="action-buttons">
          <button
            className="comprar-button"
            onClick={() => onCompra(row)}
            title="Registrar Compra"
          >
            Comprar
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="insumos-sucursal-table">
      {error && <div className="alert alert-danger">Error al cargar insumos: {error.message}</div>}

      <Table
        columns={columns}
        data={data}
        loading={loading}
        pagination={{
          currentPage: page,
          totalPages,
          totalElements,
          rowsPerPage
        }}
        onPageChange={onPageChange}
        onRowsPerPageChange={onRowsPerPageChange}
      />

      <EditStockMinimoModal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        insumo={editingInsumo}
        sucursalId={sucursalId} 
        onSuccess={handleStockMinimoUpdated}
      />
    </div>
  );
};

export default InsumosSucursalTable;