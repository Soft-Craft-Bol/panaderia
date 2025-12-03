import React, { useState } from 'react';
import { VentasCredito } from '../../service/api';
import { getUser } from "../../utils/authFunctions";
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import SelectSecondary from '../selected/SelectSecondary';
import { toast, Toaster } from 'sonner';
import { useMutation } from '@tanstack/react-query';
import { useLocation, useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();

  const location = useLocation();
  const { productosSeleccionados, sucursalId, puntoVentaId: puntoVentaIdFromState, cartIndex = 0 } = location.state || {};

  const currentUser = getUser();
  const cajaId = currentUser?.cajasAbiertas?.[0]?.id || null;
  const puntoVentaId = puntoVentaIdFromState || currentUser?.puntosVenta?.[0]?.id || null;

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

  const redondearAMultiplo = (valor, multiplo = 0.50) => {
    if (typeof valor !== "number" || isNaN(valor)) return 0;

    const resto = valor % multiplo;
    const haciaAbajo = valor - resto;
    const haciaArriba = haciaAbajo + multiplo;

    if (resto <= 0.10) {
        return parseFloat(haciaAbajo.toFixed(2));
    } else {
        return parseFloat(haciaArriba.toFixed(2));
    }
  };

  // Usar useMutation con reset
  const { 
    mutate: registrarVenta, 
    isPending: isSubmitting,
    isError,
    reset 
  } = useMutation({
    mutationFn: VentasCredito, 
    onSuccess: async (response) => {
      try {
        toast.success("Venta registrada correctamente");
        limpiarCarritoEspecifico();
        setTimeout(() => {
          navigate('/punto-ventas'); 
        }, 1500);
        
      } catch (error) {
        console.error('Error generando PDF:', error);
        toast.error('Error al generar el PDF');
        // Resetear el estado de la mutación incluso en error parcial
        setTimeout(() => reset(), 1000);
      }
    },
    onError: (error) => {
      const msg = error.response?.data?.message || error.message || 'Error desconocido';
      toast.error(`Error: ${msg}`);
      console.error('Detalles del error:', error.response?.data || error);
      
      // Resetear automáticamente después de 2 segundos para que el botón vuelva a su estado normal
      setTimeout(() => reset(), 2000);
    },
  });

  const limpiarCarritoEspecifico = () => {
    try {
      const storedCarts = localStorage.getItem('ventasCarts');
      if (storedCarts) {
        const parsedCarts = JSON.parse(storedCarts);
        if (Array.isArray(parsedCarts) && parsedCarts[cartIndex]) {
          parsedCarts[cartIndex] = [];
          localStorage.setItem('ventasCarts', JSON.stringify(parsedCarts));
        }
      }
    } catch (error) {
      console.error("Error limpiando carrito:", error);
    }
  };

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
    
    const { total: totalRedondeado, totalSinRedondear, diferenciaRedondeo } = calcularTotales(values.items);

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
      totalAjustado: totalRedondeado,
      diferenciaRedondeo: diferenciaRedondeo
    };

    if (values.codigoMetodoPago === "CREDITO") {
      payloadBase.esCredito = true;
      payloadBase.diasCredito = values.plazoDias;
    }

    if (values.codigoMetodoPago === "PAGO_POSTERIOR") {
      payloadBase.esPagoPosterior = true;
      payloadBase.plazoPagoPosterior = values.plazoDias;
      payloadBase.condicionesPagoPosterior = values.condicionesPagoPosterior || '';
    }
    
    console.log('Payload de venta a registrar:', payloadBase);
    registrarVenta(payloadBase);
  };

  const calcularTotales = (items) => {
    const subtotal = items.reduce(
        (s, i) => s + (i.precioUnitario || 0) * (i.cantidad || 0),
        0
    );
    const descuentos = items.reduce((s, i) => s + (i.montoDescuento || 0), 0);
    
    const totalSinRedondear = subtotal - descuentos;
    const totalRedondeado = redondearAMultiplo(totalSinRedondear, 0.50);
    
    return { 
        subtotal, 
        descuentos, 
        total: totalRedondeado,
        totalSinRedondear,
        diferenciaRedondeo: totalSinRedondear - totalRedondeado
    };
  };

  const { subtotal, descuentos, total, totalSinRedondear, diferenciaRedondeo } = calcularTotales(initialValues.items); 

  // Determinar el texto del botón
  const getButtonText = () => {
    if (isSubmitting) return 'Registrando...';
    if (isError) return 'Error - Intentar de nuevo';
    return 'Registrar Venta';
  };

  return (
    <div className="facturacion-container">
      <Toaster richColors position="top-center" />
      
      {/* Botón para volver al punto de venta */}
      <div className="header-actions">
        <button 
          type="button"
          className="btn-volver"
          onClick={() => navigate('/punto-ventas')}
          style={{
            padding: '8px 16px',
            backgroundColor: '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            marginBottom: '20px'
          }}
        >
          ← Volver al Punto de Venta
        </button>
      </div>

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

      {diferenciaRedondeo !== 0 && (
        <div style={{
            backgroundColor: '#e8f4fd',
            padding: '10px',
            borderRadius: '6px',
            margin: '10px 0',
            border: '1px solid #b8daff'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Subtotal sin redondeo:</span>
                <span>Bs {totalSinRedondear.toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Ajuste por redondeo:</span>
                <span style={{ color: diferenciaRedondeo > 0 ? '#dc3545' : '#28a745' }}>
                    {diferenciaRedondeo > 0 ? '-' : '+'}Bs {Math.abs(diferenciaRedondeo).toFixed(2)}
                </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
                <span>Total final:</span>
                <span>Bs {total.toFixed(2)}</span>
            </div>
        </div>
      )}

      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
        enableReinitialize
      >
        {({ values, setFieldValue, isValid, dirty }) => (
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
                disabled={isSubmitting || !clienteSeleccionado || !isValid || !dirty}
                className={isError ? 'btn-error' : ''}
              >
                {getButtonText()}
              </ButtonPrimary>
              
              <button 
                type="button"
                className="btn-cancelar"
                onClick={() => navigate('/punto-ventas')}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  marginLeft: '10px'
                }}
              >
                Cancelar
              </button>
            </div>
          </Form>
        )}
      </Formik>

      {/* Agregar estilos CSS para el estado de error */}
      <style jsx>{`
        .btn-error {
          background-color: #dc3545 !important;
        }
        
        .btn-error:hover {
          background-color: #c82333 !important;
        }
      `}</style>
    </div>
  );
}