import { useState, useEffect, useMemo, Suspense } from "react";
import Table from "../../components/table/Table";
import { getAllFacturas, anularFactura, revertirAnulacionFactura } from "../../service/api";
import { getUser } from "../../utils/authFunctions";
import { Toaster, toast } from "sonner";
import LinkButton from "../../components/buttons/LinkButton";
import Modal from "../../components/modal/Modal";
import "./ListVentas.css";
import { Button } from "../../components/buttons/Button";

const ListVentas = () => {
  const [facturas, setFacturas] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedFactura, setSelectedFactura] = useState(null);
  const [actionType, setActionType] = useState(null);
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

  const handleAnularClick = (factura) => {
    setSelectedFactura(factura);
    setActionType("anular");
    setModalOpen(true);
  };

  const handleRevertirClick = (factura) => {
    setSelectedFactura(factura);
    setActionType("revertir");
    setModalOpen(true);
  };

  const confirmAction = async () => {
    if (!selectedFactura) return;

    try {
      if (actionType === "anular") {
        const requestData = {
          idPuntoVenta: 1,
          cuf: selectedFactura.cuf,
          codigoMotivo: 1,
        };
        await anularFactura(requestData);
        toast.success("Factura anulada exitosamente");
      } else if (actionType === "revertir") {
        const requestData = {
          idPuntoVenta: 1,
          cuf: selectedFactura.cuf,
        };
        await revertirAnulacionFactura(requestData);
        toast.success("Anulación revertida exitosamente");
      }

      // Actualizar el estado de la factura en la lista
      setFacturas((prevFacturas) =>
        prevFacturas.map((f) =>
          f.id === selectedFactura.id
            ? {
                ...f,
                estado: actionType === "anular" ? "ANULADA" : "REVERTIDA",
              }
            : f
        )
      );
    } catch (error) {
      console.error(`Error al ${actionType} factura:`, error);
      toast.error(`Error al ${actionType} la factura`);
    }

    setModalOpen(false);
    setSelectedFactura(null);
    setActionType(null);
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
        render: (factura) => (factura.detalleList || []).map((d) => d.descripcion).join(", "),
      },
      {
        header: "Total",
        accessor: "subTotal",
        render: (factura) =>
          (factura.detalleList || []).reduce((sum, d) => sum + d.subTotal, 0).toFixed(2),
      },
      (hasAnyRole("ROLE_ADMIN", "ROLE_DEVELOPER")) && {
        header: "Acciones",
        render: (row) => (
          <div className="user-management-table-actions">
            {row.estado === "EMITIDA" && hasAnyRole("ROLE_ADMIN", "ROLE_MAESTRO") && (
              <Button
                variant="danger"
                onClick={() => handleAnularClick(row)}
              >
                Anular
              </Button>
            )}
            {row.estado === "ANULADA" && hasAnyRole("ROLE_ADMIN", "ROLE_MAESTRO") && (
              <Button
                variant="warning"
                onClick={() => handleRevertirClick(row)}
              >
                Revertir
              </Button>
            )}
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
        {hasAnyRole("ROLE_ADMIN", "ROLE_SECRETARIA") && (
          <LinkButton to={`/facturacion`}>Vender nuevo producto</LinkButton>
        )}
      </div>
      <Table columns={columns} data={facturas} className="user-management-table" />

      <Suspense fallback={<div>Cargando modal...</div>}>
        <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)}>
          <h2>Confirmar {actionType === "anular" ? "Anulación" : "Reversión"}</h2>
          <p>¿Estás seguro de que deseas {actionType === "anular" ? "anular" : "revertir"} esta factura?</p>
          <div className="user-management-table-actions">
            <Button variant={actionType === "anular" ? "danger" : "warning"} onClick={confirmAction}>
              Confirmar
            </Button>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>
              Cancelar
            </Button>
          </div>
        </Modal>
      </Suspense>
    </div>
  );
};

export default ListVentas;