import { useState, useEffect } from 'react';
import { useFormik } from 'formik';
import { eventoValidationSchema } from '../../schemas/eventoValidations';
import { getCufdAnterior, definirEvento } from '../../service/api';
import { getUser } from '../../utils/authFunctions';
import ButtonPrimary from '../../components/buttons/ButtonPrimary';
import SelectSecondary from '../../components/selected/SelectSecondary';
import InputSecundary from '../../components/inputs/InputSecundary';
import Modal from '../../components/modal/Modal';
import { FaCopy } from 'react-icons/fa';
import { Toaster, toast } from 'sonner';

import './EventForm.css';

const EventoForm = ({ onSuccess, onClose }) => {
    const [cufdsDisponibles, setCufdsDisponibles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [resultado, setResultado] = useState(null);
    const [error, setError] = useState(null);
    const [minFechaFinEvento, setMinFechaFinEvento] = useState('');
    const [showModal, setShowModal] = useState(false);

    const currentUser = getUser();
    const puntoVentaId = currentUser?.puntosVenta[0]?.id;


    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text)
            .then(() => {
                toast.success('Código copiado al portapapeles');
            })
            .catch(err => {
                console.error('Error al copiar: ', err);
            });
    };

    const formik = useFormik({
        initialValues: {
            cufdEvento: '',
            fechaHoraInicioEvento: '',
            fechaHoraFinEvento: '',
            codigoMotivoEvento: '',
            //codigoMotivoEvento: 6,
        },
        validationSchema: eventoValidationSchema,
        onSubmit: handleSubmit,
    });

    async function handleSubmit(values) {
        setLoading(true);
        setError(null);
        setResultado(null);

        try {
            const formatDateForBackend = (dateString) => {
                const date = new Date(dateString);
                const pad = (num) => num.toString().padStart(2, '0');

                return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
            };

            const payload = {
                idPuntoVenta: puntoVentaId,
                codigoMotivoEvento: Number(values.codigoMotivoEvento),
                //codigoMotivoEvento: 3,
                descripcion: getDescripcionMotivo(values.codigoMotivoEvento),
                cufdEvento: values.cufdEvento,
                fechaHoraInicioEvento: formatDateForBackend(values.fechaHoraInicioEvento),
                fechaHoraFinEvento: formatDateForBackend(values.fechaHoraFinEvento)
            };
            const response = await definirEvento(payload);
            console.log('Respuesta del servidor:', response);
            const codigoEvento = response.data?.respuestaSiat?.codigoRecepcionEventoSignificativo;  

            setShowModal(true);
            formik.resetForm();
            if (onSuccess) {
                onSuccess(codigoEvento);
            }
            setCufdsDisponibles([]);
            await fetchCufds();

        } catch (error) {
            console.error('Error al registrar evento:', error);
            setError({
                titulo: 'Error al registrar el evento',
                mensaje: error.response?.data?.message || error.message || 'Ocurrió un error inesperado',
                detalles: error.response?.data?.details || ''
            });
        } finally {
            setLoading(false);
        }
    }

    const fetchCufds = async () => {
        if (!puntoVentaId) return;

        try {
            const { data } = await getCufdAnterior(puntoVentaId);
            const cufdsData = Array.isArray(data) ? data : [data];

            if (cufdsData.length > 0) {
                setCufdsDisponibles(cufdsData);
                const primerCufd = cufdsData[0];
                const fechaInicio = primerCufd?.fechaHoraInicioEvento;

                const fechaInicioEvento = addOneMinute(fechaInicio);

                formik.setValues((prev) => ({
                    ...prev,
                    cufdEvento: primerCufd?.cufdEvento || '',
                    fechaHoraInicioEvento: fechaInicioEvento, 
                }));

                setMinFechaFinEvento(fechaInicioEvento); 
            }
        } catch (error) {
            console.error('Error al obtener CUFDs:', error);
            setCufdsDisponibles([]);
            setError({
                titulo: 'Error al cargar CUFDs',
                mensaje: 'No se pudieron cargar los CUFDs disponibles',
                detalles: error.message
            });
        }
    };

    const formatDateTimeLocal = (dateTimeString) => {
        if (!dateTimeString) return '';

        const date = new Date(dateTimeString);

        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');

        return `${year}-${month}-${day}T${hours}:${minutes}`;
    };

    useEffect(() => {
        fetchCufds();
    }, [puntoVentaId]);

    useEffect(() => {
        if (formik.values.fechaHoraInicioEvento) {
            setMinFechaFinEvento(formik.values.fechaHoraInicioEvento);
        }
    }, [formik.values.fechaHoraInicioEvento]);

    const addOneMinute = (dateTimeString) => {
        if (!dateTimeString) return '';

        const date = new Date(dateTimeString);
        date.setMinutes(date.getMinutes() + 1);

        return formatDateTimeLocal(date.toISOString());
    };

    const formatDateTime = (dateTimeString) => {
        if (!dateTimeString) return '';

        const date = new Date(dateTimeString);

        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');

        return `${year}-${month}-${day}T${hours}:${minutes}`;
    };
    return (
        <div className="evento-container">
            <Toaster position="top-right" richColors />
            <h3 className="evento-title">Registro de Evento Significativo</h3>
            <p className="evento-subtitle">Complete los datos del evento a registrar</p>

            <form onSubmit={formik.handleSubmit} className="evento-form">
                <CufdSection formik={formik} cufdsDisponibles={cufdsDisponibles} puntoVentaId={puntoVentaId} />
                <FechaSection formik={formik} minFechaFinEvento={minFechaFinEvento} />
                <MotivoSection formik={formik} />
                {error && (
                    <div className="error-message">
                        <p>{error.mensaje}</p>
                    </div>
                )}
                <div className="evento-actions">
                    <ButtonPrimary type="submit" disabled={loading || !formik.isValid}>
                        {loading ? 'Registrando...' : 'Registrar Evento'}
                    </ButtonPrimary>
                </div>
            </form>

            {/* Modal para mostrar el resultado */}
            <Modal isOpen={showModal} onClose={() => setShowModal(false)}>
                <div className="modal-content">
                    <h3>{resultado?.mensaje || 'Resultado del evento'}</h3>
                    <div className="resultado-container">
                        <p><strong>Código de recepción:</strong></p>
                        <div className="codigo-container">
                            <span className="codigo-recepcion">
                                {resultado?.codigoRecepcion}
                            </span>
                            <button
                                className="copy-button"
                                onClick={() => copyToClipboard(resultado?.codigoRecepcion)}
                                title="Copiar código"
                            >
                                <FaCopy />
                            </button>
                        </div>
                        <p><strong>Motivo:</strong> {resultado?.motivo}</p>
                    </div>
                    <div className="modal-actions">
                        <ButtonPrimary onClick={() => setShowModal(false)}>
                            Cerrar
                        </ButtonPrimary>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

// Secciones del formulario
const CufdSection = ({ formik, cufdsDisponibles, puntoVentaId }) => (
    <div className="evento-section">
        <h4 className="evento-section-title">Selección de CUFD</h4>
        <SelectSecondary
            label="CUFD Disponible *"
            name="cufdEvento"
            formikCompatible={true}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.cufdEvento}
            error={formik.touched.cufdEvento && formik.errors.cufdEvento}
            disabled={!puntoVentaId || cufdsDisponibles.length === 0}
        >
            <option value="">Seleccione un CUFD</option>
            {cufdsDisponibles.map((cufd) => (
                <option key={cufd.cufdEvento} value={cufd.cufdEvento}>
                    {new Date(cufd.fechaHoraInicioEvento).toLocaleString()} - {cufd.cufdEvento.substring(0, 10)}...
                </option>
            ))}
        </SelectSecondary>
    </div>
);

const FechaSection = ({ formik, minFechaFinEvento }) => {
    const getCurrentDateTimeLocal = () => {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        return `${year}-${month}-${day}T${hours}:${minutes}`;
    };

    useEffect(() => {
        if (!formik.values.fechaHoraFinEvento) {
            formik.setFieldValue('fechaHoraFinEvento', getCurrentDateTimeLocal());
        }
    }, []);

    return (
        <div className="evento-section">
            <h4 className="evento-section-title">Fechas del Evento</h4>
            <InputSecundary
                label="Fecha y Hora de Inicio *"
                name="fechaHoraInicioEvento"
                type="datetime-local"
                formik={formik}
                required
            />
            <InputSecundary
                label="Fecha y Hora de Fin *"
                name="fechaHoraFinEvento"
                type="datetime-local"
                formik={formik}
                required
                min={minFechaFinEvento}
                max={new Date().toISOString().slice(0, 16)}
            />
        </div>
    );
};


const MotivoSection = ({ formik }) => (
    <div className="evento-section">
        <h4 className="evento-section-title">Motivo del Evento</h4>
        <SelectSecondary
            label="Motivo del Evento *"
            name="codigoMotivoEvento"
            formikCompatible={true}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.codigoMotivoEvento}
            error={formik.touched.codigoMotivoEvento && formik.errors.codigoMotivoEvento}
        >
            <option value="">Seleccione un motivo</option>
            <option value="1">1) Corte del servicio de Internet</option>
            <option value="2">2) Inaccesibilidad al Servicio Web de la Administración Tributaria</option>
            <option value="3">3) Ingreso a zonas sin Internet por despliegue de puntos de venta</option>
            <option value="4">4) Venta en Lugares sin internet</option>
            <option value="5">5) Virus informático o falla de software</option>
            <option value="6">6) Cambio de infraestructura de sistema o falla de hardware</option>
            <option value="7">7) Corte de suministro de energía eléctrica</option>
        </SelectSecondary>
    </div>
);

// Funciones auxiliares
const getDescripcionMotivo = (codigo) => {
    const motivos = {
        "1": "CORTE DEL SERVICIO DE INTERNET",
        "2": "INACCESIBILIDAD AL SERVICIO WEB DE LA ADMINISTRACIÓN TRIBUTARIA",
        "3": "INGRESO A ZONAS SIN INTERNET POR DESPLIEGUE DE PUNTOS DE VENTA",
        "4": "VENTA EN LUGARES SIN INTERNET",
        "5": "VIRUS INFORMÁTICO O FALLA DE SOFTWARE",
        "6": "CAMBIO DE INFRAESTRUCTURA DE SISTEMA O FALLA DE HARDWARE",
        "7": "CORTE DE SUMINISTRO DE ENERGÍA ELÉCTRICA"
    };
    return motivos[codigo] || "";
};


export default EventoForm;
