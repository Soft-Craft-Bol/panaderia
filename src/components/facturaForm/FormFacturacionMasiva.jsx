import React, { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Formik, Form } from "formik";
import { toast } from "sonner";
import SelectSecondary from "../selected/SelectSecondary";
import ClienteForm from "./ClienteForm";
import FacturaDetalles from "./FacturaDetalles";
import ButtonPrimary from "../buttons/ButtonPrimary";
import { emitirFactura } from "../../service/api";

const metodosPago = [
  { value: 1, label: "Efectivo" },
  { value: 2, label: "Tarjeta" },
  { value: 7, label: "Transferencia Bancaria" },
  { value: 31, label: "QR/Canal de Pago" },
  { value: 32, label: "Billetera Móvil" },
];

const FormFacturacionMasiva = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { ventas = [], nits = [] } = location.state || {};
  const [cliente, setCliente] = useState(null);
console.log("Ventas recibidas:", ventas);
  // Combinar productos de todas las ventas seleccionadas
  const productos = useMemo(() =>
    ventas.flatMap((v) =>
      v.detalles.map((d) => ({
        id: d.producto.id,
        descripcion: d.descripcionProducto,
        cantidad: d.cantidad,
        precioUnitario: d.precioUnitario,
        unidadMedida: d.producto.unidadMedida,
        descuento: d.descuento || 0,
      }))
    ), [ventas]);

  // Calcular totales
  const calcularTotales = () => {
    const subtotal = productos.reduce(
      (sum, p) => sum + p.cantidad * p.precioUnitario,
      0
    );
    const descuentos = productos.reduce((sum, p) => sum + (p.descuento || 0), 0);
    return {
      subtotal,
      descuentos,
      total: subtotal - descuentos,
    };
  };

  const { subtotal, descuentos, total } = calcularTotales();

  const initialValues = {
    nitSeleccionado: "",
    metodoPago: 1,
    numeroTarjeta: "",
  };

  const handleSubmit = async (values) => {
    if (!cliente) {
      toast.error("Debe seleccionar o registrar un cliente");
      return;
    }

    if (!values.nitSeleccionado) {
      toast.error("Debe seleccionar un NIT emisor");
      return;
    }

    try {
      const payload = {
        nitEmisor: values.nitSeleccionado,
        codigoMetodoPago: values.metodoPago,
        numeroTarjeta: values.metodoPago === 2 ? values.numeroTarjeta : null,
        clienteId: cliente.id,
        ventasIds: ventas.map((v) => v.id),
        detalle: productos.map((p) => ({
          idProducto: p.id,
          cantidad: p.cantidad,
          precioUnitario: p.precioUnitario,
          montoDescuento: p.descuento || 0,
        })),
      };

      await emitirFactura(payload);

      toast.success("Factura masiva emitida correctamente");
      navigate("/ventas");
    } catch (err) {
      toast.error(`Error: ${err.response?.data?.mensaje || err.message}`);
    }
  };

  return (
    <div className="facturacion-masiva-container">
      <h2>Facturación Masiva</h2>

      <Formik initialValues={initialValues} onSubmit={handleSubmit}>
        {({ values, setFieldValue, isSubmitting }) => (
          <Form>
            {/* Selección de NIT */}
            <SelectSecondary
              label="NIT para emisión"
              name="nitSeleccionado"
              required
              value={values.nitSeleccionado}
              onChange={(e) => setFieldValue("nitSeleccionado", e.target.value)}
            >
              <option value="">Seleccione un NIT</option>
              {nits.map((nit) => (
                <option key={nit} value={nit}>
                  {nit}
                </option>
              ))}
            </SelectSecondary>

            {/* Cliente */}
            <ClienteForm
              initialValues={{}}
              onSubmit={(c) => setCliente(c)}
            />

            {/* Productos */}
            <FacturaDetalles
              items={productos}
              subtotal={subtotal}
              descuentos={descuentos}
              total={total}
            />

            {/* Método de pago */}
            <SelectSecondary
              label="Método de Pago"
              name="metodoPago"
              required
              value={values.metodoPago}
              onChange={(e) => setFieldValue("metodoPago", parseInt(e.target.value))}
            >
              {metodosPago.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </SelectSecondary>

            {values.metodoPago === 2 && (
              <input
                type="text"
                name="numeroTarjeta"
                placeholder="Número de tarjeta"
                value={values.numeroTarjeta}
                onChange={(e) => setFieldValue("numeroTarjeta", e.target.value)}
              />
            )}

            {/* Botones */}
            <div className="acciones">
              <ButtonPrimary
                type="submit"
                disabled={isSubmitting || !cliente}
              >
                {isSubmitting ? "Emitiendo..." : "Emitir Factura Masiva"}
              </ButtonPrimary>

              <ButtonPrimary
                variant="secondary"
                onClick={() => navigate("/ventas")}
              >
                Cancelar
              </ButtonPrimary>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default FormFacturacionMasiva;
