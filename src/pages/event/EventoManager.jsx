import React, { useState } from 'react';
import EventoForm from './EventForm';
import EnvioPaquete from './EnvioPaquete';
import VerificarPaquete from './ValidarPaqueteForm';
import ListEvent from './ListEvent';
import Modal from '../../components/modal/Modal';
import { getCufd } from '../../service/api';
import './EventoManager.css';
import { getUser } from '../../utils/authFunctions';
import { Toaster, toast } from 'sonner';

const EventoManager = () => {
  const [formularioActivo, setFormularioActivo] = useState(null);
  const [cufd, setCufd] = useState('');
  const [cufdMessage, setCufdMessage] = useState('');
  const currentUser = getUser();
  const puntoVenta = currentUser?.puntosVenta[0]?.id || null;

  const fetchCufd = async () => {
    try {
      setCufdMessage('Obteniendo CUFD...');
      const response = await getCufd(puntoVenta);
      setCufd(response.data.cufd);
      setCufdMessage('CUFD obtenido correctamente');
      setTimeout(() => setCufdMessage(''), 3000); // Limpiar mensaje después de 3 segundos
    } catch (error) {
      console.error('Error al obtener el CUFD:', error);
      setCufdMessage('Error al obtener el CUFD');
      setTimeout(() => setCufdMessage(''), 3000);
    }
  };

  const renderFormulario = () => {
    switch (formularioActivo) {
      case 'evento':
        return <EventoForm />;
      case 'envio':
        return <EnvioPaquete />;
      case 'verificacion':
        return <VerificarPaquete />;
      default:
        return null;
    }
  };

  const abrirModal = (tipoFormulario) => {
    setFormularioActivo(tipoFormulario);
  };

  const cerrarModal = () => {
    setFormularioActivo(null);
  };

  return (
    <div className="manager-container">
      <div className="tabs">
        <button className="tab" onClick={() => abrirModal('evento')}>
          Evento Significativo
        </button>
        <button className="tab" onClick={() => abrirModal('envio')}>
          Enviar Paquete
        </button>
        <button className="tab" onClick={() => abrirModal('verificacion')}>
          Verificar Paquete
        </button>
        <button 
          className="tab" 
          onClick={fetchCufd}
          title="Obtener nuevo CUFD"
        >
          Obtener CUFD
        </button>
      </div>

      {/* Mensaje de estado del CUFD */}
      {cufdMessage && (
        <div className={`cufd-message ${cufdMessage.includes('Error') ? 'error' : 'success'}`}>
          {cufdMessage}
        </div>
      )}

      {/* Mostrar CUFD si está disponible */}
      {cufd && (
        <div className="cufd-display">
          <strong>CUFD actual:</strong>
          <code>{cufd}</code>
        </div>
      )}

      {/* Lista principal visible */}
      <div style={{ marginTop: '40px' }}>
        <ListEvent />
      </div>

      {/* Modal con formulario */}
      <Modal isOpen={!!formularioActivo} onClose={cerrarModal}>
        {renderFormulario()}
      </Modal>
    </div>
  );
};

export default EventoManager;