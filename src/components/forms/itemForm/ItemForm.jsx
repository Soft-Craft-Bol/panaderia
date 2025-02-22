import React, { useState, useRef, useEffect } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import loadImage from '../../../assets/ImagesApp';
import './ItemForm.css';
import { FaFile } from 'react-icons/fa';
import { createItem, unidadesMedida, getItemID, updateItem, getProductoServicio } from '../../../service/api';
import { useNavigate, useParams } from 'react-router-dom';
import uploadImageToCloudinary from '../../../utils/uploadImageToCloudinary ';
import { handleFileChange } from '../../../utils/handleFileChange';

const validationSchema = Yup.object().shape({
    descripcion: Yup.string().required('Descripción es requerida'),
    precioUnitario: Yup.number()
        .required('Precio Unitario es requerido')
        .positive('El precio debe ser positivo'),
    unidadMedida: Yup.number(),
    codigoProductoSin: Yup.number().required('Código Producto SIN es requerido'),
    cantidad: Yup.number()
        .positive('Cantidad debe ser positiva'),
});

const ItemForm = () => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [submitError, setSubmitError] = useState(null);
    const [unidades, setUnidades] = useState([]);
    const [codigoProductoSin, setCodigoProductoSin] = useState([]);
    const fileInputRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProductoServicio = async () => {
            try {
                const response = await getProductoServicio();
                setCodigoProductoSin(response.data);
            } catch (error) {
                console.error('Error fetching producto servicio', error);
            }
        };
        fetchProductoServicio();
    }, []);

    useEffect(() => {
        const fetchUnidades = async () => {
            try {
                const response = await unidadesMedida();
                setUnidades(response.data);
            } catch (error) {
                console.error('Error fetching unidades de medida', error);
            }
        };
        fetchUnidades();
    }, []);

    useEffect(() => {
        const loadDefaultImage = async () => {
            const defaultImage = await loadImage('defImg');
            setPreviewUrl(defaultImage.default);
        };
        loadDefaultImage();
    }, []);

    const { id } = useParams();
    const [initialValues, setInitialValues] = useState({
        descripcion: "",
        unidadMedida: "",
        precioUnitario: "",
        codigoProductoSin: 234109,
        imagen: "",
        cantidad: 0,
        codigo: "",
    });

    useEffect(() => {
        if (id) {
            const fetchProduct = async () => {
                try {
                    const response = await getItemID(id);
                    setInitialValues({
                        descripcion: response.data.descripcion || "",
                        unidadMedida: response.data.unidadMedida || "",
                        precioUnitario: response.data.precioUnitario || "",
                        codigoProductoSin: response.data.codigoProductoSin || 234109,
                        cantidad: response.data.cantidad || 0,
                        imagen: response.data.imagen || "",
                        codigo: response.data.codigo,
                    });
                    setPreviewUrl(response.data.imagen);
                } catch (error) {
                    console.error("Error cargando el producto:", error);
                }
            };
            fetchProduct();
        }
    }, [id]);

    const handleSubmit = async (values, { setSubmitting, setErrors }) => {
        try {
            setSubmitError(null);
            let imageUrl = previewUrl;

            if (selectedFile) {
                imageUrl = await uploadImageToCloudinary(selectedFile);
            }

            const data = {
                descripcion: values.descripcion,
                unidadMedida: values.unidadMedida,
                precioUnitario: Number(values.precioUnitario),
                cantidad: Number(values.cantidad),
                codigoProductoSin: Number(values.codigoProductoSin), // Asegúrate de que sea un número
                imagen: imageUrl,
                codigo: id ? values.codigo : undefined,
            };

            if (id) {
                await updateItem(id, data);
                alert("Producto actualizado exitosamente");
            } else {
                await createItem(data);
                alert("ITEM registrado exitosamente");
            }

            navigate("/productos");
        } catch (error) {
            console.error("Error al guardar el producto:", error);
            setSubmitError("Error al registrar o actualizar el producto. Intente nuevamente.");
        } finally {
            setSubmitting(false);
        }
    };

    const handleFileButtonClick = () => {
        fileInputRef.current.click();
    };

    return (
        <Formik
            enableReinitialize
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
        >
            {({ isSubmitting, errors, touched }) => (
                <Form className='cont-new-pat'>
                    <div className='img-card'>
                        <h3>Imagen del Producto</h3>
                        <img
                            src={previewUrl}
                            alt="Producto"
                            style={{
                                height: '80%',
                                width: '80%',
                                objectFit: 'cover',
                                objectPosition: 'center',
                                borderRadius: '30px',
                            }}
                        />
                        <div>
                            <input
                                type="file"
                                ref={fileInputRef}
                                accept="image/*"
                                style={{ display: 'none' }}
                                onChange={(event) => handleFileChange(event, setSelectedFile, setPreviewUrl)} // Usa la función handleFileChange
                            />
                            <button
                                type="button"
                                onClick={handleFileButtonClick}
                                disabled={isSubmitting}
                            >
                                <FaFile />
                                <p>Subir Imagen</p>
                            </button>
                        </div>
                    </div>
                    <div className='input-side'>
                        <div className="input-group">
                            <label htmlFor="descripcion">Descripción:</label>
                            <Field className="input-card" id="descripcion" name="descripcion" type="text" placeholder="Ingrese una breve descripción del producto" />
                            <ErrorMessage name="descripcion" component="div" className="error-message" />
                        </div>
                        <div className="input-group">
                            <label htmlFor="unidadMedida">Unidad de Medida:</label>
                            <Field as="select" name="unidadMedida" className="selector-options">
                                <option value="">Seleccione una unidad</option>
                                {unidades.map((unidad) => (
                                    <option key={unidad.id} value={unidad.codigoClasificador}>
                                        {unidad.descripcion}
                                    </option>
                                ))}
                            </Field>
                            <ErrorMessage name="unidadMedida" component="div" className="error-message" />
                        </div>
                        <div className="input-group">
                            <label htmlFor="precioUnitario">Precio Unitario (Bs.)</label>
                            <Field className="input-card" id="precioUnitario" name="precioUnitario" type="number" />
                            <ErrorMessage name="precioUnitario" component="div" className="error-message" />
                        </div>
                        <div className="input-group">
                            <label htmlFor="codigoProductoSin">Código Producto SIN</label>
                            <Field as="select" name="codigoProductoSin" className="selector-options">
                                <option value="">Seleccione codigo producto SIN</option>
                                {codigoProductoSin.map((codProd) => (
                                    <option key={codProd.codigoProducto} value={codProd.codigoProducto}>
                                        {codProd.descripcionProducto}
                                    </option>
                                ))}
                            </Field>
                            <ErrorMessage name="codigoProductoSin" component="div" className="error-message" />
                        </div>
                        <div className="input-group">
                            <label htmlFor="cantidad">Cantidad Inicial:</label>
                            <Field className="input-card" id="cantidad" name="cantidad" type="number" />
                            <ErrorMessage name="cantidad" component="div" className="error-message" />
                        </div>
                        {submitError && <div className="error-message">{submitError}</div>}
                        <button type="submit" disabled={isSubmitting}>
                            {id ? "Actualizar producto" : "Añadir nuevo producto / item"}
                        </button>
                    </div>
                </Form>
            )}
        </Formik>
    );
};

export default ItemForm;