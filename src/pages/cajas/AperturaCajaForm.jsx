import React, { useState } from 'react';
import './AperturaCajaForm.css';
import SelectSecondary from '../../components/selected/SelectSecondary';
import { Button } from '../../components/buttons/Button';

const AperturaCajaForm = ({ sucursal, onAbrir, onCancelar }) => {
  const [montoInicial, setMontoInicial] = useState('');
  const [turno, setTurno] = useState('MAÑANA');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const monto = parseFloat(montoInicial);
    if (isNaN(monto) || monto < 0) {
      alert('Monto inicial inválido');
      return;
    }

    try {
      setLoading(true);
      await onAbrir({
        montoInicial: monto,
        turno
      });
    } catch (err) {
      console.error("Error en apertura de caja", err);
    } finally {
      setLoading(false);
    }
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
          <SelectSecondary
            name="turno"
            value={turno}
            onChange={(e) => setTurno(e.target.value)}
            formikCompatible={false}
          >
            <option value="MAÑANA">Mañana</option>
            <option value="TARDE">Tarde</option>
          </SelectSecondary>
        </div>

        <div className="form-buttons">
          <Button 
            type="submit" 
            variant="primary" 
            className="btn-abrir"
            loading={loading}  
          >
            Abrir Caja
          </Button>
          
          <Button 
            type="button" 
            variant="secondary" 
            className="btn-cancelar"
            onClick={onCancelar}
            disabled={loading} 
          >
            Cancelar
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AperturaCajaForm;
