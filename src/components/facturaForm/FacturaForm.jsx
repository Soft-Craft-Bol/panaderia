import React, { useState, useEffect, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Formik, Form, FieldArray, ErrorMessage } from "formik";
import * as Yup from "yup";
import { toast } from "sonner";
import {
  fetchPuntosDeVenta,
  emitirFactura,
  emitirSinFactura,
  getStockBySucursal,
  emitirContingencia,
  sendEmail
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
  //console.log(currentUser);
  const client = location.state?.client || {
    nombreRazonSocial: "S/N",
    email: "...",
    numeroDocumento: "0000000000 CB",
    id: null,
  };

  const flag = location.state?.flag || false;

  const [items, setItems] = useState([]);
  const [puntosDeVenta, setPuntosDeVenta] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [ventaResult, setVentaResult] = useState(null);
  const [showSendEmailModal, setShowSendEmailModal] = useState(false);
  const [facturaData, setFacturaData] = useState(null);
  const productosSeleccionados = location.state?.productosSeleccionados || [];
  const sucursalId = location.state?.sucursalId || null;

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [puntosRes, stockRes] = await Promise.all([
          fetchPuntosDeVenta(),
          sucursalId && productosSeleccionados.length > 0 
            ? getStockBySucursal(sucursalId) 
            : Promise.resolve({ data: { items: [] } })
        ]);
        setPuntosDeVenta(puntosRes.data);
        setItems(stockRes.data.items);
      } catch (error) {
        toast.error("Error al cargar datos");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [sucursalId, productosSeleccionados]);


  const [initialValues, setInitialValues] = useState({
    puntoDeVenta: "",
    metodoPago: "EFECTIVO",
    items: productosSeleccionados.map(producto => ({
      item: producto.descripcion,
      cantidad: producto.quantity,
      precioUnitario: producto.tieneDescuento ? producto.precioConDescuento : producto.precioUnitario,
      descuento: producto.tieneDescuento ?
        (producto.precioUnitario - producto.precioConDescuento) * producto.quantity : 0,
      cantidadDisponible: producto.stockActual,
      idProducto: producto.id,
      tieneDescuento: producto.tieneDescuento
    }))
  });

  const validationSchema = Yup.object({
    puntoDeVenta: Yup.string().required("Seleccione un punto de venta"),
    metodoPago: Yup.string().required("Método de pago es requerido"),
    items: Yup.array().of(
  Yup.object().shape({
    cantidad: Yup.number()
      .required("Requerido")
      .test("stock", "No hay stock", function(value) {
        const item = this.parent;
        return value <= item.cantidadDisponible;
      })
  })
)
  });

  const calcularSubtotalItem = (cantidad, precioUnitario, descuento, tieneDescuento) => {
    if (!cantidad || !precioUnitario) return 0;
    
    if (tieneDescuento) {
      return parseFloat((cantidad * precioUnitario).toFixed(2));
    }
    return parseFloat((cantidad * precioUnitario - (0)).toFixed(2));
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
            unidadMedida: selectedItem.unidadMedida || 1, 
          };
        }),
      };

      let response;
      try {
        response = await emitirFactura(facturaData);
      } catch (error) {
        console.error("Error al emitir la factura:", error);
      }

      setFacturaData({
        ...response.data,
        clienteNombre: client.nombreRazonSocial,
        clienteEmail: client.email
      });

      setShowSendEmailModal(true);

      const doc = await generatePDF(response.data.xmlContent);
      
      const pdfBytes = await doc.output('arraybuffer');
      setFacturaData(prev => ({
        ...prev,
        pdfBytes: Array.from(new Uint8Array(pdfBytes))
      }));

      toast.success("Factura emitida correctamente");
      resetForm();
    } catch (error) {
      toast.error(`Error al emitir la factura: ${error.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSendEmail = async () => {
    try {
      if (!facturaData || !facturaData.clienteEmail) {
        throw new Error("No hay datos de cliente o correo electrónico");
      }

      const requestData = {
        toEmail: facturaData.clienteEmail,
        clienteNombre: facturaData.clienteNombre,
        numeroFactura: facturaData.numeroFactura,
        cuf: facturaData.cuf,
        pdfContent: facturaData.pdfBytes
      };

      await sendEmail(requestData);
      toast.success("Factura enviada por correo electrónico");
      setShowSendEmailModal(false);
      navigate("/ventas");
    } catch (error) {
      toast.error(`Error al enviar el correo: ${error.message}`);
    }
  };

  const handlePrint = () => {
    if (!facturaData) return;
    
    // Aquí puedes implementar la lógica para imprimir directamente
    // o simplemente descargar el PDF como lo hacías antes
    const doc = generatePDF(facturaData.xmlContent);
    doc.save(`factura-${facturaData.cuf}.pdf`);
    setShowSendEmailModal(false);
    navigate("/ventas");
  };

  const handleVentaSinFactura = async (values, { setSubmitting }) => {
    try {
      setSubmitting(true); // Deshabilitar el botón mientras se procesa

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
      setVentaResult({
        success: true,
        message: "Venta sin factura registrada con éxito",
        data: response.data
      });
      setIsModalOpen(true);
    } catch (error) {
      console.error("Error al registrar la venta sin factura:", error);
      setVentaResult({
        success: false,
        message: `Error al registrar la venta sin factura: ${error.message}`
      });
      setIsModalOpen(true);
    } finally {
      setSubmitting(false); // Rehabilitar el botón
    }
  };

  const handleContingencia = async (values, { setSubmitting }) => {
    try {
      setSubmitting(true);

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

      const response = await emitirContingencia(facturaData);
      const doc = await generatePDF(response.data.xmlContent);
      doc.save(`factura-contingencia-${response.data.cuf}.pdf`);
      toast.success("Factura por contingencia emitida y PDF generado con éxito");
      navigate("/ventas");
    } catch (error) {
      toast.error(`Error al emitir factura por contingencia: ${error.message}`);
    } finally {
      setSubmitting(false);
    }
  };


  const handlePuntoDeVentaChange = useCallback(async (puntoDeVentaNombre) => {
    const selectedPuntoDeVenta = puntosDeVenta.find(
      (punto) => punto.nombre === puntoDeVentaNombre
    );

    if (selectedPuntoDeVenta) {
      try {
        const response = await getStockBySucursal(selectedPuntoDeVenta.sucursal.id);
        setItems(response.data.items);
      } catch (error) {
        toast.error("Error al cargar los items de la sucursal");
      }
    }
  }, [puntosDeVenta]);


  const handleBoth = async () => {
    await handleSendEmail();
    handlePrint();
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
          onSubmit={() => { }} >
          {({ values, setFieldValue, isSubmitting, resetForm }) => (
            <Form>
              <SelectPrimary
                label="Punto de Venta"
                name="puntoDeVenta"
                required
                onChange={(e) => {
                  setFieldValue("puntoDeVenta", e.target.value);
                  handlePuntoDeVentaChange(e.target.value);
                }}
              >
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
                required
              >
                <option value="">Seleccione método de pago</option>
                <option value="EFECTIVO">Efectivo</option>
                <option value="TARJETA_CREDITO">Tarjeta de Crédito/Débito</option>
                <option value="TRANSFERENCIA">Transferencia Bancaria</option>
                <option value="QR">Pago QR</option>
              </SelectPrimary>

              <FieldArray name="items">
                {({ push, remove }) => (
                  <div className="items-container">
                    {values.items.map((item, index) => {
                      const selectedItem = items.find(
                        (i) => i.id === item.idProducto || i.descripcion === item.item
                      );

                      const itemData = selectedItem || {
                        id: item.idProducto,
                        descripcion: item.item,
                        precioUnitario: item.precioUnitario,
                        cantidad: item.cantidadDisponible
                      };

                      return (
                        <div className="ds" key={index}>
                          <div className="form-row">
                            <SelectPrimary
                              label="Item/Descripción"
                              name={`items[${index}].item`}
                              required
                              value={itemData.descripcion}
                              onChange={(e) => {
                                const selectedItem = items.find((i) => i.descripcion === e.target.value);
                                if (selectedItem) {
                                  const sucursalItem = selectedItem.sucursales?.find(s => s.sucursalId === sucursalId);
                                  const tieneDescuento = sucursalItem?.tieneDescuento || false;
                                  const precioUnitario = tieneDescuento ? sucursalItem.precioConDescuento : selectedItem.precioUnitario;

                                  setFieldValue(`items[${index}].item`, e.target.value);
                                  setFieldValue(`items[${index}].precioUnitario`, precioUnitario);
                                  setFieldValue(`items[${index}].cantidadDisponible`, sucursalItem?.cantidad || 0);
                                  setFieldValue(`items[${index}].idProducto`, selectedItem.id);
                                  setFieldValue(`items[${index}].tieneDescuento`, tieneDescuento);
                                  setFieldValue(`items[${index}].descuento`,
                                    tieneDescuento ?
                                      (selectedItem.precioUnitario - precioUnitario) * values.items[index].cantidad : 0
                                  );
                                }
                              }}
                            >
                              <option value="">Seleccione un item</option>
                              {items.map((i) => {
                                const sucursalItem = i.sucursales?.find(s => s.sucursalId === sucursalId);
                                const tieneDescuento = sucursalItem?.tieneDescuento || false;

                                return (
                                  <option key={i.id} value={i.descripcion}>
                                    {i.codigo} - {i.descripcion}
                                    {tieneDescuento && ` (${Math.round((1 - (sucursalItem.precioConDescuento / i.precioUnitario) * 100))}% OFF)`}
                                  </option>
                                );
                              })}
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
                              label="Precio Ud(Bs)"
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
                            <div className="subtotal-field">
                              <label>Subtotal (Bs):</label>
                              <input
                                type="text"
                                value={calcularSubtotalItem(
                                  item.cantidad,
                                  item.precioUnitario,
                                  item.descuento,
                                  item.tieneDescuento
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
                <Button
                  type="button"
                  variant="primary"
                  onClick={(e) => {
                    e.preventDefault();
                    handleSubmit(values, {
                      resetForm,
                      setSubmitting: (submitting) => {
                        console.log("Submitting:", submitting);
                      }
                    });
                  }}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Emitiendo..." : "Emitir Factura"}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={(e) => {
                    e.preventDefault();
                    handleVentaSinFactura(values, {
                      setSubmitting: (submitting) => {
                        console.log("Submitting:", submitting);
                      }
                    });
                  }}
                  disabled={isSubmitting}
                >
                  Registrar venta sin Factura
                </Button>
                <Button
                  type="button"
                  variant="warning"
                  onClick={(e) => {
                    e.preventDefault();
                    handleContingencia(values, {
                      setSubmitting: (submitting) => {
                        console.log("Submitting:", submitting);
                      }
                    });
                  }}
                  disabled={isSubmitting}
                >
                  Emitir por Contingencia
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
      <Modal isOpen={showSendEmailModal} onClose={() => setShowSendEmailModal(false)}>
        <div>
          <h2>Factura generada exitosamente</h2>
          <p>¿Qué deseas hacer ahora?</p>
          
          <div className="modal-buttons" style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '10px',
            marginTop: '20px'
          }}>
            <Button variant="primary" onClick={handleSendEmail}>
              Enviar por correo al cliente
            </Button>
            <Button variant="secondary" onClick={handlePrint}>
              Imprimir factura
            </Button>
            <Button variant="success" onClick={handleBoth}>
              Enviar por correo e imprimir
            </Button>
            <Button variant="danger" onClick={() => {
              setShowSendEmailModal(false);
              navigate("/ventas");
            }}>
              Solo guardar
            </Button>
          </div>
        </div>
      </Modal>

    </main>
  );
};

export default FacturaForm;