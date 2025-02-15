import React, { useState, useEffect } from "react";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import InputText from "../../inputs/InputText";
import "./DespachoForm.css";
import { fetchItems, getSucursales, createDespacho } from "../../../service/api";

export default function DespachoForm() {
  const [sucursales, setSucursales] = useState([]);
  const [mensaje, setMensaje] = useState(null); // Para mensajes de éxito/error

  useEffect(() => {
    const fetchSucursales = async () => {
      try {
        const response = await getSucursales();
        setSucursales(response.data);
      } catch (error) {
        console.error("Error fetching sucursales:", error);
      }
    };
    fetchSucursales();
  }, []);

  // Esquema de validación con Yup
  const validationSchema = Yup.object().shape({
    origin: Yup.string().required("Debe seleccionar un origen"),
    destination: Yup.string().required("Debe seleccionar un destino"),
    transportId: Yup.string().required("Ingrese el transporte"),
    numberPhone: Yup.number()
      .typeError("Debe ser un número")
      .required("Ingrese el número de contacto"),
    comment: Yup.string().nullable(), // Puede estar vacío
  });

  return (
    <div className="despachos-contenedor">
      <h1>Datos del despacho:</h1>
      
      {mensaje && <p className={mensaje.tipo}>{mensaje.texto}</p>} {/* Mensajes de éxito/error */}

      <Formik
        initialValues={{
          origin: "",
          destination: "",
          date: new Date().toISOString().split("T")[0],
          transportId: "",
          numberPhone: "",
          comment: "",
        }}
        validationSchema={validationSchema}
        onSubmit={async (values, { setSubmitting, resetForm }) => {
          try {
            const despachoData = {
              sucursalOrigen: { id: parseInt(values.origin) },
              destino: { id: parseInt(values.destination) },
              transporte: values.transportId,
              numeroContacto: parseInt(values.numberPhone),
              observaciones: values.comment,
            };

            await createDespacho(despachoData);

            setMensaje({ texto: "Despacho creado con éxito!", tipo: "success" });
            resetForm();
          } catch (error) {
            console.error("Error al enviar despacho:", error);
            setMensaje({ texto: "Error al crear el despacho", tipo: "error" });
          }
          setSubmitting(false);
        }}
      >
        {({ errors, touched }) => (
          <Form style={{ width: "80%" }}>
            <div className="form-group">
              <div>
                <label htmlFor="origin">Origen:</label>
                <Field as="select" name="origin" className="despacho-input">
                  <option value="" disabled>Seleccione un origen</option>
                  {sucursales.map((sucursal) => (
                    <option key={sucursal.id} value={sucursal.id}>
                      {sucursal.nombre}
                    </option>
                  ))}
                </Field>
                {errors.origin && touched.origin && <p className="error">{errors.origin}</p>}
              </div>

              <div>
                <label htmlFor="destination">Destino:</label>
                <Field as="select" name="destination" className="despacho-input">
                  <option value="" disabled>Seleccione un destino</option>
                  {sucursales.map((sucursal) => (
                    <option key={sucursal.id} value={sucursal.id}>
                      {sucursal.nombre}
                    </option>
                  ))}
                </Field>
                {errors.destination && touched.destination && <p className="error">{errors.destination}</p>}
              </div>
            </div>

            <InputText label="Fecha actual:" name="date" type="text" readOnly />
            <InputText label="Transporte usado:" name="transportId" type="text" />
            {errors.transportId && touched.transportId && <p className="error">{errors.transportId}</p>}

            <div className="form-group">
              <InputText label="Número de emergencia:" name="numberPhone" type="text" placeholder="Ej. 123456789" />
              {errors.numberPhone && touched.numberPhone && <p className="error">{errors.numberPhone}</p>}
              
              <InputText label="Comentario:" name="comment" type="text" placeholder="Opcional" />
            </div>

            <div>
              <button type="submit" className="btn-general">Enviar</button>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
}
