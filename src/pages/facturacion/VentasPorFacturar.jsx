import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import Table from '../../components/table/Table';
import { toast, Toaster } from 'sonner';
import { Button } from '../../components/buttons/Button';
import {
  FaFileInvoice,
  FaPlus
} from 'react-icons/fa';
import './ListVentas.css';
import { useVentasSinFactura } from '../../hooks/useVentasSinFactura';


const VentasPorFacturar = () => {
  const navigate = useNavigate();

  const handleFacturacionMasiva = () => {
    if (selectedVentas.length === 0) {
      toast.error("Debe seleccionar al menos una venta");
      return;
    }
    navigate("/facturacion-masiva", { state: { ventas: selectedVentas, nits: ["99001", "99002", "99003"] } });
  };


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

    
  const now = new Date();
  const limit = new Date(now.getTime() - 72 * 60 * 60 * 1000);

  // Filtramos ventas que cumplen la condición
  const ventasFiltradas = ventas?.filter(v => new Date(v.fecha) >= limit) || [];

  const [selectedVentas, setSelectedVentas] = useState([]);

  const toggleVenta = (ventaId) => {
    setSelectedVentas(prev =>
      prev.includes(ventaId)
        ? prev.filter(id => id !== ventaId)
        : [...prev, ventaId]
    );
  };

  const toggleAll = () => {
    if (selectedVentas.length === ventasFiltradas.length) {
      setSelectedVentas([]);
    } else {
      setSelectedVentas(ventasFiltradas.map(v => v.id));
    }
  };
  const columns = [
    {
      header: (
        <input
          type="checkbox"
          checked={selectedVentas.length === ventasFiltradas.length && ventasFiltradas.length > 0}
          onChange={toggleAll}
        />
      ),
      accessor: "seleccion",
      render: (row) => (
        <input
          type="checkbox"
          checked={selectedVentas.includes(row.id)}
          onChange={() => toggleVenta(row.id)}
        />
      ),
    },
    { header: "N° Venta", accessor: "id", render: (row) => row.id },
    { header: "Fecha", accessor: "fecha", render: (row) => new Date(row.fecha).toLocaleDateString() },
    { header: "Cliente", accessor: "clienteNombre", render: (row) => row.cliente?.nombreRazonSocial || "Consumidor Final" },
    { header: "Monto Total", accessor: "monto", render: (row) => `Bs ${row.monto.toFixed(2)}` },
    { header: "Método Pago", accessor: "metodoPago" },
    { header: "Tipo Comprobante", accessor: "tipoComprobante" },
  ];

  if (error) {
    return <div className="error-message">Error al cargar las ventas: {error}</div>;
  }

  return (
    <div className="ventas-panel">
      <Toaster position="top-right" richColors />
      <div className="panel-header">
        <h2>
          <FaFileInvoice /> Ventas Por Facturar 
        </h2>
      </div>

      <div className="acciones-masivas">
        <Button
          variant="primary"
          onClick={handleFacturacionMasiva}
          disabled={selectedVentas.length === 0}
        >
          Facturar Seleccionadas
        </Button>
      </div>

      <Table
        columns={columns}
        data={ventasFiltradas}
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

export default VentasPorFacturar;