import React, { useState } from 'react';
import { 
  anularFactura,
  revertirAnulacionFactura,
} from '../../service/api';
import ModalConfirm from '../../components/modalConfirm/ModalConfirm';
import Table, { useColumnVisibility } from '../../components/table/Table';
import { toast, Toaster } from 'sonner';
import { Button } from '../../components/buttons/Button';
import {   
  FaFileInvoice, 
  FaBan,
  FaUndo,
  FaFilter,
  FaTimes
} from 'react-icons/fa';
import './ListVentas.css';
import { useVentasConFactura } from '../../hooks/useVentasConFactura';
import CustomDatePicker from '../../components/inputs/DatePicker';
import SelectSecondary from '../../components/selected/SelectSecondary';
import SearchInput from '../../components/search/SearchInput';
import ColumnVisibilityControl from '../../components/table/ColumnVisibilityControl';

const AccionesVenta = ({ venta, onAnular, onRevertir, onDownload, isAnulando, isRevirtiendo }) => {
  return (
    <div className="venta-actions">
      {venta.factura?.cuf && (
        <>
          {venta.factura.estado === "EMITIDA" && (
            <Button
              variant="danger"
              onClick={() => onAnular(venta)}
              disabled={isAnulando}
              icon={<FaBan />}
            >
              {isAnulando ? "Anulando..." : "Anular"}
            </Button>
          )}
          {venta.factura.estado === "ANULADA" && (
            <Button
              variant="warning"
              onClick={() => onRevertir(venta)}
              disabled={isRevirtiendo}
              icon={<FaUndo />}
            >
              {isRevirtiendo ? "Revirtiendo..." : "Revertir"}
            </Button>
          )}
        </>
      )}
    </div>
  );
};

const VentasConFacturaPanel = () => {
  const [activeTab, setActiveTab] = useState('todas');
  const [selectedVenta, setSelectedVenta] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [confirmActionOpen, setConfirmActionOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [actionType, setActionType] = useState('');
  const [isAnulando, setIsAnulando] = useState(false);
  const [isRevirtiendo, setIsRevirtiendo] = useState(false);
  
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
  } = useVentasConFactura({
    estadoFactura: activeTab === 'todas' ? '' : activeTab.toUpperCase()
  });

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    updateFilters({ estadoFactura: tab === 'todas' ? '' : tab.toUpperCase() });
  };

  const handleAnularFactura = async (venta) => {
    if (!venta.factura?.cuf) {
      toast.error("Solo se pueden anular facturas con CUF");
      return;
    }
    setIsAnulando(true);
    try {
      const requestData = {
        idPuntoVenta: venta?.puntoVenta?.id,
        cuf: venta.factura.cuf,  
        codigoMotivo: 1,
      };
      await anularFactura(requestData);
      toast.success("Factura anulada exitosamente");
      refetch();
    } catch (error) {
      console.error("Error completo:", error); 
      const errorMessage = error.response?.data?.message || 
                         error.message || 
                         "Error al anular la factura";
      toast.error(errorMessage);
    } finally {
      setIsAnulando(false);
      setConfirmActionOpen(false);
    }
  };

  const handleRevertirFactura = async (venta) => {
    if (!venta.factura?.cuf) {
      toast.error("Solo se pueden revertir facturas con CUF");
      return;
    }

    setIsRevirtiendo(true);
    try {
      const requestData = {
        idPuntoVenta: venta?.puntoVenta?.id,
        cuf: venta.factura.cuf,  
      };
      await revertirAnulacionFactura(requestData);
      toast.success("Anulación revertida exitosamente");
      refetch(); 
    } catch (error) {
      toast.error(error.response?.data?.message || "Error al revertir la anulación");
    } finally {
      setIsRevirtiendo(false);
      setConfirmActionOpen(false);
    }
  };

  const handleActionConfirm = (venta, type) => {
    setSelectedVenta(venta);
    setActionType(type);
    setConfirmActionOpen(true);
  };

  const confirmAction = () => {
    if (actionType === 'anular') {
      handleAnularFactura(selectedVenta);
    } else if (actionType === 'revertir') {
      handleRevertirFactura(selectedVenta);
    }
  };

  const handleDateChange = (field, date) => {
    updateFilters({ [field]: date });
  };

  const handleSearchChange = (field, value) => {
    updateFilters({ [field]: value });
  };

  const handleMontoChange = (field, value) => {
    const numValue = value === '' ? null : Number(value);
    updateFilters({ [field]: numValue });
  };

  const handleEstadoChange = (e) => {
    updateFilters({ estadoFactura: e.target.value });
  };

  const handleMetodoPagoChange = (e) => {
    updateFilters({ metodoPago: e.target.value });
  };

  const columns = [
    { 
      header: 'N° Factura', 
      accessor: 'facturaNumero',
      render: (row) => row.factura?.numeroFactura || 'N/A'
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
      header: 'Estado', 
      accessor: 'estadoFactura',
      render: (row) => {
        const estado = row.factura?.estado || row.estado;
        return (
          <span className={`estado-badge estado-${estado.toLowerCase()}`}>
            {estado}
          </span>
        );
      }
    },
    {
      header: 'Acciones',
      accessor: 'acciones',
      render: (row) => (
        <AccionesVenta
          venta={row}
          onAnular={(v) => handleActionConfirm(v, 'anular')}
          onRevertir={(v) => handleActionConfirm(v, 'revertir')}
          isAnulando={isAnulando}
          isRevirtiendo={isRevirtiendo}
        />
      )
    }
  ];

    const {
      filteredColumns,
      ColumnVisibilityControl
    } = useColumnVisibility(columns, "ventasHiddenColumns");

  if (error) {
    return <div className="error-message">Error al cargar las ventas: {error}</div>;
  }

  return (
    <div className="ventas-panel">
      <Toaster position="top-right" richColors />
      <div className="panel-header">
        <h2>
          <FaFileInvoice /> Ventas con Facturación
        </h2>
        <div className="header-actions">
          <Button
            variant={showFilters ? "primary" : "secondary"}
            onClick={() => setShowFilters(!showFilters)}
            icon={<FaFilter />}
          >
            {showFilters ? "Ocultar Filtros" : "Mostrar Filtros"}
          </Button>
        </div>
      </div>

      {/* Tabs de estado */}
      <div className="tab-container">
        <button 
          className={`tab ${activeTab === 'todas' ? 'active' : ''}`}
          onClick={() => handleTabChange('todas')}
        >
          Todas
        </button>
        <button 
          className={`tab ${activeTab === 'emitida' ? 'active' : ''}`}
          onClick={() => handleTabChange('emitida')}
        >
          Emitidas
        </button>
        <button 
          className={`tab ${activeTab === 'anulada' ? 'active' : ''}`}
          onClick={() => handleTabChange('anulada')}
        >
          Anuladas
        </button>
      </div>

      {/* Filtros */}
      {showFilters && (
        <div className="filters-panel">
          <div className="filters-header">
            <h3>Filtros</h3>
            <Button
              variant="text"
              onClick={resetFilters}
              icon={<FaTimes />}
            >
              Limpiar Filtros
            </Button>
          </div>
          
          <div className="filters-grid">
            <div className="filter-group">
              <label>Rango de Fechas</label>
              <div className="date-range">
                <CustomDatePicker
                  selected={filters.fechaDesde}
                  onChange={(date) => handleDateChange('fechaDesde', date)}
                  placeholderText="Desde"
                  isClearable
                />
                <span className="date-separator">-</span>
                <CustomDatePicker
                  selected={filters.fechaHasta}
                  onChange={(date) => handleDateChange('fechaHasta', date)}
                  placeholderText="Hasta"
                  isClearable
                />
              </div>
            </div>

            <div className="filter-group">
              <label>Estado Factura</label>
              <SelectSecondary
                value={filters.estadoFactura}
                onChange={handleEstadoChange}
              >
                <option value="">Todos</option>
                <option value="EMITIDA">Emitida</option>
                <option value="ANULADA">Anulada</option>
              </SelectSecondary>
            </div>

            <div className="filter-group">
              <label>Método de Pago</label>
              <SelectSecondary
                value={filters.metodoPago}
                onChange={handleMetodoPagoChange}
              >
                <option value="">Todos</option>
                <option value="EFECTIVO">Efectivo</option>
                <option value="TARJETA">Tarjeta</option>
                <option value="TRANSFERENCIA">Transferencia</option>
              </SelectSecondary>
            </div>

            <div className="filter-group">
              <label>Código Cliente</label>
              <SearchInput
                placeholder="Buscar por código cliente..."
                onSearch={(value) => handleSearchChange('codigoCliente', value)}
                initialValue={filters.codigoCliente}
              />
            </div>

            <div className="filter-group">
              <label>Código Producto</label>
              <SearchInput
                placeholder="Buscar por código producto..."
                onSearch={(value) => handleSearchChange('codigoProducto', value)}
                initialValue={filters.codigoProducto}
              />
            </div>

            <div className="filter-group">
              <label>Rango de Monto</label>
              <div className="monto-range">
                <input
                  type="number"
                  placeholder="Mínimo"
                  value={filters.montoMin || ''}
                  onChange={(e) => handleMontoChange('montoMin', e.target.value)}
                  className="monto-input"
                />
                <span className="monto-separator">-</span>
                <input
                  type="number"
                  placeholder="Máximo"
                  value={filters.montoMax || ''}
                  onChange={(e) => handleMontoChange('montoMax', e.target.value)}
                  className="monto-input"
                />
              </div>
            </div>
          </div>
        </div>
      )}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
        <ColumnVisibilityControl buttonLabel="Columnas" />
      </div>
      {/* Tabla */}
      <Table
        columns={filteredColumns} 
        data={ventas}
        loading={loading}
        pagination={{
          currentPage: pagination.page,
          totalPages: pagination.totalPages,
          totalElements: pagination.totalElements,
          rowsPerPage: pagination.size
        }}
        onPageChange={handlePageChange}
        onRowsPerPageChange={handleSizeChange}
      />

      <ModalConfirm
        isOpen={confirmActionOpen}
        onClose={() => setConfirmActionOpen(false)}
        onConfirm={confirmAction}
        title={actionType === 'anular' ? "Anular Factura" : "Revertir Anulación"}
        message={
          actionType === 'anular' 
            ? `¿Está seguro que desea anular la factura #${selectedVenta?.factura?.numeroFactura || selectedVenta?.id}?` 
            : `¿Está seguro que desea revertir la anulación de la factura #${selectedVenta?.factura?.numeroFactura || selectedVenta?.id}?`
        }
        confirmText={actionType === 'anular' ? "Anular" : "Revertir"}
        cancelText="Cancelar"
        danger={actionType === 'anular'}
        warning={actionType === 'revertir'}
        isLoading={actionType === 'anular' ? isAnulando : isRevirtiendo}
      />
    </div>
  );
};

export default VentasConFacturaPanel;