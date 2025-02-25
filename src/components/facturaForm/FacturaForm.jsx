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
import Modal from "../modal/Modal";
import { generateReciboPDF } from "../../utils/generateReciboPDF";

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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [ventaResult, setVentaResult] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [itemsRes, puntosRes] = await Promise.all([
          fetchItems(),
          fetchPuntosDeVenta(),
        ]);
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
        cantidadDisponible: 0,
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
          .positive("Debe ser un número positivo")
          .max(Yup.ref("cantidadDisponible")),
        precioUnitario: Yup.number()
          .required("Ingrese el precio unitario")
          .positive("Debe ser un número positivo"),
        descuento: Yup.number().min(0, "Debe ser un número positivo o cero"),
        cantidadDisponible: Yup.number(),
      })
    ),
  });

  const calcularSubtotalItem = (cantidad, precioUnitario, descuento) => {
    if (!cantidad || !precioUnitario) return 0;
    const descuentoValido = descuento || 0;
    return cantidad * precioUnitario - descuentoValido;
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
  
      const response = await emitirSinFactura(ventaSinFacturaData);
      setVentaResult({ success: true, message: "Venta sin factura registrada con éxito", data: response.data });
      setIsModalOpen(true);
    } catch (error) {
      console.error("Error al registrar la venta sin factura:", error);
      setVentaResult({ success: false, message: `Error al registrar la venta sin factura: ${error.message}` });
      setIsModalOpen(true);
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
          {({ values, setFieldValue, isSubmitting }) => (
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
                    {values.items.map((item, index) => {
                      const selectedItem = items.find(
                        (i) => i.descripcion === item.item
                      );

                      return (
                        <div className="ds" key={index}>
                        <div  className="form-row">
                          <SelectPrimary
                            label="Item/Descripción"
                            name={`items[${index}].item`}
                            required
                            onChange={(e) => {
                              const selectedItem = items.find((i) => i.descripcion === e.target.value);
                              if (selectedItem) {
                                setFieldValue(`items[${index}].item`, e.target.value);
                                setFieldValue(`items[${index}].precioUnitario`, selectedItem.precioUnitario);
                                setFieldValue(`items[${index}].cantidadDisponible`, selectedItem.cantidad);
                              }
                            }}
                          >
                            <option value="">Seleccione un item</option>
                            {items.map((i) => (
                              <option key={i.id} value={i.descripcion}>
                                {i.descripcion}
                              </option>
                            ))}
                          </SelectPrimary>

                          <InputFacturacion
                            label="Cantidad"
                            name={`items[${index}].cantidad`}
                            type="number"
                            required
                            onChange={(e) => {
                              setFieldValue(`items[${index}].cantidad`, e.target.value);
                            }}
                          />

                          <InputFacturacion
                            label="Precio Unitario (Bs)"
                            name={`items[${index}].precioUnitario`}
                            type="number"
                            required
                            readOnly
                            value={item.precioUnitario || "0.00"}
                          />

                          <InputFacturacion
                            label="Descuento (Bs)"
                            name={`items[${index}].descuento`}
                            type="number"
                            onChange={(e) => {
                              setFieldValue(`items[${index}].descuento`, e.target.value);
                            }}
                          />

                          {/* Subtotales y botones */}
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
                              onClick={() => remove(index)}
                            >
                              Eliminar
                            </Button>
                          )}
                        </div>
                        <div className="cantidad-disponible">
                            <label>Cantidad Disponible:</label>
                            <span>
                              {item.cantidadDisponible === 0
                                ? "Agotado"
                                : item.cantidadDisponible}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                    <Button
                      variant="secondary"
                      type="button"
                      onClick={() =>
                        push({
                          item: "",
                          cantidad: "",
                          precioUnitario: "",
                          descuento: 0,
                          cantidadDisponible: 0,
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
                {flag && (
                  <Button
                    type="submit"
                    variant="primary"
                    disabled={isSubmitting}>
                    {isSubmitting ? "Emitiendo factura..." : "Emitir Factura"}
                  </Button>
                )}
                {!flag && (
                  <Button
                    className="btn-venta-sin-factura"
                    type="button"
                    variant="secondary"
                    onClick={() => handleVentaSinFactura(values)}
                    disabled={isSubmitting}>
                    Registrar venta sin Factura
                  </Button>
                )}
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
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        {ventaResult?.success ? (
          <div>
            <h2>¡Venta registrada con éxito!</h2>
            <p>{ventaResult.message}</p>
            <div className="modal-buttons">
              <Button variant="primary" onClick={() => navigate("/ventas")}>
                Continuar
              </Button>
              <Button
                variant="secondary"
                onClick={() => {
                  generateReciboPDF(ventaResult.data); 
                  console.log(ventaResult.data);
                  setIsModalOpen(false); 
                  navigate("/ventas");
                }}
              >
                Imprimir Recibo
              </Button>
            </div>
          </div>
        ) : (
          <div>
            <h2>Error al registrar la venta</h2>
            <p>{ventaResult?.message}</p>
            <Button variant="danger" onClick={() => setIsModalOpen(false)}>
              Cerrar
            </Button>
          </div>
        )}
      </Modal>
    </main>
  );
};

export default FacturaForm;