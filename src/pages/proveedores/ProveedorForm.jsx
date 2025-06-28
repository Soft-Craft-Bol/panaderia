import React from 'react';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import InputText from '../../components/inputs/InputText';
import ButtonPrimary from '../../components/buttons/ButtonPrimary';
import SelectPrimary from '../../components/selected/SelectPrimary';
import { createProveedor } from '../../service/api'; 

const ProveedorForm = ({ onSuccess, onCancel }) => {
  // Esquema de validación con Yup
  const validationSchema = Yup.object().shape({
    nombreRazonSocial: Yup.string()
      .required('Este campo es requerido')
      .max(100, 'Máximo 100 caracteres'),
    tipoProveedor: Yup.string()
      .required('Seleccione un tipo de proveedor')
      .oneOf(['INDIVIDUAL', 'EMPRESA'], 'Tipo de proveedor inválido'),
    direccion: Yup.string()
      .required('Este campo es requerido')
      .max(200, 'Máximo 200 caracteres'),
    telefono: Yup.number()
      .required('Este campo es requerido')
      .typeError('Debe ser un número')
      .positive('El teléfono debe ser positivo')
      .integer('El teléfono debe ser un número entero'),
    email: Yup.string()
      .email('Ingrese un email válido')
      .required('Este campo es requerido')
      .max(100, 'Máximo 100 caracteres'),
  });

  // Función para manejar el envío del formulario
  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      await createProveedor(values);
      resetForm();
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Error al registrar proveedor:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="form-container">
      <h2>Registrar Nuevo Proveedor</h2>
      
      <Formik
        initialValues={{
          nombreRazonSocial: '',
          tipoProveedor: '',
          direccion: '',
          telefono: '',
          email: '',
        }}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting }) => (
          <Form className="form">
            <InputText
              label="Nombre/Razón Social"
              name="nombreRazonSocial"
              type="text"
              required
              placeholder="Ej: Distribuidora de Alimentos S.A."
            />
            
            <SelectPrimary
              label="Tipo de Proveedor"
              name="tipoProveedor"
              required
            >
              <option value="">Seleccione un tipo</option>
              <option value="INDIVIDUAL">Individual</option>
              <option value="EMPRESA">Empresa</option>
            </SelectPrimary>
            
            <InputText
              label="Dirección"
              name="direccion"
              type="text"
              required
              placeholder="Ej: Av. Principal 123"
            />
            
            <InputText
              label="Teléfono"
              name="telefono"
              type="number"
              required
              placeholder="Ej: 987654321"
            />
            
            <InputText
              label="Email"
              name="email"
              type="email"
              required
              placeholder="Ej: contacto@distrialimentos.com"
            />
            
            <div className="form-actions">
              <ButtonPrimary 
                type="submit" 
                variant="primary" 
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Registrando...' : 'Registrar Proveedor'}
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

export default ProveedorForm;