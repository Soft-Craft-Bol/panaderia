import React, { useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { getUser } from '../../utils/authFunctions';
import { validarPaquete } from '../../service/api'; // <-- crea esta función en tu API
import InputSecundary from '../../components/inputs/InputSecundary';
import ButtonPrimary from '../../components/buttons/ButtonPrimary';
import Alert from '../../components/alert/Alert';
import './EventForm.css';

const ValidarPaqueteForm = ({ initialCodigoRecepcion, onClose }) => {
  const [resultado, setResultado] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const currentUser = getUser();
  const puntoVentaId = currentUser?.puntosVenta?.[0]?.id || null;

  const formik = useFormik({
    initialValues: {
      codigoRecepcion: initialCodigoRecepcion || '',
    },
    validationSchema: Yup.object({
      codigoRecepcion: Yup.string()
        .required('Este campo es obligatorio')
        .matches(
          /^[0-9a-fA-F-]{36}$/,
          'Debe ser un UUID válido'
        ),
    }),
    onSubmit: async (values) => {
      setLoading(true);
      setError(null);
      setResultado(null);

      const payload = {
        idPuntoVenta: puntoVentaId,
        codigoRecepcion: values.codigoRecepcion.trim(),
      };

      try {
        const response = await validarPaquete(payload);
        setResultado({
          mensaje: 'Validación de paquete exitosa',
          detalles: JSON.stringify(response, null, 2),
        });
        formik.resetForm();
      } catch (e) {
        setError({
          titulo: 'Error al validar paquete',
          mensaje: e.response?.data?.message || e.message || 'Error inesperado',
        });
      } finally {
        setLoading(false);
      }
    },
  });

  return (
    <div className="evento-container">
      <h2 className="evento-title">Validar Envío de Paquete</h2>
      <p className="evento-subtitle">Ingrese el código de recepción para verificar el estado del envío</p>

      {error && (
        <Alert type="error" title={error.titulo} onClose={() => setError(null)}>
          <p>{error.mensaje}</p>
        </Alert>
      )}

      {resultado && (
        <Alert type="success" title={resultado.mensaje} onClose={() => setResultado(null)}>
        </Alert>
      )}

      <form onSubmit={formik.handleSubmit} className="evento-form">
        <div className="evento-section">
          <InputSecundary
            label="Código de Recepción *"
            name="codigoRecepcion"
            type="text"
            formik={formik}
            required
          />
        </div>

        <div className="evento-actions">
          <ButtonPrimary type="submit" disabled={!formik.isValid || loading}>
            {loading ? 'Validando...' : 'Validar Paquete'}
          </ButtonPrimary>
        </div>
      </form>
    </div>
  );
};

export default ValidarPaqueteForm;
