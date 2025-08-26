import React from 'react';
import { FaUser, FaEnvelope, FaPhone, FaCalendarAlt, FaInfoCircle } from 'react-icons/fa';
import ButtonPrimary from '../../components/buttons/ButtonPrimary';
import './ContactoDetail.css';

const ContactoDetail = ({ contacto, onClose, onStatusChange }) => {
    const getAsuntoLabel = (asunto) => {
        switch (asunto) {
            case 'PEDIDO_ESPECIAL': return 'Pedido Especial';
            case 'CONSULTA': return 'Consulta';
            case 'RECLAMO': return 'Reclamo';
            case 'SUGERENCIA': return 'Sugerencia';
            default: return asunto;
        }
    };

    const getEstadoStyle = (estado) => {
        switch (estado) {
            case 'PENDIENTE':
                return { backgroundColor: '#fff3e0', color: '#f57c00' };
            case 'ATENDIDO':
                return { backgroundColor: '#e8f5e9', color: '#388e3c' };
            case 'DESCARTADO':
                return { backgroundColor: '#ffebee', color: '#d32f2f' };
            default:
                return { backgroundColor: '#f5f5f5', color: '#333' };
        }
    };

    return (
        <div className="contacto-detail">
            <h2>Detalles del Contacto</h2>

            <div className="contacto-header">
                <div className="contacto-avatar">
                    <FaUser size={40} />
                </div>
                <div className="contacto-info">
                    <h3>{contacto.name}</h3>
                    <div className="contacto-meta">
                        <span className="contacto-asunto">
                            {getAsuntoLabel(contacto.asunto)}
                        </span>
                        <span
                            className="contacto-estado"
                            style={getEstadoStyle(contacto.atendido)}
                        >
                            {contacto.atendido === 'PENDIENTE' ? 'Pendiente' :
                                contacto.atendido === 'ATENDIDO' ? 'Atendido' : 'Descartado'}
                        </span>
                    </div>
                </div>
            </div>

            <div className="contacto-content">
                <div className="contacto-section">
                    <h4><FaInfoCircle /> Detalles del mensaje</h4>
                    <p>{contacto.detalles}</p>
                </div>

                <div className="contacto-section">
                    <h4>Información de contacto</h4>
                    <div className="contacto-data">
                        <div className="contacto-data-item">
                            <FaEnvelope className="icon" />
                            <span>{contacto.correo || 'No especificado'}</span>
                        </div>
                        <div className="contacto-data-item">
                            <FaPhone className="icon" />
                            <span>{contacto.telefono || 'No especificado'}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="contacto-actions">
                {contacto.atendido === 'PENDIENTE' && (
                    <>
                        <ButtonPrimary
                            onClick={() => onStatusChange('ATENDIDO')}
                            variant="primary"
                        >
                            Marcar como Atendido
                        </ButtonPrimary>

                        <ButtonPrimary
                            onClick={() => onStatusChange('DESCARTADO')}
                            variant="danger"
                        >
                            Descartar
                        </ButtonPrimary>
                    </>
                )}

                <ButtonPrimary
                    onClick={onClose}
                    variant="secondary"
                >
                    Cerrar
                </ButtonPrimary>
            </div>
        </div>
    );
};

export default ContactoDetail;