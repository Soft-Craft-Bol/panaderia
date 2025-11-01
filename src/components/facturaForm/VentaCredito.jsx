import React, { useState } from 'react';
import { VentasCredito } from '../../service/api';
import { getUser } from "../../utils/authFunctions";
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import SelectSecondary from '../selected/SelectSecondary';
import { toast, Toaster } from 'sonner';
import { useMutation } from '@tanstack/react-query';
import { useLocation } from 'react-router-dom';
import ButtonPrimary from '../buttons/ButtonPrimary';
import InputText from '../inputs/InputText';
import FacturaDetalles from './FacturaDetalles';
import ClienteForm from './ClienteForm';
import './FormFacturacion.css';

const metodosPago = [
  { value: 'PAGO_POSTERIOR', label: 'Pago Posterior' },
  { value: 'CREDITO', label: 'Crédito' },
];

const validationSchema = Yup.object({
  codigoMetodoPago: Yup.string().required('Seleccione el método de pago'),
  plazoDias: Yup.number().min(1, 'Debe ser mayor a 0').required('Requerido'),
});

export default function VentaCredito() {
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
  const [ventaData, setVentaData] = useState(null);

  const location = useLocation();
  const { productosSeleccionados } = location.state || {};

  const currentUser = getUser();
  const cajaId = currentUser?.cajasAbiertas?.[0]?.id || null;
  const puntoVentaId = currentUser?.puntosVenta?.[0]?.id || null;

  const initialValues = {
    codigoMetodoPago: '',
    plazoDias: 30,
    condicionesPagoPosterior: '',
    items: (productosSeleccionados || []).map((p) => ({
      idProducto: p.id,
      cantidad: p.quantity || 0,
      montoDescuento: p.tieneDescuento
        ? (p.precioUnitario - p.precioConDescuento) * p.quantity
        : 0,
      precioUnitario: p.tieneDescuento
        ? p.precioConDescuento
        : p.precioUnitario,
      item: p.descripcion,
    })),
  };

  const { mutate: registrarVenta } = useMutation({
    mutationFn: VentasCredito, 
    onSuccess: async (response) => {
      try {
        toast.success("Venta registrada correctamente");
      } catch (error) {
        console.error('Error generando PDF:', error);
        toast.error('Error al generar el PDF');
      }
    },
    onError: (error) => {
      const msg = error.response?.data?.message || error.message || 'Error desconocido';
      toast.error(`Error: ${msg}`);
      console.error('Detalles del error:', error.response?.data || error);
    },
  });

  const handleSubmit = (values) => {
    if (!clienteSeleccionado) {
      toast.error("Debe seleccionar o registrar un cliente primero");
      return;
    }

    if (!productosSeleccionados || productosSeleccionados.length === 0) {
      toast.error("Debe seleccionar productos antes de registrar la venta");
      return;
    }

    if (!puntoVentaId) {
      toast.error("No se ha configurado un punto de venta");
      return;
    }

    // Construimos el payload según tipo de venta
    const payloadBase = {
      idCliente: clienteSeleccionado.id,
      idPuntoVenta: puntoVentaId,
      tipoComprobante: "RECIBO",
      username: currentUser?.username || '',
      detalle: values.items.map(i => ({
        idProducto: i.idProducto,
        cantidad: Number(i.cantidad) || 0,
        montoDescuento: Number(i.montoDescuento) || 0,
      })),
      metodoPago: values.codigoMetodoPago,
      cajaId: cajaId,
    };

    // Campos adicionales según tipo
    if (values.codigoMetodoPago === "CREDITO") {
      payloadBase.esCredito = true;
      payloadBase.diasCredito = values.plazoDias;
    }

    if (values.codigoMetodoPago === "PAGO_POSTERIOR") {
      payloadBase.esPagoPosterior = true;
      payloadBase.plazoPagoPosterior = values.plazoDias;
      payloadBase.condicionesPagoPosterior = values.condicionesPagoPosterior || '';
    }

    registrarVenta(payloadBase);

  };

  const calcularTotales = (items) => {
    const subtotal = items.reduce(
      (s, i) => s + (i.precioUnitario || 0) * (i.cantidad || 0),
      0
    );
    const descuentos = items.reduce((s, i) => s + (i.montoDescuento || 0), 0);
    return { subtotal, descuentos, total: subtotal - descuentos };
  };

  const { subtotal, descuentos, total } = calcularTotales(initialValues.items);

  return (
    <div className="facturacion-container">
      <Toaster richColors position="top-center" />
      <h2>Venta Crédito / Pago Posterior</h2>

      <ClienteForm onClienteSeleccionado={setClienteSeleccionado} />

      <FacturaDetalles
        title="Detalles de la Venta"
        items={initialValues.items}
        subtotal={subtotal}
        descuentos={descuentos}
        total={total}
        codigoMoneda="BOB"
        monedas={[{ id: 1, descripcion: 'BOLIVIANO' }]}
      />

      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
        enableReinitialize
      >
        {({ values, setFieldValue, isSubmitting }) => (
          <Form>
            <div className="metodo-pago-group">
              <SelectSecondary
                label="Método de Pago"
                name="codigoMetodoPago"
                required
                value={values.codigoMetodoPago}
                onChange={(e) => setFieldValue("codigoMetodoPago", e.target.value)}
              >
                <option value="">Seleccione...</option>
                {metodosPago.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </SelectSecondary>
            </div>

            {values.codigoMetodoPago && (
              <div className="credito-condiciones">
                <h4>
                  {values.codigoMetodoPago === "CREDITO"
                    ? "Condiciones de Crédito"
                    : "Condiciones de Pago Posterior"}
                </h4>

                <div className="condiciones-grid">
                  <InputText
                    label="Días de Plazo"
                    name="plazoDias"
                    type="number"
                    min="1"
                    value={values.plazoDias}
                    onChange={(e) =>
                      setFieldValue("plazoDias", parseInt(e.target.value))
                    }
                    required
                  />

                  {values.codigoMetodoPago === "PAGO_POSTERIOR" && (
                    <InputText
                      label="Condiciones del Pago Posterior"
                      name="condicionesPagoPosterior"
                      placeholder="Ej: Pago en 30 días sin recargo"
                      value={values.condicionesPagoPosterior}
                      onChange={(e) =>
                        setFieldValue("condicionesPagoPosterior", e.target.value)
                      }
                    />
                  )}
                </div>

                <p>
                    Fecha de vencimiento:{" "}
                  {new Date(
                    Date.now() + values.plazoDias * 24 * 60 * 60 * 1000
                  ).toLocaleDateString()}
                </p>
              </div>
            )}

            <div className="factura-buttons">
              <ButtonPrimary
                type="submit"
                disabled={isSubmitting || !clienteSeleccionado}
              >
                {isSubmitting ? 'Registrando...' : 'Registrar Venta'}
              </ButtonPrimary>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
}
