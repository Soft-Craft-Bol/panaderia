import React, { useState } from "react";
import { useCarrito } from "../../context/CarritoContext";
import "./CarritoLista.css";
import ReservaFormulario from "./ReservaFormulario";
import NavbarPublic from "../../components/sidebar/NavbarPublic";
import Footer from "../landingPage/Footer";
import Table from "../../components/table/Table";
import { Button } from "../../components/buttons/Button";
import Modal from "../../components/modal/Modal"; // 👉 importa el modal
import { toast, Toaster } from "sonner";

const CarritoLista = () => {
  const { carrito, eliminarDelCarrito, vaciarCarrito } = useCarrito();
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [metodoPago, setMetodoPago] = useState("qr");
  const [mensajeError, setMensajeError] = useState("");

  const { subTotal, totalDescuentos, total } = carrito.reduce(
    (acc, item) => {
      const precioOriginal = item.precioOriginal || item.precioUnitario;
      const precioFinal = item.precioUnitario;
      const cant = item.cantidad || 1;

      return {
        subTotal: acc.subTotal + precioOriginal * cant,
        totalDescuentos: acc.totalDescuentos + (precioOriginal - precioFinal) * cant,
        total: acc.total + precioFinal * cant,
      };
    },
    { subTotal: 0, totalDescuentos: 0, total: 0 }
  );

  const handlePagarClick = () => {
    if (metodoPago === "efectivo") {
      setMensajeError("Por el momento solo aceptamos pagos con QR.");
      return;
    }
    setMensajeError("");
    setMostrarFormulario(true);
  };

  const columns = [
    {
      header: "IMAGEN",
      accessor: "imagen",
      render: (item) =>
        item.imagen ? (
          <img
            src={item.imagen}
            alt={item.descripcion}
            style={{ width: "50px", height: "50px" }}
          />
        ) : (
          <p>Sin imagen</p>
        ),
    },
    { header: "NOMBRE PRODUCTO", accessor: "descripcion" },
    { header: "CANTIDAD", accessor: "cantidad" },
    {
      header: "PRECIO UNITARIO",
      accessor: "precioUnitario",
      render: (item) => `Bs ${item.precioUnitario.toFixed(2)}`,
    },
    {
      header: "DESCUENTO",
      accessor: "descuento",
      render: (item) => (item.descuento > 0 ? `${item.descuento}%` : "-"),
    },
    {
      header: "TOTAL",
      accessor: "total",
      render: (item) =>
        `Bs ${(item.precioUnitario * (item.cantidad || 1)).toFixed(2)}`,
    },
    {
      header: "ACCIÓN",
      accessor: "accion",
      render: (item) => (
        <Button
          variant="danger"
          onClick={() => eliminarDelCarrito(item.id)}
        >
          Eliminar
        </Button>
      ),
    },
  ];

  return (
    <div>
      <Toaster richColors position="top-right" />
      <NavbarPublic />
      <div className="carrito-contenedor">
        <h2 className="carrito-titulo">CARRO DE COMPRAS</h2>
        <Table
          columns={columns}
          data={carrito}
          showColumnVisibility={true}
          loading={false}
        />

        <div className="carrito-opciones">
          <div className="carrito-resumen">
            <p>
              <strong>Sub-Total:</strong> Bs {subTotal.toFixed(2)}
            </p>
            {totalDescuentos > 0 && (
              <p className="descuento-texto">
                <strong>Descuentos:</strong> -Bs {totalDescuentos.toFixed(2)}
              </p>
            )}
            <p>
              <strong>Total:</strong> Bs {total.toFixed(2)}
            </p>

            <Button
              variant="primary"
              onClick={handlePagarClick}
              disabled={carrito.length === 0}
            >
              PAGAR
            </Button>
          </div>
        </div>

        {/* 👉 Modal con formulario */}
        <Modal
          isOpen={mostrarFormulario}
          onClose={() => setMostrarFormulario(false)}
          closeOnOverlayClick={false}
          title="Reserva de Productos"
          size="lg"
        >
          <ReservaFormulario
            carrito={carrito}
            total={total}
            metodoPago={metodoPago}
            onReservaExitosa={() => {
              setMostrarFormulario(false);
              vaciarCarrito(); // Vacía el carrito
              toast.success("Reserva creada exitosamente");
            }}
          />
        </Modal>
      </div>
      <Footer />
    </div>
  );
};

export default CarritoLista;
