import React, { useState, useRef,useEffect } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import ImagesApp from '../../../assets/ImagesApp';
import loadImage from '../../../assets/ImagesApp';

import './ItemForm.css';
import { FaFile } from 'react-icons/fa';
import axios from 'axios';
import { createItem, unidadesMedida } from '../../../service/api';
import { useNavigate } from 'react-router-dom';
import uploadImageToCloudinary from '../../../utils/uploadImageToCloudinary ';

const validationSchema = Yup.object().shape({
    descripcion: Yup.string().required('Descripción es requerida'),
    precioUnitario: Yup.number()
        .required('Precio Unitario es requerido')
        .positive('El precio debe ser positivo'),
    unidadMedida: Yup.number(),
    codigoProductoSin: Yup.number()
});

const ItemForm = () => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [submitError, setSubmitError] = useState(null);
    const [unidades, setUnidades] = useState([]);
    const fileInputRef = useRef(null);
    const navigate = useNavigate();

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

  const initialValues = {
    descripcion: '',
    unidadMedida: '',
    precioUnitario: '',
    codigoProductoSin: 234109,
};

  const resizeImage = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const maxWidth = 550;
          const maxHeight = 550;

          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > maxWidth) {
              height = (height * maxWidth) / width;
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width = (width * maxHeight) / height;
              height = maxHeight;
            }
          }
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          canvas.toBlob((blob) => {
            const resizedFile = new File([blob], file.name, { type: file.type });
            resolve(resizedFile);
          }, 'image/jpeg', 0.7);
        };
        img.onerror = (error) => reject(error);
        img.src = e.target.result;
      };
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  };

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
      try {
        const resizedFile = await resizeImage(file);
        setSelectedFile(resizedFile);

        const reader = new FileReader();
        reader.onload = (e) => {
          setPreviewUrl(e.target.result);
        };
        reader.readAsDataURL(resizedFile);
      } catch (error) {
        console.error('Error resizing the image:', error);
      }
    }
  };


  const handleSubmit = async (values, { setSubmitting, setErrors }) => {
    try {
      setSubmitError(null);
      let imageUrl = ImagesApp.defImg;

      if (selectedFile) {
        imageUrl = await uploadImageToCloudinary(selectedFile);
      }

      const data = {
        descripcion: values.descripcion,
        unidadMedida: values.unidadMedida,
        precioUnitario: Number(values.precioUnitario),
        codigoProductoSin: values.codigoProductoSin,
        imagen: imageUrl,
      };
      
      const response = await createItem(data);
      console.log('Form submitted:', response);
      alert('ITEM registrado exitosamente');
      setSelectedFile(null);
      setPreviewUrl(null);
      navigate('/productos');
    } catch (error) {
      console.error('Error submitting form:', error);
      setSubmitError('Error al registrar el producto. Por favor, intente nuevamente.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleFileButtonClick = () => {
    fileInputRef.current.click();
  };

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={handleSubmit}
    >
      {({ isSubmitting, errors, touched }) => (
        <Form className='cont-new-pat'>
          <div className='img-card'>
            <h3>Imagen del Producto</h3>
            <img
              //src={previewUrl || loadImage.defImg}
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
                onChange={handleFileChange}
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
                <Field as="select" name="unidadMedida">
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
                <Field className="input-card" id="codigoProductoSin" name="codigoProductoSin" type="number" disabled />
                <ErrorMessage name="codigoProductoSin" component="div" className="error-message" />
            </div>
            {submitError && <div className="error-message">{submitError}</div>}
            <button type="submit" disabled={isSubmitting} >
                {isSubmitting ? 'Guardando...' : 'Añadir nuevo producto / item'}
            </button>
          </div>
        </Form>
      )}
    </Formik>
  );
};
export default ItemForm;