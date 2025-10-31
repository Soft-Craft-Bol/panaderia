import React, { useState, useEffect } from 'react';
import {
    emitirFactura,
    emitirContingencia,
    sendEmail,
    VerificarComunicacion,
    getTipoEmision,
    getTipoMoneda
} from '../../service/api';
import { getUser } from "../../utils/authFunctions";
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import SelectSecondary from '../selected/SelectSecondary';
import { toast, Toaster } from 'sonner';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useLocation, useNavigate } from 'react-router-dom';
import { generatePDF } from '../../utils/generatePDF';
import ButtonPrimary from '../buttons/ButtonPrimary';
import Modal from '../modal/Modal';
import InputText from '../inputs/InputText';
import FacturaDetalles from './FacturaDetalles';
import ClienteForm from './ClienteForm';
import './FormFacturacion.css';

const validationSchemaVentas = Yup.object({
    codigoMetodoPago: Yup.number().required("Método de pago es requerido"),
    codigoTipoMoneda: Yup.number().required("Tipo de moneda es requerido"),
    cafc: Yup.string().when("codigoTipoEmision", {
        is: "4",
        then: (schema) => schema.required("El CAFC es obligatorio en contingencia"),
        otherwise: (schema) => schema.nullable(),
    }),
});

const metodosPago = [
    { value: 1, label: "Efectivo" },
    { value: 2, label: "Tarjeta" },
    { value: 3, label: "Cheque" },
    { value: 4, label: "Vales" },
    { value: 5, label: "Otros" },
    { value: 6, label: "Pago Posterior" },
    { value: 7, label: "Transferencia Bancaria" },
    { value: 8, label: "Depósito en Cuenta" },
    { value: 9, label: "Transferencia SWIFT" },
    { value: 27, label: "Gift Card" },
    { value: 31, label: "QR/Canal de Pago" },
    { value: 32, label: "Billetera Móvil" },
    { value: 33, label: "Pago Online" },
    { value: 295, label: "Débito Automático" }
];

export default function FormFacturacion() {
    const navigate = useNavigate();
    const [facturaData, setFacturaData] = useState(null);
    const [showSendEmailModal, setShowSendEmailModal] = useState(false);
    const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
    const [modo, setModo] = useState("EN LINEA");
    const [codigoEmisionAuto, setCodigoEmisionAuto] = useState("1");
    const [tipoCambio, setTipoCambio] = useState(1);

    const obtenerTipoCambio = (codigoMoneda) => {
        // Aquí implementarías la lógica para obtener el tipo de cambio actual
        // desde una API o base de datos. Por ahora usaremos valores estáticos
        // para demostración.
        const cambios = {
            1: 1,      // BOLIVIANO
            9: 0.0012, // PESO ARGENTINO
            23: 0.19,  // REAL BRASILEÑO
            33: 0.0011,// PESO CHILENO
            46: 0.14,  // DÓLAR ESTADOUNIDENSE
            108: 0.00002, // GUARANÍ PARAGUAYO
            109: 0.038, // NUEVO SOL PERUANO
            149: 0.000004 // BOLÍVAR FUERTE
        };
        return cambios[codigoMoneda] || 1;
    };

    const location = useLocation();
    const { productosSeleccionados } = location.state || {};

    const currentUser = getUser();
    const cajaId = currentUser?.cajasAbiertas[0]?.id;
    const puntosDeVenta = currentUser?.puntosVenta ? currentUser.puntosVenta[0].id : null;

    const initialValuesEmitirFactura = {
        codigoMetodoPago: 1,
        codigoTipoMoneda: 1,
        cafc: "",
        numeroTarjeta: "",
        codigoTipoEmision: codigoEmisionAuto,
        items: (productosSeleccionados || []).map(producto => ({
            item: producto.descripcion || '',
            cantidad: producto.quantity || 0,
            precioUnitario: producto.tieneDescuento ? producto.precioConDescuento : producto.precioUnitario,
            descuento: producto.tieneDescuento ?
                (producto.precioUnitario - producto.precioConDescuento) * producto.quantity : 0,
            idProducto: producto.id,
            tieneDescuento: producto.tieneDescuento || false,
            unidadMedida: producto.unidadMedida || 1
        }))
    };

    const { data: comunicacion, isLoading: loadingComunicacion, isError } = useQuery({
        queryKey: ['verificarComunicacion'],
        queryFn: VerificarComunicacion,
    });

    const { data: monedas, isLoading: loadingMonedas } = useQuery({
        queryKey: ['tipoMoneda'],
        queryFn: getTipoMoneda,
    });

    const { data: emisiones, isLoading: loadingEmisiones } = useQuery({
        queryKey: ['tipoEmision'],
        queryFn: getTipoEmision,
    });

    useEffect(() => {
        if (isError) {
            setModo("CONTINGENCIA");
            setCodigoEmisionAuto("4");
        } else if (comunicacion?.data?.includes("Error al comunicar con SIAT")) {
            setModo("FUERA DE LINEA");
            setCodigoEmisionAuto("2");
        } else if (comunicacion?.data) {
            setModo("EN LINEA");
            setCodigoEmisionAuto("1");
        }
    }, [isError, comunicacion]);

    const { mutate: emitirFacturaMutation } = useMutation({
        mutationFn: emitirFactura,
        onSuccess: async (response) => {
            const { data } = response;
            try {
                const pdfBytes = await generatePDF(data.xmlContent);
                setFacturaData({
                    ...data,
                    pdfBytes: Array.from(new Uint8Array(pdfBytes)),
                    clienteNombre: clienteSeleccionado?.nombreRazonSocial || '',
                    clienteEmail: clienteSeleccionado?.email || '',
                });
                setShowSendEmailModal(true);
                toast.success("Factura emitida correctamente");
            } catch (error) {
                console.error('Error generating PDF:', error);
                toast.error('Error al generar el PDF');
            }
        },
        onError: (error) => {
            const errorMessage = error.response?.data?.message ||
                error.message ||
                'Error desconocido';
            toast.error(`Error: ${errorMessage}`);
            console.error('Detalles del error:', error.response?.data || error);
        },
    });

    const { mutate: emitirContingenciaMutation } = useMutation({
        mutationFn: emitirContingencia,
        onSuccess: async (response) => {
            const { data } = response;
            try {
                const pdfBytes = await generatePDF(data.xmlContent);
                setFacturaData({
                    ...data,
                    pdfBytes: Array.from(new Uint8Array(pdfBytes)),
                    clienteNombre: clienteSeleccionado?.nombreRazonSocial || '',
                    clienteEmail: clienteSeleccionado?.email || '',
                });
                setShowSendEmailModal(true);
                toast.success("Factura de contingencia emitida correctamente");
            } catch (error) {
                console.error('Error generating PDF:', error);
                toast.error('Error al generar el PDF');
            }
        },
        onError: (error) => {
            const errorMessage = error.response?.data?.message ||
                error.message ||
                'Error desconocido';
            toast.error(`Error: ${errorMessage}`);
            console.error('Detalles del error:', error.response?.data || error);
        },
    });

    const handleSubmitVentas = async (values) => {
        if (!clienteSeleccionado) {
            toast.error('Debe seleccionar o registrar un cliente primero');
            return;
        }

        if (!productosSeleccionados || productosSeleccionados.length === 0) {
            toast.error('No hay productos seleccionados para facturar');
            return;
        }

        if (!puntosDeVenta) {
            toast.error('No se ha configurado un punto de venta para el usuario');
            return;
        }

        const facturaData = {
            idPuntoVenta: puntosDeVenta,
            idCliente: clienteSeleccionado.id,
            tipoComprobante: "FACTURA",
            codigoMetodoPago: values.codigoMetodoPago,
            codigoTipoEmision: values.codigoTipoEmision,
            username: currentUser?.username || '',
            usuario: clienteSeleccionado.nombreRazonSocial || '',
            cajasId: cajaId,
            numeroTarjeta: values.numeroTarjeta || null,
            detalle: values.items.map((item) => ({
                idProducto: item.idProducto,
                cantidad: Number(item.cantidad) || 0,
                montoDescuento: Number(item.descuento) || 0,
            })),
        };

        if (values.codigoTipoEmision === "4") {
            if (values.cafc && values.cafc.trim()) {
                facturaData.cafc = values.cafc.trim();
            }
            emitirContingenciaMutation(facturaData);
        } else {
            emitirFacturaMutation(facturaData);
        }
    };

    const handlePrint = async () => {
        if (!facturaData?.xmlContent) return;

        try {
            const pdfBytes = await generatePDF(facturaData.xmlContent);
            const blob = new Blob([pdfBytes], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);

            const a = document.createElement('a');
            a.href = url;
            a.download = `factura-${facturaData.cuf || 'unknown'}.pdf`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            setShowSendEmailModal(false);
            navigate("/ventas");
        } catch (error) {
            console.error('Error al generar PDF:', error);
            toast.error('Error al generar el PDF');
        }
    };

    const handleSendEmail = async () => {
        try {
            if (!facturaData || !facturaData.pdfBytes) {
                throw new Error("No hay datos de factura para enviar");
            }

            const send = await sendEmail({
                toEmail: facturaData.clienteEmail,
                clienteNombre: facturaData.clienteNombre,
                numeroFactura: facturaData.numeroFactura,
                cuf: facturaData.cuf,
                pdfContent: facturaData.pdfBytes,
            });
            console.log('Email enviado:', send);

            toast.success("Factura enviada por correo");
            setShowSendEmailModal(false);
            navigate("/ventas");
        } catch (error) {
            toast.error(`Error al enviar el correo: ${error.message}`);
        }
    };

    const calcularTotales = (items) => {
        if (!items || !Array.isArray(items)) {
            return { subtotal: 0, descuentos: 0, total: 0 };
        }

        const subtotal = items.reduce((sum, item) =>
            sum + ((item.precioUnitario || 0) * (item.cantidad || 0)), 0);
        const descuentos = items.reduce((sum, item) =>
            sum + (item.descuento || 0), 0);
        return { subtotal, descuentos, total: subtotal - descuentos };
    };

    const { subtotal, descuentos, total } = calcularTotales(initialValuesEmitirFactura.items);

    useEffect(() => {
  if (initialValuesEmitirFactura.codigoTipoMoneda) {
    setTipoCambio(obtenerTipoCambio(initialValuesEmitirFactura.codigoTipoMoneda));
  }
}, [initialValuesEmitirFactura.codigoTipoMoneda]);

    return (
        <div className="facturacion-container">
            <Toaster richColors position="top-center" />

            <h2>Formulario de Facturación</h2>

            {loadingComunicacion && <div className="success-comunicacion">⏳ Verificando comunicación...</div>}
            {isError && <div className="error-comunicacion">❌ Backend caído → Modo contingencia</div>}
            {!loadingComunicacion && !isError && comunicacion?.data && (
                <div className="success-comunicacion">{comunicacion.data}</div>
            )}

            <ClienteForm onClienteSeleccionado={setClienteSeleccionado} />

            <FacturaDetalles
                items={initialValuesEmitirFactura.items}
                subtotal={subtotal}
                descuentos={descuentos}
                total={total}
                codigoMoneda={initialValuesEmitirFactura.codigoTipoMoneda}
                tipoCambio={tipoCambio}
                monedas={monedas?.data || []}
            />
            <Formik
                initialValues={initialValuesEmitirFactura}
                validationSchema={validationSchemaVentas}
                onSubmit={handleSubmitVentas}
                enableReinitialize={true}
            >
                {({ isSubmitting, values, setFieldValue }) => (
                    <Form>
                        <div className="metodo-pago-group">
                            <SelectSecondary
                                label="Método de Pago"
                                name="codigoMetodoPago"
                                required
                                value={values.codigoMetodoPago}
                                onChange={(e) => {
                                    const metodoPago = parseInt(e.target.value);
                                    setFieldValue('codigoMetodoPago', metodoPago);
                                    if (metodoPago !== 2) setFieldValue('numeroTarjeta', '');
                                }}
                            >
                                {metodosPago.map((metodo) => (
                                    <option key={metodo.value} value={metodo.value}>
                                        {metodo.label}
                                    </option>
                                ))}
                            </SelectSecondary>
                            {values.codigoMetodoPago === 2 && (
                                <InputText
                                    label="Número de Tarjeta"
                                    name="numeroTarjeta"
                                    type="text"
                                    value={values.numeroTarjeta || ''}
                                    onChange={(e) => setFieldValue('numeroTarjeta', e.target.value)}
                                />
                            )}
                        </div>

                        <div className="tipo-emision-group">
                            <SelectSecondary
                                label="Tipo de Emisión"
                                name="codigoTipoEmision"
                                required
                                value={values.codigoTipoEmision}
                                onChange={(e) => setFieldValue("codigoTipoEmision", e.target.value)}
                                disabled={isError || comunicacion?.data?.includes("Error al comunicar con SIAT")}
                            >
                                {!loadingEmisiones && emisiones?.data?.map((em) => (
                                    <option key={em.id} value={em.codigoClasificador}>
                                        {em.descripcion}
                                    </option>
                                ))}
                            </SelectSecondary>
                            {(isError || comunicacion?.data?.includes("Error al comunicar con SIAT")) && (
                                <p className="info-text">
                                    Modo automáticamente establecido a {modo} por problemas de conexión
                                </p>
                            )}
                        </div>

                        <div className="tipo-moneda-group">
                            <SelectSecondary
                                label="Tipo de Moneda"
                                name="codigoTipoMoneda"
                                required
                                value={values.codigoTipoMoneda}
                                onChange={(e) => setFieldValue("codigoTipoMoneda", parseInt(e.target.value))}
                            >
                                {!loadingMonedas && monedas?.data?.map((mon) => (
                                    <option key={mon.id} value={mon.codigoClasificador}>
                                        {mon.descripcion}
                                    </option>
                                ))}
                            </SelectSecondary>
                        </div>

                        {values.codigoTipoEmision === "4" && (
                            <InputText
                                label="CAFC (obligatorio en contingencia)"
                                name="cafc"
                                type="text"
                                placeholder="Ingrese el CAFC"
                                value={values.cafc}
                                onChange={(e) => setFieldValue('cafc', e.target.value)}
                            />
                        )}

                        <div className="factura-buttons">
                            <ButtonPrimary
                                type="submit"
                                disabled={isSubmitting || !clienteSeleccionado}
                            >
                                {isSubmitting ? 'Emitiendo...' : 'Emitir Factura'}
                            </ButtonPrimary>
                        </div>
                    </Form>
                )}
            </Formik>

            <Modal isOpen={showSendEmailModal} onClose={() => setShowSendEmailModal(false)}>
                <div className="modal-content">
                    <h3>Factura Generada</h3>
                    <p>¿Qué desea hacer con la factura?</p>
                    <div className="modal-buttons">
                        <ButtonPrimary onClick={handleSendEmail}>Enviar por Email</ButtonPrimary>
                        <ButtonPrimary onClick={handlePrint}>Descargar PDF</ButtonPrimary>
                        <ButtonPrimary variant="secondary" onClick={() => navigate("/ventas")}>
                            Salir
                        </ButtonPrimary>
                    </div>
                </div>
            </Modal>
        </div>
    );
}