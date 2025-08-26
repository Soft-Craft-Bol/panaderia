import React, { useEffect, useState, useCallback } from 'react';
import './FormFacturacion.css';
import {
    createClient,
    getDocumentoIdentidad,
    buscarCliente as apiBuscarCliente,
    emitirFactura,
    emitirContingencia,
    sendEmail,
} from '../../service/api';
import { getUser } from "../../utils/authFunctions";
import { ErrorMessage, Field, Formik, Form } from 'formik';
import * as Yup from 'yup';
import SelectSecondary from '../selected/SelectSecondary';
import { toast, Toaster } from 'sonner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocation, useNavigate } from 'react-router-dom';
import { generatePDF } from '../../utils/generatePDF';
import ButtonPrimary from '../buttons/ButtonPrimary';
import Modal from '../modal/Modal';
import InputText from '../inputs/InputText';
import FacturaDetalles from './FacturaDetalles';
import ClienteForm from './ClienteForm';

const validationSchema = Yup.object().shape({
    nombreRazonSocial: Yup.string().required('Nombre/Razón Social es requerido'),
    codigoTipoDocumentoIdentidad: Yup.number().required('Tipo de Documento es requerido'),
    numeroDocumento: Yup.string().required('Número de Documento es requerido'),
    complemento: Yup.string(),
    codigoCliente: Yup.string().required('Código de Cliente es requerido'),
    email: Yup.string().email('Email inválido').required('Email es requerido'),
    celular: Yup.string().matches(/^[0-9]+$/, 'Solo se permiten números').required('Celular es requerido'),
    codigoMetodoPago: Yup.number().required("Método de pago es requerido"),
});

const validationSchemaVentas = Yup.object({
    metodoPago: Yup.string().required("Método de pago es requerido"),
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
    const queryClient = useQueryClient();
    const [editMode, setEditMode] = useState(false);
    const [documentoValue, setDocumentoValue] = useState('');
    const [searchTrigger, setSearchTrigger] = useState(0);
    const [isContingencia, setIsContingencia] = useState(true);
    const [showContingenciaModal, setShowContingenciaModal] = useState(false);
    const [facturaData, setFacturaData] = useState(null);
    const [showSendEmailModal, setShowSendEmailModal] = useState(false);
    const [client, setClient] = useState(null);

    const location = useLocation();
    const { productosSeleccionados, sucursalId, puntoVentaId } = location.state || {};

    const currentUser = getUser();
    console.log(currentUser);
    const cajaId = currentUser?.cajasAbiertas[0]?.id;
    const puntosDeVenta = currentUser?.puntosVenta ? currentUser.puntosVenta[0].id : null;

    // Ensure initial values are never null or undefined
    const initialValues = {
        nombreRazonSocial: '',
        codigoTipoDocumentoIdentidad: '',
        numeroDocumento: '',
        complemento: '',
        codigoCliente: '',
        email: '',
        celular: '',
    };

    const initialValuesEmitirFactura = {
        metodoPago: "EFECTIVO",
        cafc: "",
        isContingencia: true,
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

    // Consultas para obtener datos
    const { data: documentoIdentidad } = useQuery({
        queryKey: ['documentosIdentidad'],
        queryFn: getDocumentoIdentidad,
        select: (response) => response.data
    });
    console.log(documentoIdentidad);
    const { data: clienteEncontrado, isFetching: buscandoCliente } = useQuery({
        queryKey: ['cliente', documentoValue, searchTrigger],
        queryFn: () => apiBuscarCliente(documentoValue),
        enabled: !!documentoValue && documentoValue.length >= 6,
        select: (response) => response.data
    });

    // Mutaciones
    const { mutate: saveClient, isPending: isSaving } = useMutation({
        mutationFn: createClient,
        onSuccess: (data) => {
            toast.success('Cliente guardado exitosamente');
            queryClient.invalidateQueries(['cliente']);
            setEditMode(false);
            setClient(data.data);
        },
        onError: (error) => {
            toast.error('Error al guardar cliente');
            console.error('Error submitting form:', error);
        }
    });

    const { mutate: emitirFacturaMutation } = useMutation({
        mutationFn: emitirFactura,
        onSuccess: async (response) => {
            const { data } = response;
            console.log('Factura emitida:', data);

            try {
                const pdfBytes = await generatePDF(data.xmlContent);
                setFacturaData({
                    ...data,
                    pdfBytes: Array.from(new Uint8Array(pdfBytes)),
                    clienteNombre: client?.nombreRazonSocial || '',
                    clienteEmail: client?.email || '',
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
            console.log('Factura de contingencia emitida:', data);

            try {
                const pdfBytes = await generatePDF(data.xmlContent);
                setFacturaData({
                    ...data,
                    pdfBytes: Array.from(new Uint8Array(pdfBytes)),
                    clienteNombre: client?.nombreRazonSocial || '',
                    clienteEmail: client?.email || '',
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

    // Use useCallback to prevent unnecessary re-renders
    const handleDocumentChange = useCallback((value, setFieldValue) => {
        setDocumentoValue(value || '');
        setFieldValue('numeroDocumento', value || '');
    }, []);

    // Efectos
    useEffect(() => {
        if (clienteEncontrado) {
            setEditMode(false);
            setClient(clienteEncontrado);
        }
    }, [clienteEncontrado]);

    // Handlers
    const handleSubmit = async (values) => {
        const clientData = {
            nombreRazonSocial: values.nombreRazonSocial || '',
            codigoTipoDocumentoIdentidad: Number(values.codigoTipoDocumentoIdentidad) || 0,
            numeroDocumento: values.numeroDocumento || '',
            complemento: values.complemento || '',
            codigoCliente: values.codigoCliente || '',
            email: values.email || '',
            celular: values.celular || ''
        };
        saveClient(clientData);
    };

    const handleSubmitVentas = async (values) => {
        if (!client) {
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
            idCliente: client.id,
            tipoComprobante: "FACTURA",
            codigoMetodoPago: values.codigoMetodoPago,
            username: currentUser?.username || '',
            usuario: client.nombreRazonSocial || '',
            cajasId: cajaId,
            numeroTarjeta: values.numeroTarjeta || null,
            detalle: values.items.map((item) => {
                const selectedItem = productosSeleccionados.find(p => p.id === item.idProducto);
                return {
                    idProducto: selectedItem?.id || 0,
                    cantidad: Number(item.cantidad) || 0,
                    montoDescuento: Number(item.descuento) || 0,
                };
            }),
        };

        // Solo agregar cafc si tiene un valor válido (no vacío y no solo espacios en blanco)
        if (isContingencia && values.cafc && values.cafc.trim() !== '') {
            facturaData.cafc = values.cafc.trim();
        }

        if (isContingencia) {
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

        const total = subtotal - descuentos;

        return { subtotal, descuentos, total };
    };

    const { subtotal, descuentos, total } = calcularTotales(initialValuesEmitirFactura.items);

    const clientInitialValues = clienteEncontrado ? {
        nombreRazonSocial: clienteEncontrado.nombreRazonSocial || '',
        codigoTipoDocumentoIdentidad: clienteEncontrado.codigoTipoDocumentoIdentidad || '',
        numeroDocumento: clienteEncontrado.numeroDocumento || '',
        complemento: clienteEncontrado.complemento || '',
        codigoCliente: clienteEncontrado.codigoCliente || '',
        email: clienteEncontrado.email || '',
        celular: clienteEncontrado.celular || '',
    } : initialValues;

    return (
        <div className="facturacion-container">
            <Toaster richColors position="top-center" />

            <h2>Formulario de Facturación</h2>

            <ClienteForm
                initialValues={clientInitialValues}
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
                documentoIdentidad={documentoIdentidad}
                clienteEncontrado={clienteEncontrado}
                buscandoCliente={buscandoCliente}
                documentoValue={documentoValue}
                handleDocumentChange={handleDocumentChange}
                setSearchTrigger={setSearchTrigger}
                editMode={editMode}
                setEditMode={setEditMode}
                isSaving={isSaving}
            />

            {/* Sección de detalles de la factura */}
            <FacturaDetalles
                items={initialValuesEmitirFactura.items}
                subtotal={subtotal}
                descuentos={descuentos}
                total={total}
            />

            {/* Sección de método de pago */}
            <div className="seccion-pago">
                <h3>Método de Pago</h3>
                <Formik
                    initialValues={{
                        ...initialValuesEmitirFactura,
                        isContingencia: isContingencia,
                        codigoMetodoPago: 1,
                        numeroTarjeta: null
                    }}
                    validationSchema={validationSchemaVentas}
                    onSubmit={handleSubmitVentas}
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
                                        if (metodoPago !== 2) {
                                            setFieldValue('numeroTarjeta', null);
                                        }
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
                                        placeholder="Ingrese el número de tarjeta"
                                        value={values.numeroTarjeta || ''}
                                        onChange={(e) => setFieldValue('numeroTarjeta', e.target.value)}
                                    />
                                )}
                            </div>

                            <div className="contingencia-options">
                                <label className="contingencia-label">
                                    <input
                                        type="checkbox"
                                        checked={isContingencia}
                                        onChange={(e) => {
                                            const checked = e.target.checked;
                                            setIsContingencia(checked);
                                            setFieldValue('isContingencia', checked);
                                            if (checked) {
                                                setShowContingenciaModal(true);
                                            }
                                        }}
                                    />
                                    Emitir en contingencia
                                </label>

                                {isContingencia && (
                                    <InputText
                                        label="CAFC (Código de Autorización de Facturación por Contingencia - Opcional)"
                                        name="cafc"
                                        type="text"
                                        placeholder="Ingrese el CAFC (opcional)"
                                        value={values.cafc}
                                    />
                                )}
                            </div>

                            <div className="factura-buttons">
                                <ButtonPrimary
                                    type="submit"
                                    disabled={isSubmitting || !client}
                                >
                                    {isSubmitting ? 'Emitiendo...' : 'Emitir Factura'}
                                </ButtonPrimary>
                            </div>
                        </Form>
                    )}
                </Formik>
            </div>

            {/* Modal de confirmación de contingencia */}
            <Modal isOpen={showContingenciaModal} onClose={() => setShowContingenciaModal(false)}>
                <div className="modal-content">
                    <h3>Confirmar Emisión en Contingencia</h3>
                    <p>¿Está seguro que desea emitir esta factura en modo contingencia?</p>
                    <p>Puede proporcionar un CAFC (Código de Autorización de Facturación por Contingencia) si lo tiene disponible.</p>
                    <div className="modal-buttons">
                        <ButtonPrimary onClick={() => setShowContingenciaModal(false)}>
                            Confirmar
                        </ButtonPrimary>
                        <ButtonPrimary
                            variant="secondary"
                            onClick={() => {
                                setIsContingencia(false);
                                setShowContingenciaModal(false);
                            }}
                        >
                            Cancelar
                        </ButtonPrimary>
                    </div>
                </div>
            </Modal>

            {/* Modal de envío de factura */}
            <Modal isOpen={showSendEmailModal} onClose={() => setShowSendEmailModal(false)}>
                <div className="modal-content">
                    <h3>Factura Generada</h3>
                    <p>¿Qué desea hacer con la factura?</p>
                    <div className="modal-buttons">
                        <ButtonPrimary onClick={handleSendEmail}>
                            Enviar por Email
                        </ButtonPrimary>
                        <ButtonPrimary onClick={handlePrint}>
                            Imprimir PDF
                        </ButtonPrimary>
                        <ButtonPrimary
                            variant="secondary"
                            onClick={() => {
                                setShowSendEmailModal(false);
                                navigate("/ventas");
                            }}
                        >
                            Salir
                        </ButtonPrimary>
                    </div>
                </div>
            </Modal>
        </div>
    );
}