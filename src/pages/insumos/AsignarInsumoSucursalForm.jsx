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
console.log(idInsumo);
  const validationSchema = Yup.object().shape({
    sucursalId: Yup.number()
      .required('Seleccione una sucursal')
      .positive('ID de sucursal inválido'),
    cantidad: Yup.number()
      .required('Este campo es requerido')
      .typeError('Debe ser un número')
      .positive('La cantidad debe ser positiva'),
    stockMinimo: Yup.number()
      .required('Este campo es requerido')
      .typeError('Debe ser un número')
      .positive('El stock mínimo debe ser positivo')
      .lessThan(Yup.ref('cantidad'), 'El stock mínimo debe ser menor que la cantidad'),
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
    <div className="form-container">
      <h2>Asignar Insumo a Sucursal</h2>
      <p className="insumo-info">Insumo: <strong>{insumoNombre}</strong></p>
      
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
          <Form className="form">
            {isLoading ? (
              <p>Cargando sucursales...</p>
            ) : error ? (
              <p className="error-message">Error al cargar sucursales</p>
            ) : (
              <SelectPrimary
                label="Sucursal"
                name="sucursalId"
                required
              >
                <option value="">Seleccione una sucursal</option>
                {sucursales.map(sucursal => (
                  <option key={sucursal.id} value={sucursal.id}>
                    {sucursal.nombre}
                  </option>
                ))}
              </SelectPrimary>
            )}
            
            <InputText
              label="Cantidad"
              name="cantidad"
              type="number"
              required
              step="0.01"
              min="0.01"
              placeholder="Ej: 100.00"
            />
            
            <InputText
              label="Stock Mínimo"
              name="stockMinimo"
              type="number"
              required
              step="1"
              min="1"
              placeholder="Ej: 20"
            />
            
            <InputText
              label="Fecha de Vencimiento (Opcional)"
              name="fechaVencimiento"
              type="date"
              min={new Date().toISOString().split('T')[0]}
            />
            
            <div className="form-actions">
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