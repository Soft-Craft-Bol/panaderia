import React, { useState } from 'react';
import Table from '../../components/table/Table';
import { toast, Toaster } from 'sonner';
import { Button } from '../../components/buttons/Button';
import { FaFileInvoice, FaPlus, FaFilter, FaFilterCircleXmark } from 'react-icons/fa6';
import './ListVentas.css';
import { useVentasSinFactura } from '../../hooks/useVentasSinFactura';
import { anularVentas } from "../../service/api";
import Modal from '../../components/modal/Modal';
import FiltersPanel from '../../components/search/FiltersPanel';

const AccionesVenta = ({ venta, onAnular, isGenerando }) => {
  return (
    <div className="venta-actions">
      <Button
        variant="danger"
        onClick={() => onAnular(venta)}
        disabled={isGenerando}
        icon={<FaPlus />}
      >
        {isGenerando ? "Anulando..." : "Anular"}
      </Button>
    </div>
  );
};

const VentasSinFacturaPanel = () => {
  const [selectedVenta, setSelectedVenta] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [motivo, setMotivo] = useState('');
  const [isGenerando, setIsGenerando] = useState(false);
  const [showFilters, setShowFilters] = useState(false); 

  const {
    ventas,
    pagination,
    loading,
    error,
    filters,
    handlePageChange,
    handleSizeChange, // Función para cambiar el tamaño de página
    updateFilters,
    resetFilters,
    refetch
  } = useVentasSinFactura();

  const handleOpenModal = (venta) => {
    setSelectedVenta(venta);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedVenta(null);
    setMotivo('');
  };

  const handleAnularVenta = async () => {
    if (!selectedVenta || motivo.trim() === '') {
      toast.error("Debes ingresar un motivo de anulación");
      return;
    }

    setIsGenerando(true);
    try {
      await anularVentas(selectedVenta.id, {
        motivo,
        usuario: "Gaspar"
      });

      toast.success("Venta anulada correctamente ✅");
      refetch();
      handleCloseModal();
    } catch (error) {
      console.error("Error al anular venta:", error);
      toast.error("Error al anular la venta ❌");
    } finally {
      setIsGenerando(false);
    }
  };

  // Función para manejar el cambio de página (convertir de 0-based a 1-based)
  const handleTablePageChange = (page) => {
    handlePageChange(page - 1); // La tabla usa páginas 1-based, pero el backend usa 0-based
  };

  // Función para manejar el cambio de filas por página
  const handleRowsPerPageChange = (size) => {
    handleSizeChange(size);
  };

  // Configuración de filtros
  const filtersConfig = [
    {
      type: 'search',
      name: 'codigoCliente',
      label: 'Buscar Cliente',
      placeholder: 'Código o nombre de cliente',
      config: {
        debounceTime: 500
      }
    },
    {
      type: 'search',
      name: 'codigoProducto',
      label: 'Buscar Producto',
      placeholder: 'Código de producto',
      config: {
        debounceTime: 500
      }
    },
    {
      type: 'select',
      name: 'metodoPago',
      label: 'Método de Pago',
      placeholder: 'Todos los métodos',
      config: {
        options: [
          { id: 'EFECTIVO', nombre: 'EFECTIVO' },
          { id: 'TARJETA', nombre: 'TARJETA' },
          { id: 'QR', nombre: 'QR' },
          { id: 'TRANSFERENCIA', nombre: 'TRANSFERENCIA' },
          { id: 'CREDITO', nombre: 'CRÉDITO' }
        ],
        valueKey: 'id',
        labelKey: 'nombre'
      }
    },
    {
      type: 'date',
      name: 'fechaDesde',
      label: 'Fecha Desde',
      placeholder: 'Seleccione fecha inicial'
    },
    {
      type: 'date',
      name: 'fechaHasta',
      label: 'Fecha Hasta',
      placeholder: 'Seleccione fecha final'
    },
    {
      type: 'range',
      name: 'montoMin',
      label: 'Monto Mínimo',
      config: {
        min: 0,
        max: 10000,
        step: 10,
        showValues: true,
        defaultValue: 0
      }
    },
    {
      type: 'range',
      name: 'montoMax',
      label: 'Monto Máximo',
      config: {
        min: 0,
        max: 10000,
        step: 10,
        showValues: true,
        defaultValue: 10000
      }
    }
  ];

  const columns = [
    { header: 'N° Venta', accessor: 'id', render: (row) => row.id },
    { header: 'Fecha', accessor: 'fecha', render: (row) => new Date(row.fecha).toLocaleDateString() },
    { header: 'Cliente', accessor: 'clienteNombre', render: (row) => row.cliente?.nombreRazonSocial || 'Consumidor Final' },
    { header: 'Monto Total', accessor: 'monto', render: (row) => `Bs ${row.monto.toFixed(2)}` },
    { header: 'Método Pago', accessor: 'metodoPago' },
    { header: 'Tipo Comprobante', accessor: 'tipoComprobante' },
    {
      header: 'Acciones',
      accessor: 'acciones',
      render: (row) => (
        <AccionesVenta
          venta={row}
          onAnular={handleOpenModal}
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
        
        {/* Botón para mostrar/ocultar filtros */}
        <div className="panel-header-actions">
          <Button
            variant="secondary"
            onClick={() => setShowFilters(!showFilters)}
            icon={showFilters ? <FaFilterCircleXmark /> : <FaFilter />}
          >
            {showFilters ? 'Ocultar Filtros' : 'Mostrar Filtros'}
          </Button>
        </div>
      </div>

      {/* Panel de Filtros - Condicional */}
      {showFilters && (
        <FiltersPanel
          filtersConfig={filtersConfig}
          filters={filters}
          onFilterChange={updateFilters}
          onResetFilters={resetFilters}
          layout="grid" // Puedes cambiar a 'auto', 'flex-column', 'compact'
        />
      )}

      <Table
        columns={columns}
        data={ventas}
        loading={loading}
        pagination={{
          currentPage: pagination.page + 1, // Convertir de 0-based a 1-based para la tabla
          totalPages: pagination.totalPages,
          totalElements: pagination.totalElements,
          rowsPerPage: pagination.size
        }}
        onPageChange={handleTablePageChange}
        onRowsPerPageChange={handleRowsPerPageChange}
        storageKey="ventas-sin-factura-table" // Clave única para guardar configuración de columnas
      />

      {/* Modal de anulación */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title="Anular Venta"
        size="sm"
      >
        <div className="form-group">
          <label>Motivo de anulación</label>
          <input
            type="text"
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
            placeholder="Escribe el motivo"
            className="input"
          />
        </div>

        <div className="modal-actions" style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
          <Button variant="secondary" onClick={handleCloseModal}>
            Cancelar
          </Button>
          <Button
            variant="danger"
            onClick={handleAnularVenta}
            loading={isGenerando}
          >
            {isGenerando ? "Anulando..." : "Anular"}
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default VentasSinFacturaPanel;