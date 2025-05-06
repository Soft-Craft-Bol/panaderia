import React, { useState, useEffect } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import loadImage from '../../../assets/ImagesApp';
import { createClient, getDocumentoIdentidad } from '../../../service/api';
import { useNavigate, useLocation } from 'react-router-dom';
import SelectSecondary from '../../selected/SelectSecondary';
import '../itemForm/ItemForm.css';

const validationSchema = Yup.object().shape({
    nombreRazonSocial: Yup.string().required('Nombre/Razón Social es requerido'),
    codigoTipoDocumentoIdentidad: Yup.number().required('Tipo de Documento es requerido'),
    numeroDocumento: Yup.string().required('Número de Documento es requerido'),
    complemento: Yup.string(),
    codigoCliente: Yup.string().required('Código de Cliente es requerido'),
    email: Yup.string().email('Email inválido').required('Email es requerido'),
    celular: Yup.string().matches(/^[0-9]+$/, 'Solo se permiten números').required('Celular es requerido')
});

const ClientForm = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [submitError, setSubmitError] = useState(null);
    const [documentosIdentidad, setDocumentosIdentidad] = useState([]);
    const [imageUrl, setImageUrl] = useState(null);

    // Obtener datos prellenados de la ubicación
    const prefillData = location.state?.prefillData || {};
    const redirectTo = location.state?.redirectTo || '/clientes';
    const redirectState = location.state?.redirectState || {};

    useEffect(() => {
        const fetchDocumentosIdentidad = async () => {
            try {
                const response = await getDocumentoIdentidad();
                setDocumentosIdentidad(response.data);
            } catch (error) {
                console.error('Error fetching documentos identidad:', error);
            }
        };

        fetchDocumentosIdentidad();
    }, []);

    useEffect(() => {
        const fetchImage = async () => {
            try {
                const image = await loadImage('panadero');
                setImageUrl(image.default);
            } catch (error) {
                console.error('Error loading image', error);
            }
        };

        fetchImage();
    }, []);

    const initialValues = {
        nombreRazonSocial: '',
        codigoTipoDocumentoIdentidad: '',
        numeroDocumento: prefillData.numeroDocumento || '',
        complemento: '',
        codigoCliente: '',
        email: '',
        celular: '',
        ...prefillData 
    };

    const handleSubmit = async (values, { setSubmitting }) => {
        try {
            setSubmitError(null);
            console.log('Valores del formulario antes de enviar:', values);
            const clientData = {
                nombreRazonSocial: values.nombreRazonSocial,
                codigoTipoDocumentoIdentidad: Number(values.codigoTipoDocumentoIdentidad),
                numeroDocumento: values.numeroDocumento,
                complemento: values.complemento,
                codigoCliente: values.codigoCliente,
                email: values.email,
                celular: values.celular
            };
            console.log('Datos del cliente a enviar:', clientData);
            const response = await createClient(clientData);
            
            if (response.status === 200 || response.status === 201) {
                alert('Cliente registrado exitosamente');
                
                if (redirectTo) {
                    navigate(redirectTo, { 
                        state: { 
                            client: response.data,
                            ...redirectState
                        } 
                    });
                } else {
                    navigate('/clientes');
                }
            } else {
                throw new Error('Error al crear el cliente');
            }
        } catch (error) {
            console.error('Error submitting form:', error);
            setSubmitError('Error al registrar el cliente. Por favor, intente nuevamente.');
        } finally {
            setSubmitting(false);
        }
    };

    if (!imageUrl) {
        return <div>Cargando...</div>;
    }

    return (
        <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
        >
            {({ isSubmitting, errors, touched }) => (
                <Form className='cont-new-pat'>
                    <div className='img-card'>
                        <h3>Registro del cliente</h3>
                        <img
                            src={imageUrl}
                            alt="Cliente"
                            style={{
                                height: '100%',
                                width: '80%',
                                objectFit: 'cover',
                                objectPosition: 'center',
                                borderRadius: '30px',
                            }}
                        />
                    </div>

                    <div className='input-side'>
                        <div className="input-group">
                            <label htmlFor="nombreRazonSocial">Nombre/Razón Social:</label>
                            <Field
                                className="input-card"
                                id="nombreRazonSocial"
                                name="nombreRazonSocial"
                                type="text"
                                placeholder="Ingrese nombre o razón social"
                            />
                            <ErrorMessage name="nombreRazonSocial" component="div" className="error-message" />
                        </div>

                        <SelectSecondary
    label="Tipo de Documento"
    name="codigoTipoDocumentoIdentidad"
    error={touched.codigoTipoDocumentoIdentidad && errors.codigoTipoDocumentoIdentidad}
    required
>
    <option value="">Seleccione un tipo de documento</option>
    {documentosIdentidad.map(doc => {
        return (
            <option key={doc.id} value={Number(doc.codigoClasificador)}>
                {doc.descripcion}
            </option>
        );
    })}
</SelectSecondary>
                        <div className="input-group">
                            <label htmlFor="numeroDocumento">Número de Documento:</label>
                            <Field
                                className="input-card"
                                id="numeroDocumento"
                                name="numeroDocumento"
                                type="text"
                                placeholder="Ingrese número de documento"
                            />
                            <ErrorMessage name="numeroDocumento" component="div" className="error-message" />
                        </div>

                        <div className="input-group">
                            <label htmlFor="complemento">Complemento:</label>
                            <Field
                                className="input-card"
                                id="complemento"
                                name="complemento"
                                type="text"
                                placeholder="Ingrese complemento (opcional)"
                            />
                            <ErrorMessage name="complemento" component="div" className="error-message" />
                        </div>

                        <div className="input-group">
                            <label htmlFor="codigoCliente">Código de Cliente:</label>
                            <Field
                                className="input-card"
                                id="codigoCliente"
                                name="codigoCliente"
                                type="text"
                                placeholder="Ingrese código de cliente"
                            />
                            <ErrorMessage name="codigoCliente" component="div" className="error-message" />
                        </div>

                        <div className="input-group">
                            <label htmlFor="email">Email:</label>
                            <Field
                                className="input-card"
                                id="email"
                                name="email"
                                type="email"
                                placeholder="Ingrese email"
                            />
                            <ErrorMessage name="email" component="div" className="error-message" />
                        </div>

                        <div className="input-group">
                            <label htmlFor="celular">Número de Celular:</label>
                            <Field
                                className="input-card"
                                id="celular"
                                name="celular"
                                type="text"
                                placeholder="Ingrese número de celular"
                            />
                            <ErrorMessage name="celular" component="div" className="error-message" />
                        </div>

                        {submitError && <div className="error-message">{submitError}</div>}

                        <button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? 'Guardando...' : 'Registrar Cliente'}
                        </button>
                    </div>
                </Form>
            )}
        </Formik>
    );
};

export default ClientForm;