import React, { useState, useEffect } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { getCufdAnterior, definirEvento } from '../../service/api';
import ButtonPrimary from '../../components/buttons/ButtonPrimary';
import SelectSecondary from '../../components/selected/SelectSecondary';
import InputSecundary from '../../components/inputs/InputSecundary';
import './EventForm.css';

const EventoForm = () => {
    const [puntosVenta, setPuntosVenta] = useState([]);
    const [cufdsDisponibles, setCufdsDisponibles] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setPuntosVenta([
            { id: 1, nombre: 'Punto de Venta Central' },
            { id: 2, nombre: 'Punto de Venta Norte' },
            { id: 3, nombre: 'Punto de Venta Sur' },
        ]);
    }, []);

    const formik = useFormik({
        initialValues: {
            idPuntoVenta: '',
            cufdEvento: '',
            fechaHoraInicioEvento: '',
            fechaHoraFinEvento: '',
            codigoMotivoEvento: '',
        },
        validationSchema: Yup.object({
            idPuntoVenta: Yup.number().required('Selecciona un punto de venta'),
            cufdEvento: Yup.string().required('Selecciona un CUFD'),
            fechaHoraInicioEvento: Yup.string().required('Selecciona una fecha de inicio'),
            fechaHoraFinEvento: Yup.string()
                .required('Selecciona una fecha de fin')
                .test('is-greater', 'La fecha fin debe ser mayor a la fecha inicio', function (value) {
                    if (!this.parent.fechaHoraInicioEvento || !value) return true;
                    return new Date(value).getTime() > new Date(this.parent.fechaHoraInicioEvento).getTime();
                })
                .test('not-future', 'La fecha fin no puede ser mayor a hoy', function (value) {
                    if (!value) return true;
                    return new Date(value).getTime() <= new Date().getTime();
                }),
            codigoMotivoEvento: Yup.number().required('Selecciona un motivo de evento'),
        }),
        onSubmit: async (values) => {
            setLoading(true);
            try {
                const payload = {
                    idPuntoVenta: values.idPuntoVenta,
                    cufdEvento: values.cufdEvento,
                    fechaHoraInicioEvento: new Date(values.fechaHoraInicioEvento).toISOString(),
                    fechaHoraFinEvento: new Date(values.fechaHoraFinEvento).toISOString(),
                    codigoMotivoEvento: values.codigoMotivoEvento,
                };

                console.log('Payload enviado:', payload);

                const res = await definirEvento(payload);
                console.log(res);
                alert('Evento registrado correctamente');
                formik.resetForm();
                setCufdsDisponibles([]);
            } catch (error) {
                alert('Error al registrar el evento: ' + (error.message || 'Intente nuevamente'));
            } finally {
                setLoading(false);
            }
        }
    });


    const formatDateTime = (dateTimeString) => {
        if (!dateTimeString) return '';
        const date = new Date(dateTimeString);
        return date.toISOString().replace('Z', ''); // Mantiene la zona horaria local
    };
    ;

    useEffect(() => {
        const fetchCufds = async () => {
            if (!formik.values.idPuntoVenta) {
                setCufdsDisponibles([]);
                return;
            }

            try {
                const { data } = await getCufdAnterior(formik.values.idPuntoVenta);
                const cufdsData = Array.isArray(data) ? data : [data];

                if (cufdsData.length > 0) {
                    setCufdsDisponibles(cufdsData);
                    const primerCufd = cufdsData[0];
                    formik.setValues({
                        ...formik.values,
                        cufdEvento: primerCufd.cufdEvento,
                        fechaHoraInicioEvento: formatDateTime(primerCufd.fechaHoraInicioEvento),
                    });
                }
            } catch (error) {
                console.error('Error al obtener CUFDs:', error);
                setCufdsDisponibles([]);
            }
        };

        fetchCufds();
    }, [formik.values.idPuntoVenta]);

    return (
        <div className="evento-container">
            <h2 className="evento-title">Registro de Evento Significativo</h2>
            <p className="evento-subtitle">Complete los datos del evento a registrar</p>

            <form onSubmit={formik.handleSubmit} className="evento-form">
                <div className="evento-section">
                    <h3 className="evento-section-title">Datos del Punto de Venta</h3>
                    <SelectSecondary
                        label="Punto de Venta *"
                        name="idPuntoVenta"
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        value={formik.values.idPuntoVenta}
                        error={formik.touched.idPuntoVenta && formik.errors.idPuntoVenta}
                    >
                        <option value="">Seleccione un punto de venta</option>
                        {puntosVenta.map((pv) => (
                            <option key={pv.id} value={pv.id}>{pv.nombre}</option>
                        ))}
                    </SelectSecondary>
                </div>

                <div className="evento-section">
                    <h3 className="evento-section-title">Selección de CUFD</h3>
                    <SelectSecondary
                        label="CUFD Disponible *"
                        name="cufdEvento"
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        value={formik.values.cufdEvento}
                        error={formik.touched.cufdEvento && formik.errors.cufdEvento}
                        disabled={!formik.values.idPuntoVenta || cufdsDisponibles.length === 0}
                    >
                        <option value="">Seleccione un CUFD</option>
                        {cufdsDisponibles.map((cufd) => (
                            <option key={cufd.cufdEvento} value={cufd.cufdEvento}>
                                {new Date(cufd.fechaHoraInicioEvento).toLocaleString()} - {cufd.cufdEvento.substring(0, 10)}...
                            </option>
                        ))}
                    </SelectSecondary>
                </div>

                <div className="evento-section">
                    <h3 className="evento-section-title">Fechas del Evento</h3>
                    <InputSecundary
                        label="Fecha y Hora de Inicio *"
                        name="fechaHoraInicioEvento"
                        type="datetime-local"
                        formik={formik}
                        required
                        disabled
                    />
                    <InputSecundary
                        label="Fecha y Hora de Fin *"
                        name="fechaHoraFinEvento"
                        type="datetime-local"
                        formik={formik}
                        required 
                        min={formik.values.fechaHoraInicioEvento}
                        max={formatDateTime(new Date())}
                    />

                </div>

                <div className="evento-section">
                    <h3 className="evento-section-title">Motivo del Evento</h3>
                    <SelectSecondary
                        label="Motivo del Evento *"
                        name="codigoMotivoEvento"
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        value={formik.values.codigoMotivoEvento}
                        error={formik.touched.codigoMotivoEvento && formik.errors.codigoMotivoEvento}
                    >
                        <option value="">Seleccione un motivo</option>
                        <option value="1">Corte del servicio de Internet</option>
                        <option value="2">Inaccesibilidad al Servicio Web</option>
                    </SelectSecondary>
                </div>

                <div className="evento-actions">
                    <ButtonPrimary type="submit" disabled={loading || !formik.isValid}>
                        {loading ? 'Registrando...' : 'Registrar Evento'}
                    </ButtonPrimary>
                </div>
            </form>
        </div>
    );
};

export default EventoForm;
