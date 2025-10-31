import React, { useState } from 'react';
import './TarjetaPagoModal.css';
import { Button } from '../buttons/Button';

const TarjetaPagoForm = ({ onClose, onConfirm }) => {
  const [formData, setFormData] = useState({
    numeroTarjeta: '',
    nombreTitular: '',
    fechaExpiracion: '',
    cvv: '',
    tipoTarjeta: 'credito'
  });

  // Función para enmascarar el número de tarjeta (ej: 9999000000009999)
  const enmascararNumeroTarjeta = (numero) => {
    if (!numero) return '•••• •••• •••• ••••';
    
    const digitsOnly = numero.replace(/\s/g, '');
    if (digitsOnly.length !== 16) return numero;
    
    const primeros4 = digitsOnly.substring(0, 4);
    const ultimos4 = digitsOnly.substring(12, 16);
    
    return `${primeros4} •••• •••• ${ultimos4}`;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'numeroTarjeta') {
      const formattedValue = value.replace(/\s/g, '').replace(/(\d{4})/g, '$1 ').trim();
      setFormData({ ...formData, [name]: formattedValue });
      return;
    }
    
    if (name === 'fechaExpiracion') {
      const formattedValue = value
        .replace(/\D/g, '')
        .replace(/(\d{2})(\d)/, '$1/$2')
        .substring(0, 5);
      setFormData({ ...formData, [name]: formattedValue });
      return;
    }
    
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const numeroTarjetaLimpio = formData.numeroTarjeta.replace(/\s/g, '');
    if (numeroTarjetaLimpio.length !== 16) {
      alert('El número de tarjeta debe tener 16 dígitos');
      return;
    }
    if (formData.cvv.length !== 3) {
      alert('El CVV debe tener 3 dígitos');
      return;
    }
    
    const datosParaConfirmar = {
      ...formData,
      numeroTarjetaEnmascarado: enmascararNumeroTarjeta(formData.numeroTarjeta),
      numeroTarjetaCompleto: formData.numeroTarjeta 
    };
    
    onConfirm(datosParaConfirmar);
  };

  const detectarTipoTarjeta = (numero) => {
    const num = numero.replace(/\s/g, '');
    if (/^4/.test(num)) return 'visa';
    if (/^5[1-5]/.test(num)) return 'mastercard';
    if (/^3[47]/.test(num)) return 'amex';
    if (/^6/.test(num)) return 'discover';
    return 'unknown';
  };

  const tipoTarjeta = detectarTipoTarjeta(formData.numeroTarjeta);

  return (
    <div className="modalTarjeta-overlay" onClick={onClose}>
      <div className="tarjeta-pago-modalT" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Pago con Tarjeta</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="tarjeta-preview">
          <div className={`tarjeta ${tipoTarjeta}`}>
            <div className="tarjeta-chip"></div>
            <div className="tarjeta-numero">
              {enmascararNumeroTarjeta(formData.numeroTarjeta)}
            </div>
            <div className="tarjeta-info">
              <div className="tarjeta-nombre">
                {formData.nombreTitular || 'NOMBRE DEL TITULAR'}
              </div>
              <div className="tarjeta-expiracion">
                {formData.fechaExpiracion || 'MM/AA'}
              </div>
            </div>
            <div className="tarjeta-logo">
              {tipoTarjeta === 'visa' && <div className="logo-visa">VISA</div>}
              {tipoTarjeta === 'mastercard' && <div className="logo-mastercard">MC</div>}
              {tipoTarjeta === 'amex' && <div className="logo-amex">AMEX</div>}
              {tipoTarjeta === 'discover' && <div className="logo-discover">DISC</div>}
            </div>
          </div>
        </div>

        <form className="tarjeta-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Número de Tarjeta</label>
            <input
              type="text"
              name="numeroTarjeta"
              value={formData.numeroTarjeta}
              onChange={handleInputChange}
              placeholder="1234 5678 9012 3456"
              maxLength="19"
              required
            />
          </div>

          <div className="form-group">
            <label>Nombre del Titular</label>
            <input
              type="text"
              name="nombreTitular"
              value={formData.nombreTitular}
              onChange={handleInputChange}
              placeholder="Como aparece en la tarjeta"
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Fecha de Expiración</label>
              <input
                type="text"
                name="fechaExpiracion"
                value={formData.fechaExpiracion}
                onChange={handleInputChange}
                placeholder="MM/AA"
                maxLength="5"
                required
              />
            </div>

            <div className="form-group">
              <label>CVV</label>
              <input
                type="password"
                name="cvv"
                value={formData.cvv}
                onChange={handleInputChange}
                placeholder="123"
                maxLength="3"
                required
              />
              <div className="cvv-info">ⓘ 3 dígitos en el reverso</div>
            </div>
          </div>

          <div className="form-group">
            <label>Tipo de Tarjeta</label>
            <div className="tipo-tarjeta-options">
              <label className="radio-option">
                <input
                  type="radio"
                  name="tipoTarjeta"
                  value="credito"
                  checked={formData.tipoTarjeta === 'credito'}
                  onChange={handleInputChange}
                />
                <span className="radio-label">Crédito</span>
              </label>
              <label className="radio-option">
                <input
                  type="radio"
                  name="tipoTarjeta"
                  value="debito"
                  checked={formData.tipoTarjeta === 'debito'}
                  onChange={handleInputChange}
                />
                <span className="radio-label">Débito</span>
              </label>
            </div>
          </div>

          <div className="form-actions">
            <Button type="button" variant='danger' onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" variant='success'>
              Pagar Ahora
            </Button>
          </div>
        </form>

        <div className="security-info">
          <div className="secure-lock">🔒</div>
          <span>Transacción segura - Todos los datos están encriptados</span>
        </div>
      </div>
    </div>
  );
};

export default TarjetaPagoForm;