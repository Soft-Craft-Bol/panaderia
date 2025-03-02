import React, { useState, useEffect } from "react";
import Table from "../../components/table/Table";
import { getReservas, updateReserva } from "../../service/api";
import { Toaster, toast } from "sonner";
import Modal from "../../components/modal/Modal"; // Importar el modal
import "./ReservasTable.css"; // Estilos personalizados

const ReservasTable = () => {
  const [reservas, setReservas] = useState([]);
  const [selectedReserva, setSelectedReserva] = useState(null); // Reserva seleccionada para el modal
  const [showModal, setShowModal] = useState(false); // Controlar la visibilidad del modal

  useEffect(() => {
    fetchReservas();
  }, []);

  const fetchReservas = async () => {
    try {
      const response = await getReservas();
      console.log("Reservas:", response.data);
      setReservas(response.data);
    } catch (error) {
      console.error("Error al obtener las reservas:", error);
      toast.error("Error al obtener las reservas");
    }
  };

  const handleVerificarReserva = async (id) => {
    try {
      await updateReserva(id);
      toast.success("Reserva verificada exitosamente");
      fetchReservas();
    } catch (error) {
      console.error("Error al verificar la reserva:", error);
      toast.error("Error al verificar la reserva");
    }
  };

  const handleShowComprobante = (reserva) => {
    setSelectedReserva(reserva);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedReserva(null);
  };

  const columns = [
    { header: "ID", accessor: "id" },
    { header: "Fecha de Reserva", accessor: "fechaReserva" },
    {
      header: "Estado",
      accessor: "estado",
      render: (row) => (
        <span style={{ color: row.estado === "Pendiente" ? "red" : "green" }}>
          {row.estado}
        </span>
      ),
    },
    { header: "Método de Pago", accessor: "metodoPago" },
    {
      header: "Comprobante",
      accessor: "comprobante",
      render: (row) => (
        <button
          className="comprobante-button"
          onClick={() => handleShowComprobante(row)}
        >
          Ver Comprobante
        </button>
      ),
    },
    {
      header: "Acciones",
      accessor: "actions",
      render: (row) => (
        <button
          className="verificar-button"
          onClick={() => handleVerificarReserva(row.id)}
          disabled={row.estado !== "Pendiente"}
        >
          Verificar
        </button>
      ),
    },
  ];

  return (
    <div className="reservas-container">
      <Toaster
        dir="auto"
        closeButton
        richColors
        visibleToasts={2}
        duration={2000}
        position="bottom-right"
      />
      <h2>Lista de Reservas</h2>
      <Table columns={columns} data={reservas} />

      {/* Modal para mostrar el comprobante y los productos */}
      {showModal && selectedReserva && (
        <Modal isOpen={showModal} onClose={handleCloseModal}>
          <h2>Detalles de la Reserva</h2>
          <div className="modal-content">
            <h3>Comprobante:</h3>
            <img
              src={selectedReserva.comprobante}
              alt="Comprobante"
              style={{ width: "100%", height: "auto",objectFit: "cover" }}
              className="comprobante-image"
            />

            <h3>Productos Reservados:</h3>
            <ul className="productos-list">
              {selectedReserva.items.map((item) => (
                <li key={item.idItem} className="producto-item">
                  <div className="producto-info">
                    <img
                      src={item.imagen || "https://res.cloudinary.com/dzizafv5s/image/upload/v1739134946/swwqwwjh2kxmd4dugnql.jpg"}
                      alt={item.descripcion}
                      style={{ width: "100px", height: "100px" }}
                      className="producto-image"
                    />
                    <div>
                      <p>
                        <strong>Descripción:</strong> {item.descripcion}
                      </p>
                      <p>
                        <strong>Cantidad:</strong> {item.cantidad}
                      </p>
                      <p>
                        <strong>Precio Unitario:</strong> Bs{" "}
                        {item.precioUnitario.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default ReservasTable;