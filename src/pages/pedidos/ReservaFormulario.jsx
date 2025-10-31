import React, { useState } from "react";
import { Formik, Form, useField } from "formik";
import axios from "axios";
import * as Yup from "yup";
import "./ReservaFormulario.css";
import { reservarProducto } from "../../service/api";
import qr from "../../assets/img/qr.jpg";
import { Button } from "../../components/buttons/Button";
import InputText from "../../components/inputs/InputText";
import SelectPrimary from "../../components/selected/SelectPrimary";
import TarjetaPagoForm from "../../components/tarjetaPago/TarjetaPagoForm";
import uploadImageToCloudinary from "../../utils/uploadImageToCloudinary ";
import { toast, Toaster } from "sonner";
import { useCarrito } from "../../context/CarritoContext";

const reservaSchema = Yup.object().shape({
  metodoPago: Yup.string()
    .required('Método de pago es requerido')
    .oneOf(
      ['EFECTIVO', 'QR', 'TARJETA', 'TRANSFERENCIA'],
      'Método de pago no válido'
    ),
  anticipo: Yup.number()
    .required('Anticipo es requerido')
    .min(0, 'El anticipo no puede ser negativo')
    .test(
      'max-anticipo',
      'El anticipo no puede ser mayor al total',
      function (value) {
        return value <= this.parent.totalCarrito;
      }
    )
    .typeError('Debe ser un número válido'),
  observaciones: Yup.string()
    .max(500, 'Máximo 500 caracteres'),
});


const ReservaFormulario = ({ carrito, onReservaExitosa }) => {
  const [paso, setPaso] = useState(1);
  const [comprobante, setComprobante] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const totalCarrito = carrito.reduce((acc, item) => {
    const precio = item.precioUnitario || 0;
    const cant = item.cantidad || 1;
    return acc + precio * cant;
  }, 0);

  const siguientePaso = () => setPaso(paso + 1);
  const anteriorPaso = () => setPaso(paso - 1);

  const { vaciarCarrito } = useCarrito();


  const handleSubmit = async (values) => {
    setIsLoading(true);

    try {
      let comprobanteUrl = "";

      if (["TRANSFERENCIA", "QR", "TARJETA"].includes(values.metodoPago) && comprobante) {
        comprobanteUrl = await uploadImageToCloudinary(comprobante);
      }

      const reservaRequest = {
        idPuntoVenta: 1,
        idCliente: 1,
        items: carrito.map((item) => ({
          idItem: item.id,
          cantidad: item.cantidad,
        })),
        anticipo: parseFloat(values.anticipo),
        saldoPendiente: totalCarrito - parseFloat(values.anticipo),
        metodoPago: values.metodoPago,
        comprobante: comprobanteUrl,
        observaciones: values.observaciones,
        // Agregar datos de tarjeta si es el caso
        ...(values.metodoPago === "TARJETA" && {
          tarjeta: {
            numero: values.numeroTarjeta,
            nombre: values.nombreTarjeta,
            expiracion: values.expiracionTarjeta,
            cvv: values.cvvTarjeta,
          },
        }),
      };

      const response = await reservarProducto(reservaRequest);
      onReservaExitosa(response.data);
      if (!response.data.stockSuficiente) {
        toast.warn("Reserva creada, pero con stock insuficiente en algunos productos. El cajero se pondrá en contacto.");
      } else {
        toast.success("Reserva creada exitosamente");
      }
      vaciarCarrito();
    } catch (error) {
      console.error("Error al crear la reserva:", error);
      toast.error("Hubo un error al crear la reserva. Inténtalo de nuevo.");
    } finally {
      setIsLoading(false);
    }
  };

  const puedeAvanzar = (values, errors) => {
    switch (paso) {
      case 1:
        return values.metodoPago && values.anticipo && !errors.metodoPago && !errors.anticipo;
      case 2:
        if (values.metodoPago === 'TARJETA') {
          return (
            values.numeroTarjeta &&
            values.nombreTarjeta &&
            values.expiracionTarjeta &&
            values.cvvTarjeta &&
            !errors.numeroTarjeta &&
            !errors.nombreTarjeta &&
            !errors.expiracionTarjeta &&
            !errors.cvvTarjeta
          );
        } else if (['TRANSFERENCIA', 'QR'].includes(values.metodoPago)) {
          return comprobante !== null;
        }
        return true; // Para EFECTIVO
      default:
        return true;
    }
  };

  return (
    <>
      <Toaster richColors position="top-right" />
      <Formik
        initialValues={{
          metodoPago: '',
          anticipo: '',
          observaciones: '',
          numeroTarjeta: '',
          nombreTarjeta: '',
          expiracionTarjeta: '',
          cvvTarjeta: '',
          totalCarrito: totalCarrito, // Añade esto
        }}
        validationSchema={reservaSchema}
        onSubmit={handleSubmit}
      >
        {({
          values,
          errors,
          touched,
          setFieldValue,
          setFieldTouched, // Añade esto
          isValid
        }) => (
          <Form className="reserva-formulario">
            <h2>Reserva de Productos</h2>

            {/* Paso 1: Método de pago y anticipo */}
            {paso === 1 && (
              <div className="paso">
                <h3>Selecciona el método de pago</h3>
                <SelectPrimary
                  label="Método de Pago"
                  name="metodoPago"
                  value={values.metodoPago}
                  onChange={(e) => setFieldValue("metodoPago", e.target.value)}
                  required
                >
                  <option value="">Selecciona un método de pago</option>
                  <option value="EFECTIVO">Efectivo</option>
                  <option value="QR">Pago QR</option>
                  <option value="TARJETA">Tarjeta de Crédito/Débito</option>
                  <option value="TRANSFERENCIA">Transferencia Bancaria</option>
                </SelectPrimary>

                <h3>Ingresa el monto del anticipo</h3>
                <InputText
                  label="Anticipo"
                  name="anticipo"
                  type="number"
                  value={values.anticipo}
                  onChange={(e) => setFieldValue("anticipo", e.target.value)}
                  required
                />

                <p>
                  <strong>Total del carrito:</strong> Bs {totalCarrito.toFixed(2)}
                </p>
                <p>
                  <strong>Saldo pendiente:</strong> Bs{" "}
                  {(totalCarrito - parseFloat(values.anticipo || 0)).toFixed(2)}
                </p>

                <Button variant="primary" onClick={siguientePaso}>
                  Siguiente
                </Button>
              </div>
            )}

            {/* Paso 2: Detalles específicos del método de pago */}
            {paso === 2 && (
              <div className="paso">
                {values.metodoPago === 'QR' && (
                  <>
                    <h3>Escanea el código QR para pagar</h3>
                    <div className="qr-container">
                      <img src={qr} alt="Código QR de pago" />
                      <p>
                        <strong>Monto a pagar:</strong> Bs {values.anticipo}
                      </p>
                    </div>
                  </>
                )}

                {values.metodoPago === 'TARJETA' && (
                  <TarjetaPagoForm
                    values={values}
                    errors={errors}
                    touched={touched}
                    setFieldValue={setFieldValue}
                    setFieldTouched={setFieldTouched} // Asegúrate de pasar esta prop
                  />
                )}

                {['TRANSFERENCIA', 'QR'].includes(values.metodoPago) && (
                  <>
                    <h3>Sube tu comprobante de pago</h3>
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={(e) => setComprobante(e.target.files[0])}
                      required
                    />
                    {!comprobante && (
                      <p className="error-message">Debes subir un comprobante</p>
                    )}
                  </>
                )}

                <Button variant="secondary" onClick={anteriorPaso}>
                  Anterior
                </Button>
                <Button
                  variant="primary"
                  onClick={siguientePaso}
                  disabled={!puedeAvanzar(values, errors)}
                >
                  Siguiente
                </Button>
              </div>
            )}

            {/* Paso 3: Observaciones y confirmación */}
            {paso === 3 && (
              <div className="paso">
                <h3>Observaciones adicionales</h3>
                <InputText
                  label="Observaciones"
                  name="observaciones"
                  type="text"
                  as="textarea"
                  rows={4}
                  value={values.observaciones}
                  onChange={(e) => setFieldValue("observaciones", e.target.value)}
                />

                <Button variant="secondary" onClick={anteriorPaso}>
                  Anterior
                </Button>
                <Button
                  variant="primary"
                  type="submit"
                  disabled={isLoading || !isValid}
                >
                  {isLoading ? "Enviando..." : "Confirmar Reserva"}
                </Button>
              </div>
            )}
          </Form>
        )}
      </Formik>
    </>
  );
};

export default ReservaFormulario;