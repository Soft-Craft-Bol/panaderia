import { useState, useMemo, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import Table, { useColumnVisibility } from "../../components/table/Table";
import { anularFactura, revertirAnulacionFactura } from "../../service/api";
import { getUser } from "../../utils/authFunctions";
import { Toaster, toast } from "sonner";
import LinkButton from "../../components/buttons/LinkButton";
import "./ListVentas.css";
import { Button } from "../../components/buttons/Button";
import { FaCloudDownloadAlt } from "react-icons/fa";
import { generatePDF } from '../../utils/generatePDF';
import useFacturas from "../../hooks/useFacturas";
import SearchAndFilters from "../../components/search/SearchAndFilters";
import SelectSecondary from "../../components/selected/SelectSecondary";

const AccionesVenta = ({ venta, onAnular, onRevertir, onDownload, hasAnyRole, isAnulando, isRevirtiendo }) => {
  return (
    <div className="user-management-table-actions">
      {venta.cuf && hasAnyRole("ROLE_ADMIN", "ROLE_MAESTRO") && (
        <>
          {venta.estado === "EMITIDA" && (
            <Button
              variant="danger"
              onClick={() => onAnular(venta)}
              disabled={isAnulando}
            >
              {isAnulando ? "Anulando..." : "Anular"}
            </Button>
          )}
          {venta.estado === "ANULADA" && (
            <Button
              variant="warning"
              onClick={() => onRevertir(venta)}
              disabled={isRevirtiendo}
            >
              {isRevirtiendo ? "Revirtiendo..." : "Revertir"}
            </Button>
          )}
          <FaCloudDownloadAlt
            className="download-icon"
            onClick={() => onDownload(venta)}
            style={{
              cursor: 'pointer',
              fontSize: '1.5rem',
              marginRight: '10px',
            }}
          />
        </>
      )}
    </div>
  );
};

const ListVentas = () => {
  const queryClient = useQueryClient();
  const currentUser = getUser();

  // Obtener filtros guardados en localStorage o usar valores por defecto
  const getInitialState = () => {
    const savedState = localStorage.getItem('ventasFilters');
    return savedState ? JSON.parse(savedState) : {
      pageIndex: 0,
      pageSize: 10,
      searchTerm: "",
      filters: {
        estado: "",
        tipoBusqueda: "cliente"
      }
    };
  };

  // Estados para paginación, búsqueda y filtros
  const [state, setState] = useState(getInitialState);
  const { pageIndex, pageSize, searchTerm, filters } = state;

  // Estados para acciones
  const [isAnulando, setIsAnulando] = useState(false);
  const [isRevirtiendo, setIsRevirtiendo] = useState(false);

  // Estados para ordenamiento
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: 'asc'
  });

  // Guardar estado en localStorage cuando cambia
  useEffect(() => {
    localStorage.setItem('ventasFilters', JSON.stringify(state));
  }, [state]);

  // Obtener datos
  const {
    data: facturasData = {},
    isLoading,
    isError
  } = useFacturas(pageIndex, pageSize, searchTerm, filters);

  const facturas = facturasData.content || [];
  const totalPages = facturasData.totalPages || 0;
  const totalElements = facturasData.totalElements || 0;

  const hasAnyRole = (...roles) => roles.some((role) => currentUser?.roles.includes(role));

  // Opciones para el filtro de estados
  const estadoOptions = useMemo(() => [
    { value: "", label: "Todos los estados" },
    { value: "EMITIDA", label: "Emitidas" },
    { value: "COMPLETADO", label: "Completadas" },
    { value: "ANULADA", label: "Anuladas" },
    { value: "PENDIENTE", label: "Pendientes" }
  ], []);

  const handleDownload = async (factura) => {
    if (factura?.xmlContent) {
      const doc = await generatePDF(factura.xmlContent);
      doc.save(`${factura.cuf || 'recibo'}.pdf`);
    } else {
      toast.error("No hay contenido para descargar");
    }
  };

  const handleAnularFactura = async (venta) => {
    if (!venta.cuf) {
      toast.error("Solo se pueden anular facturas con CUF");
      return;
    }

    setIsAnulando(true);
    try {
      const requestData = {
        idPuntoVenta: venta.idPuntoVenta,
        cuf: venta.cuf,
        codigoMotivo: 1,
      };
      await anularFactura(requestData);
      toast.success("Factura anulada exitosamente");
      queryClient.invalidateQueries(['facturas']);
    } catch (error) {
      toast.error("Error al anular la factura");
      console.error("Error:", error);
    } finally {
      setIsAnulando(false);
    }
  };

  const handleRevertirFactura = async (venta) => {
    if (!venta.cuf) {
      toast.error("Solo se pueden revertir facturas con CUF");
      return;
    }

    setIsRevirtiendo(true);
    try {
      const requestData = {
        idPuntoVenta: venta.idPuntoVenta,
        cuf: venta.cuf,
      };
      await revertirAnulacionFactura(requestData);
      toast.success("Anulación revertida exitosamente");
      queryClient.invalidateQueries(['facturas']);
    } catch (error) {
      toast.error("Error al revertir la anulación");
      console.error("Error:", error);
    } finally {
      setIsRevirtiendo(false);
    }
  };

  const handleSearch = (term) => {
    setState(prev => ({
      ...prev,
      searchTerm: term,
      pageIndex: 0
    }));
  };

  const handleFilter = (newFilters) => {
    setState(prev => ({
      ...prev,
      filters: {
        ...prev.filters,
        ...newFilters
      },
      pageIndex: 0
    }));
  };

  // Manejador específico para el cambio de estado
  const handleEstadoChange = (selectedEstado) => {
    handleFilter({ estado: selectedEstado });
  };

  // Función para manejar el ordenamiento
  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Función para obtener los datos ordenados
  const getSortedData = (data) => {
    if (!sortConfig.key) return data;

    return [...data].sort((a, b) => {
      let aValue, bValue;

      switch (sortConfig.key) {
        case 'estado':
          aValue = a.estado || 'COMPLETADO';
          bValue = b.estado || 'COMPLETADO';
          break;
        case 'tipoComprobante':
          aValue = a.tipoComprobante || '';
          bValue = b.tipoComprobante || '';
          break;
        case 'cliente':
          aValue = a.nombreRazonSocial || 'S/N';
          bValue = b.nombreRazonSocial || 'S/N';
          break;
        default:
          return 0;
      }

      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  };

  const sortedFacturas = getSortedData(facturas);

  const handlePageChange = (newPage) => {
    setState(prev => ({
      ...prev,
      pageIndex: newPage - 1
    }));
  };

  const handleRowsPerPageChange = (newSize) => {
    setState(prev => ({
      ...prev,
      pageSize: newSize,
      pageIndex: 0
    }));
  };

  // Opciones para los filtros de búsqueda
  const filterOptions = useMemo(() => ({
    tipoBusqueda: [
      { value: "cliente", label: "Buscar por cliente" },
      { value: "usuario", label: "Buscar por usuario" },
      { value: "producto", label: "Buscar por producto" }
    ]
  }), []);

  const columns = useMemo(() => [
    {
      header: "ID Venta",
      accessor: "idVenta",
      width: "100px",
      show: true,
    },
    {
      header: "Punto de Venta",
      accessor: "nombrePuntoVenta",
      render: (venta) => venta.nombrePuntoVenta || "-",
      show: true
    },
    {
      header: "Sucursal",
      accessor: "nombreSucursal",
      render: (venta) => venta.nombreSucursal || "-",
      show: true
    },
    {
      header: "Cliente",
      accessor: "nombreRazonSocial",
      render: (venta) => venta.nombreRazonSocial || "S/N",
      show: true
    },
    {
      header: "Fecha",
      accessor: "fechaEmision",
      render: (venta) => {
        if (!venta.fechaEmision) return "-";
        const fecha = new Date(venta.fechaEmision);
        return fecha.toLocaleString('es-ES', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      },
      width: "160px"
    },
    {
      header: "Tipo",
      accessor: "tipoComprobante",
      render: (venta) => {
        const tipos = {
          "RECIBO": "Recibo",
          "FACTURA": "Factura"
        };
        return tipos[venta.tipoComprobante] || venta.tipoComprobante || "-";
      },
      width: "100px",
      show: true
    },
    {
      header: "Estado",
      accessor: "estado",
      render: (venta) => {
        const estado = venta.estado || "COMPLETADO";
        return (
          <span className={`estado-badge estado-${estado.toLowerCase()}`}>
            {estado}
          </span>
        );
      },
      width: "120px",
      show: true
    },
    {
      header: "Productos",
      accessor: "detalles",
      render: (venta) => (
        <div className="productos-list">
          {(venta.detalles || []).slice(0, 3).map((d, i) => (
            <div key={i}>
              {d.descripcion} ({d.cantidad || 1}x Bs {(d.subTotal || 0).toFixed(2)})
            </div>
          ))}
          {(venta.detalles || []).length > 3 && (
            <div className="more-items">+{(venta.detalles || []).length - 3} más</div>
          )}
        </div>
      ),
      show: true
    },
    {
      header: "Total (Bs)",
      accessor: "total",
      render: (venta) => (
        <strong>
          {(venta.detalles || []).reduce((sum, d) => sum + (d.subTotal || 0), 0).toFixed(2)}
        </strong>
      ),
      width: "120px",
      show: true
    },
    {
      header: "Usuario",
      accessor: "nombreUsuario",
      render: (venta) => venta.nombreUsuario || "-",
      show: true
    },
    {
      header: "Acciones",
      accessor: "acciones",
      width: "180px",
      render: (venta) => (
        <AccionesVenta
          venta={venta}
          onAnular={handleAnularFactura}
          onRevertir={handleRevertirFactura}
          onDownload={handleDownload}
          hasAnyRole={hasAnyRole}
          isAnulando={isAnulando}
          isRevirtiendo={isRevirtiendo}
        />
      ),
      show: true
    }
  ], [hasAnyRole, isAnulando, isRevirtiendo]);

  const {
  filteredColumns,
  ColumnVisibilityControl
} = useColumnVisibility(columns, "ventasHiddenColumns");


  if (isError) return <div className="error-message">Error al cargar las ventas</div>;

  return (
    <div className="user-management-container">
      <Toaster position="bottom-right" richColors />
      <div className="user-management-header">
        <h2>Gestión de Ventas</h2>
      </div>

      <div className="filtros-ventas-container">
        {/* Selector de estado */}
        <div className="filtro-estado">
          <label htmlFor="filtro-estado">Filtrar por estado:</label>
          <SelectSecondary
            id="filtro-estado"
            name="estado"  // Añade esto
            value={filters.estado || ""}
            onChange={(e) => handleEstadoChange(e.target.value)}
            className="select-estado"
          >
            {estadoOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </SelectSecondary>
        </div>

        {/* Componente de búsqueda */}
        <SearchAndFilters
          columns={columns}
          onSearch={handleSearch}
          onFilter={handleFilter}
          filterOptions={filterOptions}
          initialFilters={filters}
          searchPlaceholder={`Buscar por ${filterOptions.tipoBusqueda.find(t => t.value === filters.tipoBusqueda)?.label || 'cliente'}`}
        />

        {/* Filtros de ordenamiento */}
        <div className="sort-filters-container">
          <span className="sort-filters-label">Ordenar por:</span>
          <div className="sort-filters">
            <button
              className={`sort-filter-btn ${sortConfig.key === 'estado' ? 'active' : ''}`}
              onClick={() => handleSort('estado')}
            >
              Estado
              {sortConfig.key === 'estado' && (
                <span className="sort-arrow">
                  {sortConfig.direction === 'asc' ? '↑' : '↓'}
                </span>
              )}
            </button>
            <button
              className={`sort-filter-btn ${sortConfig.key === 'tipoComprobante' ? 'active' : ''}`}
              onClick={() => handleSort('tipoComprobante')}
            >
              Tipo de Factura
              {sortConfig.key === 'tipoComprobante' && (
                <span className="sort-arrow">
                  {sortConfig.direction === 'asc' ? '↑' : '↓'}
                </span>
              )}
            </button>
            <button
              className={`sort-filter-btn ${sortConfig.key === 'cliente' ? 'active' : ''}`}
              onClick={() => handleSort('cliente')}
            >
              Cliente
              {sortConfig.key === 'cliente' && (
                <span className="sort-arrow">
                  {sortConfig.direction === 'asc' ? '↑' : '↓'}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
  <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
          <ColumnVisibilityControl buttonLabel="Columnas" />
        </div>
      <Table
  columns={filteredColumns}  
  data={sortedFacturas}
  loading={isLoading}
  pagination={{
    currentPage: pageIndex + 1,
    totalPages,
    totalElements,
    rowsPerPage: pageSize
  }}
  onPageChange={handlePageChange}
  onRowsPerPageChange={handleRowsPerPageChange}
  showColumnVisibility={false}
  storageKey="ventasHiddenColumns"
/>
    </div>
  );
};

export default ListVentas;