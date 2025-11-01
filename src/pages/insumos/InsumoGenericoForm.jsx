import React, { useState } from 'react';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { createInsumoGenerico, updateInsumoGenerico } from '../../service/api';
import InputText from '../../components/inputs/InputText';
import ButtonPrimary from '../../components/buttons/ButtonPrimary';
import SelectSecondary from '../../components/selected/SelectSecondary';

const InsumoGenericoForm = ({initialData, onSuccess, onCancel }) => {
  const UNIDADES_MEDIDA = [
    { value: 'kg', label: 'Kilogramos' },
    { value: 'g', label: 'Gramos' },
    { value: 'l', label: 'Litros' },
    { value: 'ml', label: 'Mililitros' },
    { value: 'unidad', label: 'Unidades' },
    { value: 'paquete', label: 'Paquetes' },
    { value: 'rollo', label: 'Rollo' }
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
              <SelectSecondary
                label="Unidad de Medida"
                name="unidadMedida"
                required
              >
                <option value="">Seleccione una unidad</option>
                {UNIDADES_MEDIDA.map(unidad => (
                  <option key={unidad.value} value={unidad.value}>{unidad.label}</option>
                ))}
              </SelectSecondary>
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
                {isSubmitting ? 'Guardando...' : 'Guardar'}
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

export default InsumoGenericoForm;