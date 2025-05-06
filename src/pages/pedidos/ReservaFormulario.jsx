import React, { useState } from "react";
import { Formik, Form, useField } from "formik";
import axios from "axios";
import * as Yup from "yup";
import "./ReservaFormulario.css";
import { reservarProducto } from "../../service/api";
import { generarQR } from "../../service/qrService"; // Importa la función para generar QR
import { Button } from "../../components/buttons/Button";
import InputText from "../../components/inputs/InputText";
import SelectPrimary from "../../components/selected/SelectPrimary";
import { reservaSchema } from "../../schemas/reservaSchema";
import uploadImageToCloudinary from "../../utils/uploadImageToCloudinary ";
import loadImage from "../../assets/ImagesApp";

const ReservaFormulario = ({ carrito, onReservaExitosa }) => {
  const [paso, setPaso] = useState(1);
  const [comprobante, setComprobante] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [qrImage, setQrImage] = useState(null); // Estado para almacenar la imagen del QR

  const totalCarrito = carrito.reduce((acc, item) => {
    const precio = item.precioUnitario || 0;
    const cant = item.cantidad || 1;
    return acc + precio * cant;
  }, 0);

  const siguientePaso = () => setPaso(paso + 1);
  const anteriorPaso = () => setPaso(paso - 1);

  // Función para generar el QR
  const handleGenerarQR = async (monto) => {
    try {
      const qrData = await generarQR(
        "BOB", // Moneda
        `Reserva ${new Date().toISOString()}`, // Descripción (gloss)
        monto, // Monto
        "2023-12-31", // Fecha de expiración (puedes calcularla dinámicamente)
        true // Uso único
      );

      // Suponiendo que la API devuelve la imagen del QR en base64
      setQrImage(`data:image/png;base64,${qrData.image}`);
    } catch (error) {
      console.error("Error al generar el QR:", error);
      // Si falla, carga una imagen de QR estática
      const qrStaticImage = await loadImage("qr");
      setQrImage(qrStaticImage.default);
    };
  };

  const handleSubmit = async (values) => {
    setIsLoading(true);

    try {
      let comprobanteUrl = "";
      if (values.metodoPago === "TRANSFERENCIA" || values.metodoPago === "QR") {
        if (!comprobante) {
          alert("Debes subir un comprobante para este método de pago.");
          return;
        }
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
      };

      const response = await reservarProducto(reservaRequest);
      onReservaExitosa(response.data);
      alert("Reserva creada exitosamente");
    } catch (error) {
      console.error("Error al crear la reserva:", error);
      alert("Hubo un error al crear la reserva. Inténtalo de nuevo.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Formik
      initialValues={{
        metodoPago: "",
        anticipo: "",
        observaciones: "",
      }}
      validationSchema={reservaSchema}
      onSubmit={handleSubmit}
    >
      {({ values, setFieldValue, isValid }) => (
        <Form className="reserva-formulario">
          <h2>Reserva de Productos</h2>

          {paso === 1 && (
            <div className="paso">
              <h3>Selecciona el método de pago</h3>
              <SelectPrimary
                label="Método de Pago"
                name="metodoPago"
                value={values.metodoPago}
                onChange={(e) => {
                  setFieldValue("metodoPago", e.target.value);
                  if (e.target.value === "QR") {
                    handleGenerarQR(values.anticipo); // Generar QR al seleccionar el método
                  }
                }}
                required
              >
                <option value="">Selecciona un método de pago</option>
                <option value="TARJETA">Tarjeta de Crédito/Débito</option>
                <option value="TRANSFERENCIA">Transferencia Bancaria</option>
                <option value="QR">Pago QR</option>
                <option value="Efectivo">Efectivo</option>
              </SelectPrimary>

              <h3>Ingresa el monto del anticipo</h3>
              <InputText
                label="Anticipo"
                name="anticipo"
                type="number"
                value={values.anticipo}
                onChange={(e) => {
                  setFieldValue("anticipo", e.target.value);
                  if (values.metodoPago === "QR") {
                    handleGenerarQR(e.target.value); // Actualizar QR al cambiar el monto
                  }
                }}
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

          {paso === 2 && values.metodoPago === "TRANSFERENCIA"  && (
            <div className="paso">
              <h3>Sube tu comprobante de pago</h3>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setComprobante(e.target.files[0])}
                required
              />
              <Button variant="secondary" onClick={anteriorPaso}>
                Anterior
              </Button>
              <Button variant="primary" onClick={siguientePaso}>
                Siguiente
              </Button>
            </div>
          )}

          {paso === 2 && values.metodoPago === "QR" && (
            <div className="paso">
              <h3>Escanea el código QR para pagar</h3>
              <div className="qr-container">
                {qrImage ? (
                  typeof qrImage === "string" ? ( 
                    <img src={qrImage} alt="Código QR de pago" />
                  ) : ( 
                    <img className=".qr-container" src={qrImage} alt="Código QR de pago"
                     />
                  )
                ) : (
                  <p>Generando código QR...</p>
                )}
                <p>
                  <strong>Monto a pagar:</strong> Bs {values.anticipo}
                </p>
              </div>
              <Button variant="secondary" onClick={anteriorPaso}>
                Anterior
              </Button>
              <Button variant="primary" onClick={siguientePaso}>
                Siguiente
              </Button>
            </div>
          )}

          {paso === 3 && values.metodoPago === "QR"  && (
            <div className="paso">
              <h3>Sube tu comprobante de pago</h3>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setComprobante(e.target.files[0])}
                required
              />
              <Button variant="secondary" onClick={anteriorPaso}>
                Anterior
              </Button>
              <Button variant="primary" onClick={siguientePaso}>
                Siguiente
              </Button>
            </div>
          )}

          {paso === 4 && (
            <div className="paso">
              <h3>Confirma tu reserva</h3>
              <InputText
                label="Observaciones"
                name="observaciones"
                type="text"
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
  );
};

export default ReservaFormulario;