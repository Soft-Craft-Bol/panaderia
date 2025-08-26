import React, { useState } from 'react';

import Modal from '../../components/modal/Modal';
import ModalConfirm from '../../components/modalConfirm/ModalConfirm';
import Table from '../../components/table/Table';
import { toast, Toaster } from 'sonner';
import { Button } from '../../components/buttons/Button';
import { 
  FaFileInvoice, 
  FaPlus
} from 'react-icons/fa';
import './ListVentas.css';
import { useVentasSinFactura } from '../../hooks/useVentasSinFactura';

const AccionesVenta = ({ venta, onGenerarFactura, isGenerando }) => {
  return (
    <div className="venta-actions">
      <Button
        variant="primary"
        onClick={() => onGenerarFactura(venta)}
        disabled={isGenerando}
        icon={<FaPlus />}
      >
        {isGenerando ? "Generando..." : "Facturar"}
      </Button>
    </div>
  );
};

const VentasSinFacturaPanel = () => {
  const [selectedVenta, setSelectedVenta] = useState(null);
  const [confirmActionOpen, setConfirmActionOpen] = useState(false);
  const [isGenerando, setIsGenerando] = useState(false);
  
  const {
    ventas,
    pagination,
    loading,
    error,
    filters,
    handlePageChange,
    handleSizeChange,
    updateFilters,
    resetFilters,
    refetch
  } = useVentasSinFactura();

  const handleActionConfirm = (venta) => {
    setSelectedVenta(venta);
    setConfirmActionOpen(true);
  };

  const columns = [
    { 
      header: 'N° Venta', 
      accessor: 'id',
      render: (row) => row.id
    },
    { 
      header: 'Fecha', 
      accessor: 'fecha',
      render: (row) => new Date(row.fecha).toLocaleDateString() 
    },
    { 
      header: 'Cliente', 
      accessor: 'clienteNombre',
      render: (row) => row.cliente?.nombreRazonSocial || 'Consumidor Final'
    },
    { 
      header: 'Monto Total', 
      accessor: 'monto',
      render: (row) => `Bs ${row.monto.toFixed(2)}` 
    },
    { 
      header: 'Método Pago', 
      accessor: 'metodoPago' 
    },
    { 
      header: 'Tipo Comprobante', 
      accessor: 'tipoComprobante' 
    },
    {
      header: 'Acciones',
      accessor: 'acciones',
      render: (row) => (
        <AccionesVenta
          venta={row}
          onGenerarFactura={(v) => handleActionConfirm(v)}
          isGenerando={isGenerando}
        />
      )
    }
  ];

  if (error) {
    return <div className="error-message">Error al cargar las ventas: {error}</div>;
  }

  return (
    <div className="ventas-panel">
      <Toaster position="top-right" richColors />
      <div className="panel-header">
        <h2>
          <FaFileInvoice /> Ventas sin Facturación
        </h2>
      </div>

      <Table
        columns={columns}
        data={ventas}
        loading={loading}
        pagination={{
          currentPage: pagination.page,
          totalPages: pagination.totalPages,
          onPageChange: handlePageChange
        }}
      />

    </div>
  );
};

export default VentasSinFacturaPanel;