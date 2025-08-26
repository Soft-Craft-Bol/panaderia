import React, { useState } from 'react';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { createInsumoGenerico, updateInsumoGenerico } from '../../service/api';
import InputText from '../../components/inputs/InputText';
import ButtonPrimary from '../../components/buttons/ButtonPrimary';
import SelectPrimary from '../../components/selected/SelectPrimary';

const InsumoGenericoForm = ({initialData, onSuccess, onCancel }) => {
  const UNIDADES_MEDIDA = [
    { value: 'kg', label: 'Kilogramos' },
    { value: 'g', label: 'Gramos' },
    { value: 'l', label: 'Litros' },
    { value: 'ml', label: 'Mililitros' },
    { value: 'unidad', label: 'Unidades' },
    { value: 'paquete', label: 'Paquetes' }
  ];

  const validationSchema = Yup.object().shape({
    nombre: Yup.string()
      .required('Este campo es requerido')
      .max(100, 'Máximo 100 caracteres'),
    unidadMedida: Yup.string()
      .required('Seleccione una unidad de medida')
      .oneOf(UNIDADES_MEDIDA.map(u => u.value)),
    descripcion: Yup.string()
      .max(500, 'Máximo 500 caracteres')
      .nullable(),
  });

   const initialValues = initialData || {
    nombre: '',
    unidadMedida: '',
    descripcion: '',
    insumosAsociados: []
  };

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      if (initialData) {
        await updateInsumoGenerico(initialData.id, values);
      } else {
        await createInsumoGenerico(values);
      }
      onSuccess();
    } catch (error) {
      console.error('Error al guardar insumo genérico:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="insumo-generico-form-container">
      <h2>{initialData ? 'Editar Insumo Genérico' : 'Registrar Nuevo Insumo Genérico'}</h2>

      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting }) => (
          <Form className="form">
            <div className="form-row">
              <InputText
                label="Nombre del Insumo Genérico"
                name="nombre"
                type="text"
                required
                placeholder="Ej: Harina para pan"
              />
            </div>

            <div className="form-row">
              <SelectPrimary
                label="Unidad de Medida"
                name="unidadMedida"
                required
              >
                <option value="">Seleccione una unidad</option>
                {UNIDADES_MEDIDA.map(unidad => (
                  <option key={unidad.value} value={unidad.value}>{unidad.label}</option>
                ))}
              </SelectPrimary>
            </div>

            <div className="form-row">
              <InputText
                label="Descripción (Opcional)"
                name="descripcion"
                type="text"
                as="textarea"
                rows={3}
                placeholder="Descripción detallada del insumo genérico"
              />
            </div>

            <div className="form-actions">
              <ButtonPrimary
                type="submit"
                variant="primary"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Guardando...' : 'Guardar Insumo Genérico'}
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

      <style jsx>{`
        .insumo-generico-form-container {
          background: var(--color-bg-primary);
          padding: var(--space-lg);
          border-radius: var(--radius-md);
          box-shadow: var(--shadow-md);
          max-width: 600px;
          margin: 0 auto;
        }
        
        h2 {
          color: var(--color-primary);
          margin-bottom: var(--space-lg);
          font-size: var(--font-size-xl);
          text-align: center;
        }
        
        .form {
          display: flex;
          flex-direction: column;
          gap: var(--space-md);
        }
        
        .form-row {
          display: flex;
          flex-direction: column;
          gap: var(--space-sm);
        }
        
        .form-actions {
          display: flex;
          justify-content: flex-end;
          gap: var(--space-sm);
          margin-top: var(--space-md);
        }
        
        @media (min-width: 768px) {
          .form-row {
            flex-direction: row;
          }
          
          .form-row > * {
            flex: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default InsumoGenericoForm;