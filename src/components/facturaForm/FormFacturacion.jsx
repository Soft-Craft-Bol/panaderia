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

const validationSchema = Yup.object().shape({
    nombreRazonSocial: Yup.string().required('Nombre/Razón Social es requerido'),
    codigoTipoDocumentoIdentidad: Yup.number().required('Tipo de Documento es requerido'),
    numeroDocumento: Yup.string().required('Número de Documento es requerido'),
    complemento: Yup.string(),
    codigoCliente: Yup.string().required('Código de Cliente es requerido'),
    email: Yup.string().email('Email inválido').required('Email es requerido'),
    celular: Yup.string().matches(/^[0-9]+$/, 'Solo se permiten números').required('Celular es requerido')
});

const validationSchemaVentas = Yup.object({
    metodoPago: Yup.string().required("Método de pago es requerido"),
});

export default function FormFacturacion() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [editMode, setEditMode] = useState(false);
    const [documentoValue, setDocumentoValue] = useState('');
    const [searchTrigger, setSearchTrigger] = useState(0);
    const [isContingencia, setIsContingencia] = useState(false);
    const [showContingenciaModal, setShowContingenciaModal] = useState(false);
    const [facturaData, setFacturaData] = useState(null);
    const [showSendEmailModal, setShowSendEmailModal] = useState(false);
    const [client, setClient] = useState(null);

    const location = useLocation();
    const { productosSeleccionados, sucursalId, puntoVentaId } = location.state || {};

    const currentUser = getUser();
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
        metodoPago: "",
        cafc: "",
        isContingencia: false,
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
            toast.error(`Error al emitir la factura: ${error.message}`);
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
            toast.error(`Error al emitir factura de contingencia: ${error.message}`);
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
            metodoPago: values.metodoPago || '',
            username: currentUser?.username || '',
            usuario: client.nombreRazonSocial || '',
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

    // Create a safe client data object for Formik
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

            {/* Sección de datos del cliente */}
            <div className="seccion-cliente">
                <h3>Datos del Cliente</h3>
                <Formik
                    initialValues={clientInitialValues}
                    validationSchema={validationSchema}
                    onSubmit={handleSubmit}
                    enableReinitialize
                    key={clienteEncontrado?.id || 'new'} // Force re-mount when client changes
                >
                    {({ isSubmitting, errors, touched, values, setFieldValue }) => (
                        <Form className='cont-new-pat'>
                            <div className='input-side'>
                                <div className="input-group">
                                    <label htmlFor="numeroDocumento">Número de Documento:</label>
                                    <div className="search-container">
                                        <InputText
                                            id="numeroDocumento"
                                            name="numeroDocumento"
                                            type="text"
                                            placeholder="Ingrese número de documento"
                                            value={values.numeroDocumento}
                                            onChange={(e) => handleDocumentChange(e.target.value, setFieldValue)}
                                        />
                                        <ButtonPrimary
                                            type="button"
                                            variant="secondary"
                                            disabled={buscandoCliente || !documentoValue}
                                            onClick={() => setSearchTrigger(prev => prev + 1)}
                                        >
                                            {buscandoCliente ? 'Buscando...' : 'Buscar'}
                                        </ButtonPrimary>
                                    </div>
                                    <ErrorMessage name="numeroDocumento" component="div" className="error-message" />
                                </div>

                                {buscandoCliente && <div className="search-status">Buscando cliente...</div>}

                                {clienteEncontrado && (
                                    <>
                                        <InputText
                                            label="Nombre/Razón Social"
                                            name="nombreRazonSocial"
                                            type="text"
                                            placeholder="Ingrese nombre o razón social"
                                            disabled={!editMode}
                                            value={values.nombreRazonSocial}
                                        />
                                        <InputText
                                            label="Email"
                                            name="email"
                                            type="email"
                                            placeholder="Ingrese email"
                                            disabled={!editMode}
                                            value={values.email}
                                        />
                                        <InputText
                                            label="Número de Celular"
                                            name="celular"
                                            type="text"
                                            placeholder="Ingrese número de celular"
                                            disabled={!editMode}
                                            value={values.celular}
                                        />
                                    </>
                                )}
                                {(!clienteEncontrado || editMode) && (
                                    <>
                                        <InputText
                                            label="Nombre/Razón Social"
                                            name="nombreRazonSocial"
                                            type="text"
                                            placeholder="Ingrese nombre o razón social"
                                            value={values.nombreRazonSocial}
                                        />
                                        <SelectSecondary
                                            label="Tipo de Documento"
                                            name="codigoTipoDocumentoIdentidad"
                                            error={touched.codigoTipoDocumentoIdentidad && errors.codigoTipoDocumentoIdentidad}
                                            required
                                            value={values.codigoTipoDocumentoIdentidad}
                                        >
                                            <option value="">Seleccione un tipo de documento</option>
                                            {documentoIdentidad?.map(doc => (
                                                <option key={doc.id} value={Number(doc.codigoClasificador)}>
                                                    {doc.descripcion}
                                                </option>
                                            ))}
                                        </SelectSecondary>
                                        <InputText
                                            label="Complemento"
                                            name="complemento"
                                            type="text"
                                            placeholder="Ingrese complemento (opcional)"
                                            value={values.complemento}
                                        />
                                        <InputText
                                            label="Código de Cliente"
                                            name="codigoCliente"
                                            type="text"
                                            placeholder="Ingrese código de cliente"
                                            value={values.codigoCliente}
                                        />
                                        <InputText
                                            label="Email"
                                            name="email"
                                            type="email"
                                            placeholder="Ingrese email"
                                            value={values.email}
                                        />
                                        <InputText
                                            label="Número de Celular"
                                            name="celular"
                                            type="text"
                                            placeholder="Ingrese número de celular"
                                            value={values.celular}
                                        />
                                    </>
                                )}
                                <div className="form-actions">
                                    {clienteEncontrado && !editMode && (
                                        <ButtonPrimary
                                            type="button"
                                            variant="secondary"
                                            onClick={() => setEditMode(true)}
                                        >
                                            Editar Datos
                                        </ButtonPrimary>
                                    )}
                                    {editMode && (
                                        <ButtonPrimary
                                            type="button"
                                            variant="secondary"
                                            onClick={() => setEditMode(false)}
                                        >
                                            Cancelar
                                        </ButtonPrimary>
                                    )}
                                    {(editMode || !clienteEncontrado) && (
                                        <ButtonPrimary
                                            type="submit"
                                            disabled={isSubmitting || isSaving}
                                        >
                                            {isSaving ? 'Guardando...' : 'Guardar Cliente'}
                                        </ButtonPrimary>
                                    )}
                                </div>
                            </div>
                        </Form>
                    )}
                </Formik>
            </div>

            {/* Sección de detalles de la factura */}
            <div className="seccion-detalles">
                <h3>Detalles de la Factura</h3>
                <div className="detalles-tabla">
                    <table>
                        <thead>
                            <tr>
                                <th>Producto</th>
                                <th>Cantidad</th>
                                <th>Precio Unitario</th>
                                <th>Descuento</th>
                                <th>Subtotal</th>
                            </tr>
                        </thead>
                        <tbody>
                            {initialValuesEmitirFactura.items.map((item, index) => (
                                <tr key={index}>
                                    <td>{item.item}</td>
                                    <td>{item.cantidad}</td>
                                    <td>Bs {(item.precioUnitario || 0).toFixed(2)}</td>
                                    <td>Bs {(item.descuento || 0).toFixed(2)}</td>
                                    <td>Bs {((item.precioUnitario || 0) * (item.cantidad || 0) - (item.descuento || 0)).toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="resumen-totales">
                    <div className="total-line">
                        <span>Subtotal:</span>
                        <span>Bs {subtotal.toFixed(2)}</span>
                    </div>
                    <div className="total-line">
                        <span>Descuentos:</span>
                        <span>- Bs {descuentos.toFixed(2)}</span>
                    </div>
                    <div className="total-line total-final">
                        <span>Total:</span>
                        <span>Bs {total.toFixed(2)}</span>
                    </div>
                </div>
            </div>

            {/* Sección de método de pago */}
            <div className="seccion-pago">
                <h3>Método de Pago</h3>
                <Formik
                    initialValues={{
                        ...initialValuesEmitirFactura,
                        isContingencia: isContingencia
                    }}
                    validationSchema={validationSchemaVentas}
                    onSubmit={handleSubmitVentas}
                >
                    {({ isSubmitting, values, setFieldValue }) => (
                        <Form>
                            <div className="metodo-pago-group">
                                <SelectSecondary
                                    label="Método de Pago"
                                    name="metodoPago"
                                    required
                                    value={values.metodoPago}
                                >
                                    <option value="">Seleccione un método de pago</option>
                                    <option value="EFECTIVO">Efectivo</option>
                                    <option value="TARJETA">Tarjeta</option>
                                    <option value="TRANSFERENCIA">Transferencia</option>
                                    <option value="BILLETERA MOVIL – PAGO ONLINE">Qr</option>
                                </SelectSecondary>
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