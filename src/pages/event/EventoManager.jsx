import React, { useState, useEffect } from 'react';
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
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [datosFlujo, setDatosFlujo] = useState({});

  const currentUser = getUser();
  const puntoVenta = currentUser?.puntosVenta[0]?.id || null;
  console.log('Punto de Venta:', puntoVenta);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);


  const abrirFormulario = (tipo, datos = {}) => {
    setDatosFlujo((prev) => ({ ...prev, ...datos }));
    setFormularioActivo(tipo);
  };
  const cerrarModal = () => {
    setFormularioActivo(null);
  };

  const renderFormulario = () => {
    switch (formularioActivo) {
      case "evento":
        return (
          <EventoForm
            onClose={cerrarModal}
            onSuccess={(codigoEvento) => {
              abrirFormulario("envio", { codigoEvento });
            }}
          />
        );
      case "envio":
        return (
          <EnvioPaquete
            initialCodigoEvento={datosFlujo.codigoEvento}
            onClose={cerrarModal}
            onSuccess={(codigoRecepcion) => {
              abrirFormulario("verificacion", { codigoRecepcion });
            }}
          />
        );
      case "verificacion":
        return (
          <VerificarPaquete
            initialCodigoRecepcion={datosFlujo.codigoRecepcion}
            onClose={cerrarModal}
          />
        );
      default:
        return null;
    }
  };

  const fetchCufd = async () => {
    try {
      setCufdMessage('Obteniendo CUFD...');
      const response = await getCufd(puntoVenta);
      setCufd(response.data.cufd);
      toast.success('CUFD obtenido correctamente');
      setCufdMessage('');
    } catch (error) {
      console.error('Error al obtener el CUFD:', error);
      toast.error('Error al obtener el CUFD');
      setCufdMessage('');
    }
  };

  const abrirModal = (tipoFormulario) => {
    setFormularioActivo(tipoFormulario);
  };



  return (
    <div className="manager-container">
      <Toaster position={isMobile ? "top-center" : "top-right"} />

      <div className="tabs-container">
        <div className="tabs">
          <button
            className={`tab ${formularioActivo === 'evento' ? 'active' : ''}`}
            onClick={() => abrirModal('evento')}
          >
            {isMobile ? 'Evento' : 'Evento Significativo'}
          </button>
          <button
            className={`tab ${formularioActivo === 'envio' ? 'active' : ''}`}
            onClick={() => abrirModal('envio')}
          >
            {isMobile ? 'Enviar' : 'Enviar Paquete'}
          </button>
          <button
            className={`tab ${formularioActivo === 'verificacion' ? 'active' : ''}`}
            onClick={() => abrirModal('verificacion')}
          >
            {isMobile ? 'Verificar' : 'Verificar Paquete'}
          </button>
          <button
            className="tab cufd-button"
            onClick={fetchCufd}
            title="Obtener nuevo CUFD"
          >
            {isMobile ? 'CUFD' : 'Obtener CUFD'}
          </button>
        </div>
      </div>

      {/* Mostrar CUFD si está disponible */}
      {cufd && (
        <div className="cufd-display">
          <strong>{isMobile ? 'CUFD:' : 'CUFD actual:'}</strong>
          <code>{isMobile ? `${cufd.substring(0, 12)}...` : cufd}</code>
          {isMobile && (
            <button
              className="copy-button"
              onClick={() => {
                navigator.clipboard.writeText(cufd);
                toast.success('CUFD copiado');
              }}
            >
              Copiar
            </button>
          )}
        </div>
      )}

      {/* Lista principal visible */}
      <div className="list-container">
        <ListEvent />
      </div>

      {/* Modal con formulario */}
      <Modal
        isOpen={!!formularioActivo}
        onClose={cerrarModal}
        className={isMobile ? "mobile-modal" : ""}
      >
        {renderFormulario()}
      </Modal>
    </div>
  );
};

export default EventoManager;