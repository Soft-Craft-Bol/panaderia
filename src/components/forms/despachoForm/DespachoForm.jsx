import React, { useState, useEffect } from "react";
import { Formik, Form, Field, FieldArray } from "formik";
import * as Yup from "yup";
import { useNavigate } from "react-router-dom";
import InputText from "../../inputs/InputText";
import "./DespachoForm.css";
import { getSucursales, createDespacho } from "../../../service/api";
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
  const [productosList, setProductosList] = useState([]);
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

    const itemsInvalidos = values.items.some(item => !item.productoId || !item.cantidad);
    if (itemsInvalidos) {
      toast.error("Todos los productos deben estar completamente seleccionados");
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
      resetForm();
      setProductosList([]);
    } catch (error) {
      console.error("Error al enviar despacho:", error);
      alerta("Error al crear despacho", error.message, "error");
    }

    setSubmitting(false);
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
        {(formik) => {
          const handleUpdateProduct = (index, productoId, cantidad, productoCompleto = null) => {
            const newItems = [...formik.values.items];

            if (productoId) {
              newItems[index].productoId = productoId;
            }

            if (cantidad) {
              newItems[index].cantidad = cantidad;
            }

            formik.setFieldValue("items", newItems);

            if (productoCompleto) {
              const newProductosList = [...productosList];
              newProductosList[index] = {
                ...productoCompleto,
                cantidad: cantidad || 1
              };
              setProductosList(newProductosList);
            } else if (cantidad && productosList[index]) {
              const newProductosList = [...productosList];
              newProductosList[index].cantidad = cantidad;
              setProductosList(newProductosList);
            }
          };

          return (
            <Form style={{ width: "80%", margin: "0 auto" }}>
              <div className="form-group">
                <div>
                  <label htmlFor="origin">Origen:</label>
                  <Field
                    as="select"
                    name="origin"
                    className="despacho-input"
                    onChange={(e) => {
                      formik.handleChange(e);
                      setProductosList([]);
                    }}
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
                          onUpdate={handleUpdateProduct}
                          onRemove={(idx) => {
                            remove(idx);
                            const newProductosList = [...productosList];
                            newProductosList.splice(idx, 1);
                            setProductosList(newProductosList);

                            if (formik.values.items.length === 1) {
                              push({ productoId: "", cantidad: 1 });
                              setProductosList([null]);
                            }
                          }}
                          isDefault={false}
                          puntoVentaId={formik.values.origin || null}
                          selectedProducto={productosList[index] || null}
                        />
                      ))}
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={() => {
                          push({ productoId: "", cantidad: 1 });
                          setProductosList([...productosList, null]);
                        }}
                        disabled={!formik.values.origin}
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
                  disabled={formik.isSubmitting}
                >
                  {formik.isSubmitting ? "Enviando..." : "Enviar"}
                </Button>
              </div>
            </Form>
          );
        }}
      </Formik>
    </div>
  );
}