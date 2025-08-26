// src/components/caja/AperturaCajaForm.jsx
import React, { useState } from 'react';
import './AperturaCajaForm.css';

const AperturaCajaForm = ({ sucursal, onAbrir, onCancelar }) => {
  const [montoInicial, setMontoInicial] = useState('');
  const [turno, setTurno] = useState('MAÑANA');

  const handleSubmit = (e) => {
    e.preventDefault();

    const monto = parseFloat(montoInicial);
    if (isNaN(monto) || monto < 0) {
      alert('Monto inicial inválido');
      return;
    }

    onAbrir({
      montoInicial: monto,
      turno
    });
  };

  return (
    <div className="form-container">
      <h2>Apertura de Caja</h2>
      <form onSubmit={handleSubmit} className="caja-form">
        <div className="form-group">
          <label>Monto Inicial (Bs):</label>
          <input
            type="number"
            step="0.01"
            value={montoInicial}
            onChange={(e) => setMontoInicial(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label>Turno:</label>
          <select value={turno} onChange={(e) => setTurno(e.target.value)}>
            <option value="MAÑANA">Mañana</option>
            <option value="TARDE">Tarde</option>
            <option value="NOCHE">Noche</option>
          </select>
        </div>

        <div className="form-buttons">
          <button type="submit" className="btn-abrir">Abrir Caja</button>
          <button type="button" className="btn-cancelar" onClick={onCancelar}>Cancelar</button>
        </div>
      </form>
    </div>
  );
};

export default AperturaCajaForm;
