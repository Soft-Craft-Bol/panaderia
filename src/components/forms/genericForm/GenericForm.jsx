import React, { useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import Swal from 'sweetalert2';
import { resizeImage } from '../../../utils/resizeImage';
import uploadImageToCloudinary from '../../../utils/uploadImageToCloudinary ';
import placeholderImage from '../../../assets/img/pan.jpg'; // Importa la imagen local
import './GenericForm.css'; // Asegúrate de que los estilos estén correctamente importados

const GenericForm = ({
  initialValues,
  validationSchema,
  onSubmit,
  fields,
  title,
  imageUrl,
  isEditing,
  onClose,
  showImageUpload = true,
}) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(imageUrl || placeholderImage); // Usa la imagen local como valor predeterminado
  const [submitError, setSubmitError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
      try {
        const resizedFile = await resizeImage(file);
        setSelectedFile(resizedFile);
        setPreviewUrl(URL.createObjectURL(resizedFile));
      } catch (error) {
        console.error('Error resizing image:', error);
        setSubmitError('Error al procesar la imagen. Intente nuevamente.');
      }
    }
  };

  const handleSubmit = async (values) => {
    setIsSubmitting(true);
    try {
      setSubmitError(null);
      let finalValues = { ...values };
      if (selectedFile) {
        const imageUrl = await uploadImageToCloudinary(selectedFile);
        finalValues.imagen = imageUrl;
      }
      await onSubmit(finalValues);
      Swal.fire({
        title: isEditing ? 'Actualizado exitosamente!' : 'Creado exitosamente!',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false,
      });
      onClose();
    } catch (error) {
      console.error('Error submitting form:', error);
      setSubmitError('Error al procesar el formulario. Intente nuevamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={handleSubmit}
    >
      {({ handleSubmit }) => (
        <Form className="cont-new-pat"> {/* Cambia a cont-new-pat */}
          <div className="img-card"> {/* Cambia a img-card */}
            <h3>Imagen del Producto</h3>
            <img
              src={previewUrl}
              alt="Preview"
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
                accept="image/*"
                onChange={handleFileChange}
                className="file-input"
                style={{ display: 'none' }}
              />
              <button type="button" onClick={() => document.querySelector('.file-input').click()}>
                Subir Imagen
              </button>
            </div>
          </div>
          <div className="input-side"> {/* Cambia a input-side */}
            {fields.map((field) => (
              <div key={field.name} className="input-group"> {/* Cambia a input-group */}
                <label htmlFor={field.name}>{field.label}</label>
                {field.type === 'select' ? (
                  <Field as="select" name={field.name} className="selector-options"> {/* Cambia a selector-options */}
                    <option value="">Seleccione una opción</option>
                    {field.options.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </Field>
                ) : (
                  <Field
                    type={field.type || 'text'}
                    name={field.name}
                    placeholder={field.placeholder}
                    className="input-card" 
                  />
                )}
                <ErrorMessage name={field.name} component="div" className="error-message" />
              </div>
            ))}
            {submitError && <div className="error-message">{submitError}</div>}
            <div className="form-actions"> {/* Cambia a form-actions */}
              <button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Guardando...' : isEditing ? 'Actualizar' : 'Crear'}
              </button>
              <button type="button" onClick={onClose}>
                Cancelar
              </button>
            </div>
          </div>
        </Form>
      )}
    </Formik>
  );
};

export default GenericForm;