import React from 'react';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { createCategoria } from '../../service/api';
import InputText from '../../components/inputs/InputText';
import ButtonPrimary from '../../components/buttons/ButtonPrimary';

const CategoriaForm = ({ onSuccess, onCancel }) => {
  const validationSchema = Yup.object().shape({
    nombre: Yup.string()
      .required('Este campo es requerido')
      .max(100, 'Máximo 100 caracteres'),
    descripcion: Yup.string()
      .max(500, 'Máximo 500 caracteres')
      .nullable(),
  });

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      await createCategoria(values);
      resetForm();
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Error al guardar categoría:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="categoria-form-container">
      <h2>Registrar Nueva Categoría</h2>

      <Formik
        initialValues={{
          nombre: '',
          descripcion: '',
        }}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting }) => (
          <Form className="form">
            <div className="form-row">
              <InputText
                label="Nombre de la Categoría"
                name="nombre"
                type="text"
                required
                placeholder="Ej: Panadería"
              />
            </div>

            <div className="form-row">
              <InputText
                label="Descripción (Opcional)"
                name="descripcion"
                type="text"
                as="textarea"
                rows={3}
                placeholder="Descripción detallada de la categoría"
              />
            </div>

            <div className="form-actions">
              <ButtonPrimary
                type="submit"
                variant="primary"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Guardando...' : 'Guardar Categoría'}
              </ButtonPrimary>

              <ButtonPrimary
                type="button"
                variant="secondary"
                onClick={onCancel}
              >
                Cancelar
              </ButtonPrimary>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default CategoriaForm;
