import { useState, useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import Table, { useColumnVisibility } from "../../components/table/Table";
import { anularFactura, revertirAnulacionFactura } from "../../service/api";
import { getUser } from "../../utils/authFunctions";
import { Toaster, toast } from "sonner";
import { Button } from "../../components/buttons/Button";
import { FaCloudDownloadAlt } from "react-icons/fa";
import { generatePDF } from '../../utils/generatePDF';
import useFacturas from "../../hooks/useFacturas";
import "./ListVentas.css";
import ColumnVisibilityControl from "../../components/table/ColumnVisibilityControl";

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

  // Estados para paginación básica
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  // Estados para acciones
  const [isAnulando, setIsAnulando] = useState(false);
  const [isRevirtiendo, setIsRevirtiendo] = useState(false);

  // Obtener datos sin filtros
  const {
    data: facturasData = {},
    isLoading,
    isError
  } = useFacturas(pageIndex, pageSize);

  const facturas = facturasData.content || [];
  const totalPages = facturasData.totalPages || 0;
  const totalElements = facturasData.totalElements || 0;

  const hasAnyRole = (...roles) => roles.some((role) => currentUser?.roles.includes(role));

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

  const handlePageChange = (newPage) => {
    setPageIndex(newPage - 1);
  };

  const handleRowsPerPageChange = (newSize) => {
    setPageSize(newSize);
    setPageIndex(0);
  };

  const columns = useMemo(() => [
    {
      header: "ID Venta",
      accessor: "idVenta",
      width: "100px",
    },
    {
      header: "Punto de Venta",
      accessor: "nombrePuntoVenta",
      render: (venta) => venta.nombrePuntoVenta || "-",
    },
    {
      header: "Sucursal",
      accessor: "nombreSucursal",
      render: (venta) => venta.nombreSucursal || "-",
    },
    {
      header: "Cliente",
      accessor: "nombreRazonSocial",
      render: (venta) => venta.nombreRazonSocial || "S/N",
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
      width: "100px"
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
      width: "120px"
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
      )
    },
    {
      header: "Total (Bs)",
      accessor: "total",
      render: (venta) => (
        <strong>
          {(venta.detalles || []).reduce((sum, d) => sum + (d.subTotal || 0), 0).toFixed(2)}
        </strong>
      ),
      width: "120px"
    },
    {
      header: "Usuario",
      accessor: "nombreUsuario",
      render: (venta) => venta.nombreUsuario || "-",
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
      )
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

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
        <ColumnVisibilityControl buttonLabel="Columnas" />
      </div>
      <Table
        columns={filteredColumns} 
        data={facturas}
        loading={isLoading}
        pagination={{
          currentPage: pageIndex + 1,
          totalPages,
          totalElements,
          rowsPerPage: pageSize
        }}
        onPageChange={handlePageChange}
        onRowsPerPageChange={handleRowsPerPageChange}
      />
    </div>
  );
};

export default ListVentas;