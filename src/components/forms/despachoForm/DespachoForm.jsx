import React, { useState, useEffect, useCallback } from "react";
import { Formik, Form, Field, FieldArray } from "formik";
import * as Yup from "yup";
import { useNavigate } from "react-router-dom";
import InputText from "../../inputs/InputText";
import "./DespachoForm.css";
import { getSucursales, createDespacho, fetchPuntoDeVentaPorIdSucursal } from "../../../service/api";
import { toast } from "sonner";
import Swal from "sweetalert2";
import ElementProduct from "./ElementProduct";
import { Button } from "../../buttons/Button";
import BackButton from "../../buttons/BackButton";

const alerta = (titulo, mensaje, tipo = "success") => {
  Swal.fire({
    title: titulo,
    text: mensaje,
    icon: tipo,
    timer: 2500,
    showConfirmButton: false,
  });
};

export default function DespachoForm() {
  const [sucursales, setSucursales] = useState([]);
  const [puntosVenta, setPuntosVenta] = useState({});
  const [puntoVentaId, setPuntoVentaId] = useState(null);
  const navigate = useNavigate();

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

  const obtenerPuntoDeVenta = useCallback(async (sucursalId) => {
    if (!sucursalId) {
      setPuntoVentaId(null);
      return null;
    }
    
    if (puntosVenta[sucursalId]) {
      setPuntoVentaId(puntosVenta[sucursalId].id);
      return puntosVenta[sucursalId];
    }
    
    try {
      const response = await fetchPuntoDeVentaPorIdSucursal(sucursalId);
      if (response.data && response.data.length > 0) {
        const puntoVenta = response.data[0];
        setPuntosVenta(prev => ({ ...prev, [sucursalId]: puntoVenta }));
        setPuntoVentaId(puntoVenta.id);
        return puntoVenta;
      }
      setPuntoVentaId(null);
      return null;
    } catch (error) {
      console.error("Error fetching punto de venta:", error);
      setPuntoVentaId(null);
      return null;
    }
  }, [puntosVenta]);

  const validationSchema = Yup.object().shape({
    origin: Yup.string().required("Debe seleccionar un origen"),
    destination: Yup.string()
      .required("Debe seleccionar un destino")
      .notOneOf([Yup.ref("origin")], "El origen y destino no pueden ser iguales"),
    transportId: Yup.string().required("Ingrese el transporte"),
    numberPhone: Yup.number()
      .typeError("Debe ser un número")
      .required("Ingrese el número de contacto"),
    comment: Yup.string().nullable(),
  });

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    if (values.items.length === 0) {
      toast.error("Debe agregar al menos un producto en el despacho");
      setSubmitting(false);
      return;
    }

    const itemsInvalidos = values.items.some(item => !item.productoId || !item.cantidad || item.cantidad <= 0);
    if (itemsInvalidos) {
      toast.error("Todos los productos deben estar completamente seleccionados con cantidades válidas");
      setSubmitting(false);
      return;
    }

    try {
      const despachoData = {
        sucursalOrigen: { id: parseInt(values.origin) },
        sucursalDestino: { id: parseInt(values.destination) },
        transporte: values.transportId,
        numeroContacto: parseInt(values.numberPhone),
        observaciones: values.comment,
        despachoItems: values.items.map(item => ({
          item: { id: parseInt(item.productoId) },
          cantidad: parseInt(item.cantidad),
        })),
      };

      await createDespacho(despachoData);

      toast.success("Despacho creado con éxito!");
      alerta("Despacho realizado", "Con éxito!");
      navigate("/despachos");
    } catch (error) {
      console.error("Error al enviar despacho:", error);
      alerta("Error al crear despacho", error.message, "error");
    }

    setSubmitting(false);
  };

  const handleOriginChange = async (e, formik) => {
    formik.handleChange(e);
    const sucursalId = e.target.value;
    await obtenerPuntoDeVenta(sucursalId);
  };

  return (
    <div className="despachos-contenedor">
      <BackButton to="/despachos" />
      <h1>Datos del despacho:</h1>

      <Formik
        initialValues={{
          origin: "",
          destination: "",
          date: new Date().toISOString().split("T")[0],
          transportId: "",
          numberPhone: "",
          comment: "",
          items: [{ productoId: "", cantidad: 1 }]
        }}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {(formik) => (
          <Form style={{ width: "80%", margin: "0 auto" }}>
            <div className="form-group">
              <div>
                <label htmlFor="origin">Origen:</label>
                <Field
                  as="select"
                  name="origin"
                  className="despacho-input"
                  onChange={(e) => handleOriginChange(e, formik)}
                >
                  <option value="" disabled>Seleccione un origen</option>
                  {sucursales.map((sucursal) => (
                    <option key={sucursal.id} value={sucursal.id}>
                      {sucursal.nombre}
                    </option>
                  ))}
                </Field>
                {formik.errors.origin && formik.touched.origin && (
                  <p className="error-message">{formik.errors.origin}</p>
                )}
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
                {formik.errors.destination && formik.touched.destination && (
                  <p className="error-message">{formik.errors.destination}</p>
                )}
              </div>
            </div>

            <InputText label="Transporte:" name="transportId" type="text" />

            <div className="form-group">
              <InputText
                label="Número de contacto del transporte:"
                name="numberPhone"
                type="text"
                placeholder="Ej. 123456789"
              />
              <InputText
                label="Comentarios:"
                name="comment"
                type="text"
                placeholder="Opcional"
              />
            </div>

            <div className="despacho-productos">
              <h3>Productos a enviar:</h3>
              <FieldArray name="items">
                {({ push, remove }) => (
                  <>
                    {formik.values.items.map((item, index) => (
                      <ElementProduct
                        key={index}
                        index={index}
                        item={item}
                        onUpdate={(index, productoId, cantidad) => {
                          const newItems = [...formik.values.items];
                          
                          if (productoId !== null) {
                            newItems[index].productoId = productoId;
                          }
                          
                          if (cantidad !== null) {
                            newItems[index].cantidad = cantidad;
                          }
                          
                          formik.setFieldValue("items", newItems);
                        }}
                        onRemove={remove}
                        isDefault={false}
                        puntoVentaId={puntoVentaId}
                      />
                    ))}
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => push({ productoId: "", cantidad: 1 })}
                      disabled={!puntoVentaId}
                    >
                      + Añadir ítem
                    </Button>
                  </>
                )}
              </FieldArray>
            </div>

            <div>
              <Button
                type="submit"
                variant="primary"
                className="btn-general"
                disabled={formik.isSubmitting || !formik.isValid}
              >
                {formik.isSubmitting ? "Enviando..." : "Enviar"}
              </Button>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
}