import React from 'react';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { crearInsumo } from '../../service/api';
import InputText from '../../components/inputs/InputText';
import ButtonPrimary from '../../components/buttons/ButtonPrimary';
import SelectPrimary from '../../components/selected/SelectPrimary';

const InsumoForm = ({ onSuccess, onCancel }) => {
  // Tipos de insumos disponibles
  const TIPOS_INSUMO = [
    { value: 'MATERIA_PRIMA', label: 'Materia Prima' },
    { value: 'INGREDIENTE', label: 'Ingrediente' },
    { value: 'EMPAQUE', label: 'Embalaje/Empaque' },
    { value: 'LIMPIEZA', label: 'Producto de Limpieza' },
    { value: 'OTRO', label: 'Otro' }
  ];

  // Unidades de medida disponibles
  const UNIDADES_MEDIDA = [
    { value: 'kg', label: 'Kilogramos' },
    { value: 'g', label: 'Gramos' },
    { value: 'l', label: 'Litros' },
    { value: 'ml', label: 'Mililitros' },
    { value: 'unidad', label: 'Unidades' },
    { value: 'paquete', label: 'Paquetes' }
  ];

  // Esquema de validación con Yup
  const validationSchema = Yup.object().shape({
    nombre: Yup.string()
      .required('Este campo es requerido')
      .max(100, 'Máximo 100 caracteres'),
    tipo: Yup.string()
      .required('Seleccione un tipo de insumo')
      .oneOf(TIPOS_INSUMO.map(t => t.value)),
    precioActual: Yup.number()
      .required('Este campo es requerido')
      .typeError('Debe ser un número')
      .positive('El precio debe ser positivo')
      .min(0.01, 'El precio mínimo es 0.01'),
    unidades: Yup.string()
      .required('Seleccione una unidad de medida')
      .oneOf(UNIDADES_MEDIDA.map(u => u.value)),
    imagen: Yup.string()
      .nullable()
      .max(255, 'Máximo 255 caracteres')
  });

  // Función para manejar el envío del formulario
  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      await crearInsumo(values);
      resetForm();
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Error al registrar insumo:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="form-container">
      <h2>Registrar Nuevo Insumo</h2>
      
      <Formik
        initialValues={{
          nombre: '',
          tipo: '',
          precioActual: '',
          unidades: '',
          imagen: ''
        }}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting, setFieldValue }) => (
          <Form className="form">
            <InputText
              label="Nombre del Insumo"
              name="nombre"
              type="text"
              required
              placeholder="Ej: Harina de trigo"
            />
            
            <SelectPrimary
              label="Tipo de Insumo"
              name="tipo"
              required
            >
              <option value="">Seleccione un tipo</option>
              {TIPOS_INSUMO.map(tipo => (
                <option key={tipo.value} value={tipo.value}>{tipo.label}</option>
              ))}
            </SelectPrimary>
            
            <InputText
              label="Precio Actual"
              name="precioActual"
              type="number"
              required
              step="0.01"
              min="0.01"
              placeholder="Ej: 25.50"
            />
            
            <SelectPrimary
              label="Unidad de Medida"
              name="unidades"
              required
            >
              <option value="">Seleccione una unidad</option>
              {UNIDADES_MEDIDA.map(unidad => (
                <option key={unidad.value} value={unidad.value}>{unidad.label}</option>
              ))}
            </SelectPrimary>
            
            <div className="file-upload-container">
              <label htmlFor="imagen">Imagen del Insumo (Opcional)</label>
              <input
                id="imagen"
                name="imagen"
                type="file"
                accept="image/*"
                onChange={(event) => {
                  const file = event.currentTarget.files[0];
                  if (file) {
                    setFieldValue("imagen", file.name); // Aquí podrías subir el archivo y guardar la URL
                  }
                }}
              />
            </div>
            
            <div className="form-actions">
              <ButtonPrimary 
                type="submit" 
                variant="primary" 
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Registrando...' : 'Registrar Insumo'}
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

export default InsumoForm;