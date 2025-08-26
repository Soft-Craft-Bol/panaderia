// components/InsumosSucursalTable.js
import React from 'react';
import { FaBoxOpen, FaExclamationTriangle } from 'react-icons/fa';
import { format } from 'date-fns';
import Table from '../../components/table/Table';
import './InsumosSucursalTable.css';

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
  totalElements
}) => {
  const isExpired = (fechaVencimiento) => {
    if (!fechaVencimiento) return false;
    return new Date(fechaVencimiento) < new Date();
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
      accessor: 'stockMinimo'
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
        <button
            className="comprar-button"
            onClick={() => onCompra(row)}
            title="Registrar Compra"
        >Comprar</button>
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
    </div>
  );
};

export default InsumosSucursalTable;