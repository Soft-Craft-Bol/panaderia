import React, { useState } from 'react';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { Button } from '../../buttons/Button';
import Modal from '../../modal/Modal';
import InputText from '../../inputs/InputText';
import { updateStockMinimo } from '../../../service/api';

const validationSchema = Yup.object().shape({
  stockMinimo: Yup.number()
    .typeError('El stock mínimo debe ser un número')
    .min(0, 'El stock mínimo no puede ser negativo')
    .required('El stock mínimo es requerido'),
});

const EditStockMinimoModal = ({
  isOpen,
  onClose,
  insumo,
  sucursalId,
  onSuccess
}) => {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values, { setSubmitting, setStatus }) => {
    setLoading(true);
    setStatus(null);

    try {
      await updateStockMinimo(insumo.insumoId, sucursalId, parseFloat(values.stockMinimo));
      onSuccess();
      onClose();
    } catch (err) {
      console.error("Error updating stock mínimo:", err);
      setStatus(err.response?.data?.message || 'Error al actualizar stock mínimo');
    } finally {
      setLoading(false);
      setSubmitting(false);
    }
  };

  if (!isOpen || !insumo) return null;

  const initialValues = {
    stockMinimo: insumo.stockMinimo || ''
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Editar Stock Mínimo">
        <div className="modal-content">
          <p>
            <strong>Insumo:</strong> {insumo.nombre}
          </p>
          <p>
            <strong>Sucursal:</strong> {insumo.sucursalNombre}
          </p>

          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
            enableReinitialize
          >
            {({ errors, touched, isSubmitting, status }) => (
              <Form className="form">
                <Field name="stockMinimo">
                  {({ field, meta }) => (
                    <InputText
                      {...field}
                      label="Stock Mínimo"
                      type="number"
                      min="0"
                      step="0.01"
                      required
                      disabled={loading}
                      error={meta.touched && meta.error ? meta.error : undefined}
                    />
                  )}
                </Field>

                {(status || errors.general) && (
                  <div className="error-message">
                    {status || errors.general}
                  </div>
                )}

                <div className="modal-actions">
                  <Button
                    type="button"
                    onClick={onClose}
                    disabled={loading}
                    variant="secondary"
                  >
                    Cancelar
                  </Button>
                  <Button
                    variant='primary'
                    type="submit" 
                    loading={loading || isSubmitting}
                  >
                    Actualizar
                  </Button>
                </div>
              </Form>
            )}
          </Formik>
        </div>
    </Modal>
  );
};

export default EditStockMinimoModal;