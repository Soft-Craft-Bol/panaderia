import React, { useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { getUser } from '../../utils/authFunctions';
import { registrarEvento } from '../../service/api';
import InputSecundary from '../../components/inputs/InputSecundary';
import ButtonPrimary from '../../components/buttons/ButtonPrimary';
import Modal from '../../components/modal/Modal';
import { FaCopy } from 'react-icons/fa';
import './EventForm.css';
import { toast, Toaster } from 'sonner';

const EnvioPaquete = ({ initialCodigoEvento, onSuccess, onClose }) => {
  const [resultado, setResultado] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const currentUser = getUser();
  const puntoVentaId = currentUser?.puntosVenta?.[0]?.id || null;

  const formik = useFormik({
    initialValues: {
      codigoEvento: initialCodigoEvento || '',
      cafc: '',
    },
    validationSchema: Yup.object({
      codigoEvento: Yup.number()
        .typeError('Debe ser un número')
        .required('Este campo es obligatorio'),
    }),
    onSubmit: async (values) => {
      setLoading(true);
      setError(null);
      setResultado(null);

      const payload = {
        idPuntoVenta: puntoVentaId,
        codigoEvento: Number(values.codigoEvento),
        ...(values.cafc && { cafc: values.cafc.trim() })
      };

      try {
        const response = await registrarEvento(payload);
        const codigoRecepcion = response?.data.codigoRecepcion;
/* 
        const data = response?.data;

        setResultado({
          codigoRecepcion: codigoRecepcion,
          codigoEvento: data.codigoEvento,
          mensaje: data.mensaje,
          cantidadFacturas: data.cantidadFacturasAlmacenadas
        }); */
        

        setShowModal(true);

        formik.resetForm();
         if (onSuccess) {
          onSuccess(codigoRecepcion); // <- Manda al tercer formulario
        }
      } catch (e) {
        setError({
          titulo: 'Error al registrar evento',
          mensaje: e.response?.data?.message || e.message || 'Error inesperado',
          detalles: e.response?.data?.details || ''
        });
      } finally {
        setLoading(false);
      }
    },
  });

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
      .then(() => toast.success('Código copiado al portapapeles'))
      .catch(err => console.error('Error al copiar:', err));
  };

  return (
    <div className="evento-container">
    <Toaster position="top-right" richColors />
      <h2 className="evento-title">Registro de Evento con CAFc</h2>
      <p className="evento-subtitle">Complete los datos para registrar el evento con CAFc (opcional)</p>

      {error && (
        <div className="error-message">
          <p>{error.mensaje}</p>
          {error.detalles && <p className="alert-details">{error.detalles}</p>}
        </div>
      )}

      <form onSubmit={formik.handleSubmit} className="evento-form">
        <div className="evento-section">
          <InputSecundary
            label="Código del Evento *"
            name="codigoEvento"
            type="number"
            formik={formik}
            required
          />
          <InputSecundary
            label="Código CAFc (opcional)"
            name="cafc"
            type="text"
            formik={formik}
            maxLength={13}
            placeholder="13 caracteres hexadecimales"
          />
        </div>

        <div className="evento-actions">
          <ButtonPrimary type="submit" disabled={!formik.isValid || loading}>
            {loading ? 'Enviando Paquete...' : 'Enviar Paquete'}
          </ButtonPrimary>
        </div>
      </form>

      {/* Modal de resultado */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)}>
        <div className="modal-content">
          <h3>Evento registrado correctamente</h3>
          <div className="resultado-container">
            <p><strong>Mensaje:</strong> {resultado?.mensaje}</p>

            <p><strong>Código de Recepción:</strong></p>
            <div className="codigo-container">
              <span className="codigo-recepcion">{resultado?.codigoRecepcion}</span>
              <button
                className="copy-button"
                onClick={() => copyToClipboard(resultado?.codigoRecepcion)}
                title="Copiar código"
              >
                <FaCopy />
              </button>
            </div>

            <p><strong>Código Evento:</strong> {resultado?.codigoEvento}</p>
            <p><strong>Cantidad de facturas:</strong> {resultado?.cantidadFacturas}</p>
          </div>
          <div className="modal-actions">
            <ButtonPrimary onClick={() => setShowModal(false)}>Cerrar</ButtonPrimary>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default EnvioPaquete;
