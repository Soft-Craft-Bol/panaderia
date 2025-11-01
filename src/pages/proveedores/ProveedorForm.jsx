import React from 'react';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import InputText from '../../components/inputs/InputText';
import ButtonPrimary from '../../components/buttons/ButtonPrimary';
import SelectPrimary from '../../components/selected/SelectPrimary';
import { createProveedor, updateProveedor } from '../../service/api';
import { toast, Toaster } from 'sonner';
import './ProveedorForm.css';
import SelectSecondary from '../../components/selected/SelectSecondary';

const ProveedorForm = ({ onSuccess, onCancel, proveedor }) => {

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
      .nullable()
      .typeError('Debe ser un número')
      .positive('El teléfono debe ser positivo')
      .integer('El teléfono debe ser un número entero'),
    email: Yup.string()
      .nullable()
      .email('Ingrese un email válido')
      .max(100, 'Máximo 100 caracteres'),
  });

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
     try {
        const dataToSend = {
          ...values,
          telefono: values.telefono || null,
          email: values.email || null
        };

        if (proveedor) {
          await updateProveedor(proveedor.id, dataToSend);
          toast.success('Proveedor actualizado exitosamente');
        } else {
          await createProveedor(dataToSend);
          toast.success('Proveedor registrado exitosamente');
        }

        resetForm();
        onSuccess && onSuccess();
      } catch (error) {
        console.error(error);
        toast.error('Error al guardar proveedor');
      } finally {
        setSubmitting(false);
      }
  };

  return (
    <div className="form-container-proveedor">
      <Toaster />
      <h2>Registrar Nuevo Proveedor</h2>

      <Formik
        initialValues={{
          nombreRazonSocial: proveedor?.nombreRazonSocial || '',
          tipoProveedor: proveedor?.tipoProveedor || '',
          direccion: proveedor?.direccion || '',
          telefono: proveedor?.telefono || '',
          email: proveedor?.email || '',
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

            <SelectSecondary
              label="Tipo de Proveedor"
              name="tipoProveedor"
              required
            >
              <option value="">Seleccione un tipo</option>
              <option value="INDIVIDUAL">Individual</option>
              <option value="EMPRESA">Empresa</option>
            </SelectSecondary>

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
              placeholder="Ej: 987654321"
            />

            <InputText
              label="Email"
              name="email"
              type="email"
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