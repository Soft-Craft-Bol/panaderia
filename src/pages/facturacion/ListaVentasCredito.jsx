import { useEffect, useState, useMemo } from "react";
import { Toaster, toast } from "sonner";
import { FaCreditCard } from "react-icons/fa";
import { listarVentasCreditoPendientes } from "../../service/api";
import Table from "../../components/table/Table";
import { Button } from "../../components/buttons/Button";
import "./ListVentasCreditoPendientes.css";
import AbonarVenta from "../credito/AbonarVenta";
import Modal from "../../components/modal/Modal";
import { useVentasCreditoPendientes } from "../../hooks/useVentasCreditoPendientes";

const ListVentasCreditoPendientes = () => {
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [ventaSeleccionada, setVentaSeleccionada] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);    
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const { data, isLoading } = useVentasCreditoPendientes(currentPage, rowsPerPage);

  const ventas = data?.content ?? [];
  const totalPages = data?.totalPages ?? 0;
  const totalItems = data?.totalElements ?? 0;

  // Definir columnas de la tabla
  const columns = useMemo(() => [
    {
      header: "Venta ID",
      accessor: "ventaId",
      width: "80px",
    },
    {
      header: "Cliente",
      accessor: "clienteNombre",
    },
    {
      header: "Monto Total (Bs)",
      accessor: "montoTotal",
      render: (venta) => venta.montoTotal?.toFixed(2) || "0.00",
      width: "120px",
    },
    {
      header: "Saldo Pendiente (Bs)",
      accessor: "saldoPendiente",
      render: (venta) => (
        <strong className={venta.saldoPendiente > 0 ? "saldo-pendiente" : "saldo-pagado"}>
          {venta.saldoPendiente?.toFixed(2) || "0.00"}
        </strong>
      ),
      width: "140px",
    },
    {
      header: "Fecha Emisión",
      accessor: "fechaEmision",
      render: (venta) => new Date(venta.fechaEmision).toLocaleString("es-ES"),
      width: "160px",
    },
    {
      header: "Fecha Vencimiento",
      accessor: "fechaVencimiento",
      render: (venta) => new Date(venta.fechaVencimiento).toLocaleDateString("es-ES"),
      width: "140px",
    },
    {
      header: "Días Crédito",
      accessor: "diasCredito",
      render: (venta) => `${venta.diasCredito || 0} días`,
      width: "100px",
    },
    {
      header: "Acción",
      accessor: "accion",
      width: "120px",
      render: (venta) => (
        <Button
          variant="primary"
          onClick={() => handleAbonar(venta)}
        >
          Abonar
        </Button>
      ),
    },
  ], []);

  const handleAbonar = (venta) => {
    setVentaSeleccionada(venta);
    setShowModal(true);
  };

  return (
    <div className="ventas-credito-container">
      <Toaster position="top-right" richColors />
      <div className="ventas-credito-header">
        <h2>
          <FaCreditCard style={{ marginRight: "10px" }} />
          Ventas a Crédito Pendientes
        </h2>
      </div>

      <Table
        columns={columns}
        data={ventas}
        loading={isLoading}
        pagination={{
          currentPage,
          totalPages,
          totalElements: totalItems,
          rowsPerPage,
        }}
        onPageChange={setCurrentPage}
        onRowsPerPageChange={(value) => {
          setRowsPerPage(value);
          setCurrentPage(1);
        }}
      />

      {showModal && (
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={`Registrar Abono - Venta #${ventaSeleccionada?.ventaId}`}
        size="md"
      >
        <AbonarVenta
          venta={ventaSeleccionada}
          onClose={() => setShowModal(false)}
          onSuccess={() => {
            setLoading(true);
            listarVentasCreditoPendientes().then(({ data }) => {
              setVentas(data.content || []);
              setLoading(false);
            });
          }}
        />
      </Modal>
    )}
    </div>
  );
};

export default ListVentasCreditoPendientes;
