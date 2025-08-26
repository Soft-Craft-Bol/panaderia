import React from 'react';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import InputText from '../../components/inputs/InputText';
import ButtonPrimary from '../../components/buttons/ButtonPrimary';
import SelectPrimary from '../../components/selected/SelectPrimary';
import { asignarInsumoSucursal } from '../../service/api';
import { useSucursales } from '../../hooks/useSucursales';

const AsignarInsumoSucursalForm = ({ idInsumo, insumoNombre, onSuccess, onCancel }) => {
  const { data: sucursales, isLoading, error } = useSucursales();

const validationSchema = Yup.object().shape({
  sucursalId: Yup.number()
    .required('Seleccione una sucursal')
    .positive('ID de sucursal inválido'),

  cantidad: Yup.number()
    .required('Este campo es requerido')
    .typeError('Debe ser un número')
    .positive('La cantidad debe ser positiva')
    .test('is-decimal', 'Solo se permiten hasta 2 decimales', value =>
      value === undefined || /^\d+(\.\d{1,2})?$/.test(value.toString())
    ),

  stockMinimo: Yup.number()
    .required('Este campo es requerido')
    .typeError('Debe ser un número')
    .positive('El stock mínimo debe ser positivo')
    .lessThan(Yup.ref('cantidad'), 'El stock mínimo debe ser menor que la cantidad')
    .test('is-decimal', 'Solo se permiten hasta 2 decimales', value =>
      value === undefined || /^\d+(\.\d{1,2})?$/.test(value.toString())
    ),

  fechaVencimiento: Yup.date()
    .nullable()
    .min(new Date(), 'La fecha de vencimiento debe ser futura')
});


  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      const dataToSend = {
        ...values,
        insumoId: idInsumo,
        fechaVencimiento: values.fechaVencimiento || null
      };

      await asignarInsumoSucursal(dataToSend, idInsumo);
      resetForm();
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Error al asignar insumo a sucursal:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="form-container-asignacion">
      <h2 className="form-title">Asignar Insumo a Sucursal</h2>
      <p className="insumo-info-text">Insumo: <span className="insumo-name">{insumoNombre}</span></p>

      <Formik
        initialValues={{
          sucursalId: '',
          cantidad: '',
          stockMinimo: '',
          fechaVencimiento: ''
        }}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting }) => (
          <Form className="asignacion-form">
            {isLoading ? (
              <div className="loading-state">
                <p>Cargando sucursales...</p>
              </div>
            ) : error ? (
              <div className="error-state">
                <p>Error al cargar sucursales</p>
              </div>
            ) : (
              <SelectPrimary
                label="Sucursal"
                name="sucursalId"
                required
                className="form-select"
              >
                <option value="">Seleccione una sucursal</option>
                {sucursales.map(sucursal => (
                  <option key={sucursal.id} value={sucursal.id}>
                    {sucursal.nombre}
                  </option>
                ))}
              </SelectPrimary>
            )}

            <div className="form-field-group">
              <InputText
                label="Cantidad"
                name="cantidad"
                type="number"
                required
                step="0.01"
                min="0.01"
                placeholder="Ej: 100.00"
                className="form-input"
              />

              <InputText
                label="Stock Mínimo"
                name="stockMinimo"
                type="number"
                required
                step="0.01"
                min="0.01"
                placeholder="Ej: 20.50"
                className="form-input"
              />

            </div>

            <InputText
              label="Fecha de Vencimiento (Opcional)"
              name="fechaVencimiento"
              type="date"
              min={new Date().toISOString().split('T')[0]}
              className="form-input"
            />

            <div className="form-actioxns-container">
              <ButtonPrimary
                type="submit"
                variant="primary"
                disabled={isSubmitting || isLoading}
              >
                {isSubmitting ? 'Asignando...' : 'Asignar a Sucursal'}
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

export default AsignarInsumoSucursalForm;