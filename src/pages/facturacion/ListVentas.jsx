import { useState, useMemo } from "react";
import Table from "../../components/table/Table";
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



const AccionesVenta = ({ venta, onAnular, onRevertir, onDownload, hasAnyRole, isAnulando, isRevirtiendo }) => {
  const estado = venta.cuf ? venta.estado : venta.estado;

  return (
    <div className="user-management-table-actions">
      {venta.cuf && hasAnyRole("ROLE_ADMIN", "ROLE_MAESTRO") && (
        <>
          {estado === "EMITIDA" && (
            <Button
              variant="danger"
              onClick={() => onAnular(venta)}
              disabled={isAnulando}
            >
              {isAnulando ? "Anulando..." : "Anular"}
            </Button>
          )}
          {estado === "ANULADA" && (
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
  const { facturas, setFacturas, loading, error } = useFacturas();
  const currentUser = useMemo(() => getUser(), []);
  const [isAnulando, setIsAnulando] = useState(false);
  const [isRevirtiendo, setIsRevirtiendo] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({});

  const hasAnyRole = (...roles) => roles.some((role) => currentUser?.roles.includes(role));

  const handleDownload = async (factura) => {
    if (factura) {
      const doc = await generatePDF(factura.xmlContent);
      doc.save(`${factura.cuf}.pdf`);
    } else {
      console.error("Factura no disponible para descargar.");
    }
  };

  const handleAnularFactura = async (venta) => {
    setIsAnulando(true);
    try {
      const requestData = {
        idPuntoVenta: 2,
        cuf: venta.cuf,
        codigoMotivo: 1,
      };
      const response = await anularFactura(requestData);
      toast.success("Factura anulada exitosamente");

      setFacturas((prevFacturas) => {
        const updatedFacturas = prevFacturas.map((f) =>
          f.idVenta === venta.idVenta ? { ...f, estado: "ANULADA" } : f
        );
        return updatedFacturas;
      });
    } catch (error) {
      toast.error("Error al anular la factura");
    } finally {
      setIsAnulando(false);
    }
  };

  const handleRevertirFactura = async (venta) => {
    setIsRevirtiendo(true);
    try {
      const requestData = {
        idPuntoVenta: 2,
        cuf: venta.cuf,
      };
      const response = await revertirAnulacionFactura(requestData);
      toast.success("Anulación revertida exitosamente");

      setFacturas((prevFacturas) => {
        const updatedFacturas = prevFacturas.map((f) =>
          f.idVenta === venta.idVenta ? { ...f, estado: "REVERTIDA" } : f
        );
        return updatedFacturas;
      });
    } catch (error) {
      toast.error("Error al revertir la anulación");
    } finally {
      setIsRevirtiendo(false);
    }
  };
  const filteredData = useMemo(() => {
    return facturas.filter((venta) => {
      const matchesSearch = Object.values(venta).some((value) =>
        String(value).toLowerCase().includes(searchTerm.toLowerCase())
      );

      const matchesFilters = Object.keys(filters).every((key) => {
        if (!filters[key]) return true; 
        return String(venta[key]).toLowerCase().includes(filters[key].toLowerCase());
      });

      return matchesSearch && matchesFilters;
    });
  }, [facturas, searchTerm, filters]);

  const handleSearch = (term) => {
    setSearchTerm(term);
  };

  const handleFilter = (newFilters) => {
    setFilters(newFilters);
  };

  const columns = useMemo(() => [
    { header: "ID", accessor: "idVenta" },
    { header: "Código Cliente", accessor: "codigoCliente" },
    { header: "Cliente", accessor: "nombreRazonSocial" },
    {
      header: "Fecha de Emisión",
      accessor: "fechaEmision",
      render: (venta) => {
        const fecha = new Date(venta.fechaEmision);
        return new Intl.DateTimeFormat("es-ES", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        }).format(fecha)
          .replace(/(\d{2})\/(\d{2})\/(\d{4}), (\d{2}):(\d{2})/, "$3/$2/$1 $4:$5");
      },
    },
    {
      header: "Estado",
      accessor: "estado",
      render: (venta) => (
        <span className={`estado-badge estado-${venta.estado.toLowerCase()}`}>
          {venta.estado}
        </span>
      ),
      filterOptions: ["EMITIDA", "ANULADA", "REVERTIDA"], // Selector para esta columna
    },
    {
      header: "Productos",
      accessor: "detalles",
      render: (venta) => (venta.detalles || []).map((d) => d.descripcion).join(", "),
    },
    {
      header: "Total",
      accessor: "detalles",
      render: (venta) =>
        (venta.detalles || []).reduce((sum, d) => sum + d.subTotal, 0).toFixed(2),
    },
    {
      header: "Acciones",
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
    },
  ], [handleAnularFactura, handleRevertirFactura, handleDownload, hasAnyRole, isAnulando, isRevirtiendo]);


  if (loading) return <div>Cargando...</div>;
  if (error) return <div>Error al cargar las facturas</div>;

  return (
    <div className="user-management-container">
      <Toaster dir="auto" closeButton richColors visibleToasts={2} duration={2000} position="bottom-right" />
      <div className="user-management-header">
        <h2 className="user-management-title">Gestión de ventas</h2>
        <LinkButton to={`/facturacion`}>Vender nuevo producto</LinkButton>
      </div>
      <SearchAndFilters
        columns={columns}
        onSearch={handleSearch}
        onFilter={handleFilter}
      />
      <Table columns={columns} data={filteredData} className="user-management-table" />
    </div>
  );
};

export default ListVentas;