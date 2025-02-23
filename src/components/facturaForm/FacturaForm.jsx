import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Formik, Form, FieldArray, ErrorMessage } from "formik";
import * as Yup from "yup";
import { toast } from "sonner";
import {
  fetchItems,
  emitirFactura,
  fetchPuntosDeVenta,
  emitirSinFactura,
  getCufd,
} from "../../service/api";
import { generatePDF } from "../../utils/generatePDF";
import { getUser } from "../../utils/authFunctions";
import "./FacturaForm.css";
import InputFacturacion from "../inputs/InputFacturacion";
import { Button } from "../buttons/Button";
import SelectPrimary from "../selected/SelectPrimary";

const FacturaForm = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const currentUser = getUser();
  const flag = location.state?.flag || false;
  const [client, setClient] = useState(
    location.state?.client || {
      nombreRazonSocial: "S/N",
      email: "...",
      numeroDocumento: "0000000000 CB",
      id: null,
    }
  );

  const [items, setItems] = useState([]);
  const [puntosDeVenta, setPuntosDeVenta] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [itemsRes, puntosRes] = await Promise.all([
          fetchItems(),
          fetchPuntosDeVenta(),
        ]);
        console.log("jajaj", itemsRes.data);
        setItems(itemsRes.data);
        setPuntosDeVenta(puntosRes.data);
      } catch (error) {
        setError("Error al cargar los datos necesarios");
        toast.error("Error al cargar los datos necesarios");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const initialValues = {
    puntoDeVenta: "",
    metodoPago: "EFECTIVO",
    items: [
      {
        item: "",
        cantidad: "",
        precioUnitario: "",
        descuento: 0,
      },
    ],
  };

  const validationSchema = Yup.object({
    puntoDeVenta: Yup.string().required("Seleccione un punto de venta"),
    metodoPago: Yup.string().required("Método de pago es requerido"),
    items: Yup.array().of(
      Yup.object().shape({
        item: Yup.string().required("Seleccione un item"),
        cantidad: Yup.number()
          .required("Ingrese la cantidad")
          .positive("Debe ser un número positivo"),
        precioUnitario: Yup.number()
          .required("Ingrese el precio unitario")
          .positive("Debe ser un número positivo"),
        descuento: Yup.number().min(0, "Debe ser un número positivo o cero"),
      })
    ),
  });

  const calcularSubtotalItem = (cantidad, precioUnitario, descuento) => {
    return cantidad * precioUnitario - descuento;
  };

  const calcularSubtotalGeneral = (items) => {
    return items.reduce((total, item) => {
      return (
        total +
        calcularSubtotalItem(item.cantidad, item.precioUnitario, item.descuento)
      );
    }, 0);
  };

  const handleSubmit = async (values, { resetForm, setSubmitting }) => {
    try {
      const selectedPuntoDeVenta = puntosDeVenta.find(
        (punto) => punto.nombre === values.puntoDeVenta
      );

      if (!selectedPuntoDeVenta) {
        throw new Error("Punto de venta no encontrado");
      }

      const facturaData = {
        idPuntoVenta: selectedPuntoDeVenta.id,
        idCliente: client.id,
        tipoComprobante: "FACTURA",
        metodoPago: values.metodoPago,
        username: currentUser.username,
        usuario: client.nombreRazonSocial,
        detalle: values.items.map((item) => {
          const selectedItem = items.find((i) => i.descripcion === item.item);
          if (!selectedItem) {
            throw new Error(`Item no encontrado: ${item.item}`);
          }
          return {
            idProducto: selectedItem.id,
            cantidad: Number(item.cantidad),
            montoDescuento: Number(item.descuento || 0),
          };
        }),
      };

      let response;
      try {
        response = await emitirFactura(facturaData);
      } catch (error) {
        if (error.response && error.response.data.message.includes("CUFD")) {
          toast.info("Solicitando CUFD...");
          await getCufd(selectedPuntoDeVenta.id);
          toast.success("CUFD obtenido correctamente");
          response = await emitirFactura(facturaData);
        } else {
          throw error;
        }
      }

      const doc = await generatePDF(response.data.xmlContent);
      doc.save(`factura-${response.data.cuf}.pdf`);
      toast.success("Factura emitida y PDF generado con éxito");
      resetForm();
      navigate("/ventas");
    } catch (error) {
      toast.error(`Error al emitir la factura: ${error.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleVentaSinFactura = async (values) => {
    try {
      const selectedPuntoDeVenta = puntosDeVenta.find(
        (punto) => punto.nombre === values.puntoDeVenta
      );

      if (!selectedPuntoDeVenta) {
        throw new Error("Punto de venta no encontrado");
      }

      const ventaSinFacturaData = {
        cliente: client.nombreRazonSocial || "S/N",
        idPuntoVenta: selectedPuntoDeVenta.id,
        tipoComprobante: "RECIBO",
        username: currentUser.username,
        metodoPago: values.metodoPago,
        detalle: values.items.map((item) => {
          const selectedItem = items.find((i) => i.descripcion === item.item);
          if (!selectedItem) {
            throw new Error(`Item no encontrado: ${item.item}`);
          }
          return {
            idProducto: selectedItem.id,
            cantidad: Number(item.cantidad),
            montoDescuento: Number(item.descuento || 0),
          };
        }),
      };

      await emitirSinFactura(ventaSinFacturaData);
      toast.success("Venta sin factura registrada con éxito");
      navigate("/ventas");
    } catch (error) {
      console.error("Error al registrar la venta sin factura:", error);
      toast.error(`Error al registrar la venta sin factura: ${error.message}`);
    }
  };

  if (loading) return <div className="loading">Cargando...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <main className="factura-container">
      <h1>Formulario de venta</h1>

      <section className="client-info">
        <h2>Datos del Cliente</h2>
        <InputFacturacion
          label="Razón Social"
          value={client.nombreRazonSocial || ""}
          readOnly={flag}
          onChange={(e) => {
            if (!flag) {
              setClient({ ...client, nombreRazonSocial: e.target.value });
            }
          }}
        />
        <InputFacturacion
          label="Correo"
          value={client.email || ""}
          readOnly
        />
        <InputFacturacion
          label="NIT/CI"
          value={client.numeroDocumento || ""}
          readOnly
        />
      </section>

      <section className="corporate-details">
        <h2>Detalles corporativos</h2>
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}>
          {({ values, isSubmitting }) => (
            <Form>
              <SelectPrimary
                label="Punto de Venta"
                name="puntoDeVenta"
                required>
                <option value="">Seleccione un punto de venta</option>
                {puntosDeVenta.map((punto) => (
                  <option
                    key={punto.id}
                    value={punto.nombre}>
                    {punto.nombre}
                  </option>
                ))}
              </SelectPrimary>

              <SelectPrimary
                label="Método de Pago"
                name="metodoPago"
                required>
                <option value="EFECTIVO">Efectivo</option>
              </SelectPrimary>

              <FieldArray name="items">
                {({ push, remove }) => (
                  <div className="items-container">
                    {values.items.map((item, index) => (
                      <div
                        key={index}
                        className="form-row">
                        <SelectPrimary
                          label="Item/Descripción"
                          name={`items[${index}].item`}
                          required>
                          <option value="">Seleccione un item</option>
                          {items.map((i) => (
                            <option
                              key={i.id}
                              value={i.descripcion}>
                              {i.descripcion}
                            </option>
                          ))}
                        </SelectPrimary>

                        <InputFacturacion
                          label="Cantidad"
                          name={`items[${index}].cantidad`}
                          type="number"
                          required
                        />

                        <InputFacturacion
                          label="Precio Unitario (Bs)"
                          name={`items[${index}].precioUnitario`}
                          type="number"
                          readOnly
                        />

                        <InputFacturacion
                          label="Descuento (Bs)"
                          name={`items[${index}].descuento`}
                          type="number"
                        />

                        <div className="subtotal-field">
                          <label>Subtotal (Bs):</label>
                          <input
                            type="text"
                            value={calcularSubtotalItem(
                              item.cantidad,
                              item.precioUnitario,
                              item.descuento
                            ).toFixed(2)}
                            readOnly
                          />
                        </div>

                        {index > 0 && (
                          <Button
                            variant="danger"
                            type="button"
                            onClick={() => remove(index)}>
                            Eliminar
                          </Button>
                        )}
                      </div>
                    ))}
                    <Button
                      variant="secondary"
                      type="button"
                      onClick={() =>
                        push({
                          item: "",
                          cantidad: "",
                          precioUnitario: "",
                          descuento: 0,
                        })
                      }>
                      + Añadir ítem
                    </Button>
                  </div>
                )}
              </FieldArray>

              <div className="subtotal-general">
                <label>Subtotal General (Bs):</label>
                <input
                  type="text"
                  value={calcularSubtotalGeneral(values.items).toFixed(2)}
                  readOnly
                />
              </div>

              <div className="form-buttons">
                <Button
                  type="submit"
                  variant="primary"
                  disabled={!flag || isSubmitting}>
                  {isSubmitting ? "Emitiendo..." : "Emitir Factura"}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => handleVentaSinFactura(values)}
                  disabled={flag}>
                  Registrar venta sin Factura
                </Button>
                <Button
                  type="button"
                  variant="danger"
                  onClick={() => resetForm()}
                  disabled={isSubmitting}>
                  Limpiar Datos
                </Button>
              </div>
            </Form>
          )}
        </Formik>
      </section>

      <div className="bot-btns">
        <Button
          variant="link"
          onClick={() => navigate("/facturacion")}>
          Generar factura con un NIT diferente
        </Button>
      </div>
    </main>
  );
};

export default FacturaForm;
