import React from "react";
import { Formik, Form } from "formik";
import { reservarProducto } from "../../service/api"; 
import "./PedidosForm.css"; 
import InputText from "../../components/inputs/InputText";

const FormularioReserva = ({ producto, onClose }) => {
  const initialValues = {
    idItem: producto.id,
    idPuntoVenta: 1, 
    idCliente: "",
    cantidad: "",
    anticipo: "",
    saldoPendiente: "",
    observaciones: "",
  };

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      const response = await reservarProducto(values);
      alert("Reserva realizada con éxito");
      onClose(); 
    } catch (error) {
      console.error("Error al reservar el producto:", error);
      alert("Hubo un error al realizar la reserva");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="formulario-reserva">
      <h2>Reservar {producto.descripcion}</h2>
      <Formik
        initialValues={initialValues}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting }) => (
          <Form>
            <InputText
              label="ID Cliente"
              name="idCliente"
              type="text"
              required
            />
            <InputText
              label="Cantidad"
              name="cantidad"
              type="number"
              required
            />
            <InputText
              label="Anticipo"
              name="anticipo"
              type="number"
              required
            />
            <InputText
              label="Saldo Pendiente"
              name="saldoPendiente"
              type="number"
              required
            />
            <InputText
              label="Observaciones"
              name="observaciones"
              type="text"
            />
            <div className="form-actions">
              <button type="submit" className="btn-reservar" disabled={isSubmitting}>
                {isSubmitting ? "Reservando..." : "Reservar"}
              </button>
              <button type="button" className="btn-cancelar" onClick={onClose}>
                Cancelar
              </button>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default FormularioReserva;