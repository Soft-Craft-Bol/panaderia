import { FaPhone, FaEnvelope, FaMapMarkerAlt, FaClock, FaBreadSlice, FaHamburger } from 'react-icons/fa';
import { useState } from 'react';
import './Contacts.css';
import { FaPaperPlane } from 'react-icons/fa6';

const PanaderiaContactForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: 'Consulta general',
    message: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Lógica para enviar el formulario
    alert(`Gracias ${formData.name}! Tu consulta sobre ${formData.subject} ha sido enviada.`);
    setFormData({
      name: '',
      email: '',
      phone: '',
      subject: 'Consulta general',
      message: ''
    });
  };

  return (
    <div className="panaderia-contact-page">
      {/* Hero section con imagen de panadería */}
      <div className="panaderia-hero">
        <div className="hero-overlay">
          <h1>Contacta a nuestra Panadería</h1>
          <p>El aroma del pan recién horneado te espera</p>
        </div>
      </div>

      <div className="panaderia-contact-container">
        {/* Información de la panadería */}
        <div className="panaderia-info">
          <h2>Nuestra Panadería</h2>
          
          <div className="info-card">
            <div className="info-icon">
              <FaMapMarkerAlt />
            </div>
            <div>
              <h3>Visítanos</h3>
              <p>Calle del Pan Fresco 123<br />Barrio Harina, Ciudad</p>
            </div>
          </div>
          
          <div className="info-card">
            <div className="info-icon">
              <FaPhone />
            </div>
            <div>
              <h3>Llámanos</h3>
              <p>+1 (234) 567-8901<br />Pedidos con 24h de anticipación</p>
            </div>
          </div>
          
          <div className="info-card">
            <div className="info-icon">
              <FaEnvelope />
            </div>
            <div>
              <h3>Escríbenos</h3>
              <p>pedidos@mipanaderia.com<br />eventos@mipanaderia.com</p>
            </div>
          </div>
          
          <div className="info-card">
            <div className="info-icon">
              <FaClock />
            </div>
            <div>
              <h3>Horario</h3>
              <p>Lunes a Sábado: 6:00 - 20:00<br />Domingo: 6:00 - 14:00</p>
            </div>
          </div>

          <div className="specialties">
            <h3>Nuestras Especialidades</h3>
            <div className="specialty-items">
              <div className="specialty-item">
                <FaBreadSlice />
                <span>Pan artesanal</span>
              </div>
              <div className="specialty-item">
                <FaHamburger />
                <span>Pastelería</span>
              </div>
            </div>
          </div>
        </div>

        {/* Formulario de contacto */}
        <div className="panaderia-form-container">
          <h2>Haz tu pedido o consulta</h2>
          <p>¿Quieres reservar pan para un evento? ¿Tienes preguntas sobre nuestros productos?</p>
          
          <form onSubmit={handleSubmit} className="panaderia-form">
            <div className="form-group">
              <label htmlFor="name">Tu nombre *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                placeholder="Ej: Juan Pérez"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="email">Correo electrónico *</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                placeholder="Ej: juan@email.com"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="phone">Teléfono</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="Ej: +1 234 567 890"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="subject">Asunto *</label>
              <select
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleInputChange}
                required
              >
                <option value="Consulta general">Consulta general</option>
                <option value="Pedido especial">Pedido especial</option>
                <option value="Eventos/catering">Eventos/catering</option>
                <option value="Quejas/sugerencias">Quejas/sugerencias</option>
                <option value="Trabaja con nosotros">Trabaja con nosotros</option>
              </select>
            </div>
            
            <div className="form-group">
              <label htmlFor="message">Detalles *</label>
              <textarea
                id="message"
                name="message"
                rows="5"
                value={formData.message}
                onChange={handleInputChange}
                required
                placeholder="Ej: Necesito 50 panes para un evento el próximo sábado..."
              ></textarea>
            </div>
            
            <button type="submit" className="btn-panaderia">
              <FaPaperPlane /> Enviar mensaje
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PanaderiaContactForm;