import { useState, useEffect, useMemo, Suspense } from "react";
import Table from "../../components/table/Table";
import { getAllFacturas, anularFactura, revertirAnulacionFactura } from "../../service/api";
import { getUser } from "../../utils/authFunctions";
import { Toaster, toast } from "sonner";
import LinkButton from "../../components/buttons/LinkButton";
import "./ListVentas.css";
import { Button } from "../../components/buttons/Button";
import { FaCloudDownloadAlt } from "react-icons/fa";
import { generatePDF } from '../../utils/generatePDF';

const ListVentas = () => {
  const [facturas, setFacturas] = useState([]);
  const currentUser = useMemo(() => getUser(), []);

  useEffect(() => {
    const fetchFacturas = async () => {
      const response = await getAllFacturas();
      console.log(response.data);
      setFacturas(response.data);
    };
    fetchFacturas();
  }, []);

  const hasAnyRole = (...roles) => roles.some((role) => currentUser?.roles.includes(role));

  const handleDownload = async (factura) => {
    if (factura) {
        const doc = await generatePDF(factura.xmlContent);
        doc.save(`${factura.cuf}.pdf`);
    } else {
        console.error("Factura no disponible para descargar.");
    }
  };

  const handleAnularFactura = async (factura) => {
    try {
      const requestData = {
        idPuntoVenta: 2,
        cuf: factura.cuf,
        codigoMotivo: 1,
      };
      await anularFactura(requestData);
      toast.success("Factura anulada exitosamente");
      setFacturas((prevFacturas) =>
        prevFacturas.map((f) => f.id === factura.id ? { ...f, estado: "ANULADA" } : f)
      );
    } catch (error) {
      console.error("Error al anular factura:", error);
      toast.error("Error al anular la factura");
    }
  };

  const handleRevertirFactura = async (factura) => {
    try {
      const requestData = {
        idPuntoVenta: 2,
        cuf: factura.cuf,
      };
      await revertirAnulacionFactura(requestData);
      toast.success("Anulación revertida exitosamente");
      setFacturas((prevFacturas) =>
        prevFacturas.map((f) => f.id === factura.id ? { ...f, estado: "REVERTIDA" } : f)
      );
    } catch (error) {
      console.error("Error al revertir la anulación:", error);
      toast.error("Error al revertir la anulación");
    }
  };

  const columns = useMemo(
    () => [
      { header: "ID", accessor: "id" },
      { header: "Código Cliente", accessor: "codigoCliente" },
      { header: "Cliente", accessor: "nombreRazonSocial" },
      { header: "Fecha de Emisión", accessor: "fechaEmision" },
      {
        header: "Estado",
        accessor: "estado",
        render: (factura) => (
          <span className={`estado-badge estado-${factura.estado.toLowerCase()}`}>
            {factura.estado}
          </span>
        ),
      },
      {
        header: "Productos",
        accessor: "descripcion",
        render: (factura) => (factura.detalles || []).map((d) => d.descripcion).join(", "),
      },
      {
        header: "Total",
        accessor: "subTotal",
        render: (factura) =>
          (factura.detalles || []).reduce((sum, d) => sum + d.subTotal, 0).toFixed(2),
      },
      
      (hasAnyRole("ROLE_ADMIN", "ROLE_DEVELOPER")) && {
        header: "Acciones",
        render: (row) => (
          <div className="user-management-table-actions">
            {row.estado === "EMITIDA" && hasAnyRole("ROLE_ADMIN", "ROLE_MAESTRO") && (
              <Button
                variant="danger"
                onClick={() => handleAnularFactura(row)}
              >
                Anular
              </Button>
            )}
            {row.estado === "ANULADA" && hasAnyRole("ROLE_ADMIN", "ROLE_MAESTRO") && (
              <Button
                variant="warning"
                onClick={() => handleRevertirFactura(row)}
              >
                Revertir
              </Button>
            )}
            <FaCloudDownloadAlt 
              className="download-icon" 
              onClick={() => handleDownload(row)}
              style={{ 
                cursor: 'pointer', 
                fontSize: '1.5rem', 
                marginRight: '10px',
              }}
            />
          </div>
        ),
      },
    ].filter(Boolean),
    [facturas, currentUser]
  );

  return (
    <div className="user-management-container">
      <Toaster dir="auto" closeButton richColors visibleToasts={2} duration={2000} position="bottom-right" />
      <div className="user-management-header">
        <h2 className="user-management-title">Gestión de ventas</h2>
        {/* {hasAnyRole("ROLE_ADMIN", "ROLE_SECRETARIA") && ( */}
          <LinkButton to={`/facturacion`}>Vender nuevo producto</LinkButton>
        {/* )} */}
      </div>
      <Table columns={columns} data={facturas} className="user-management-table" />

      {/* <Suspense fallback={<div>Cargando modal...</div>}>
        <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)}>
          <h2>Confirmar {actionType === "anular" ? "Anulación" : "Reversión"}</h2>
          <p>¿Estás seguro de que deseas {actionType === "anular" ? "anular" : "revertir"} esta factura?</p>
          <div className="user-management-table-actions">
            <Button className="btn-edit" variant={actionType === "anular" ? "danger" : "warning"} onClick={confirmAction}>
              Confirmar
            </Button>
            <Button className="btn-cancel" variant="secondary" onClick={() => setModalOpen(false)}>
              Cancelar
            </Button>
          </div>
        </Modal>
      </Suspense> */}
    </div>
  );
};

export default ListVentas;