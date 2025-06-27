import React, { useState } from 'react';
import './CierreCajaForm.css';

const CierreCajaForm = ({ caja, usuario }) => {
  const [formData, setFormData] = useState({
    ventaFacturaEfectivo: '',
    ventaFacturaTarjeta: '',
    ventaFacturaQr: '',
    ventaSinFacturaEfectivo: '',
    ventaSinFacturaTransferencia: '',
    gastos: '',
    efectivoFinal: '',
    tarjetaFinal: '',
    qrFinal: '',
    transferenciaFinal: '',
    observaciones: ''
  });
  const [showResumen, setShowResumen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const calcularCierre = () => {
    setShowResumen(true);
  };

  const handleGuardar = () => {
    setLoading(true);
    // Aquí iría la llamada a la API
    setTimeout(() => {
      setLoading(false);
      alert('Cierre guardado exitosamente');
    }, 1000);
  };

  const totalVentas = (
    parseFloat(formData.ventaFacturaEfectivo || 0) +
    parseFloat(formData.ventaFacturaTarjeta || 0) +
    parseFloat(formData.ventaFacturaQr || 0) +
    parseFloat(formData.ventaSinFacturaEfectivo || 0) +
    parseFloat(formData.ventaSinFacturaTransferencia || 0)
  );

  const totalContado = (
    parseFloat(formData.efectivoFinal || 0) +
    parseFloat(formData.tarjetaFinal || 0) +
    parseFloat(formData.qrFinal || 0) +
    parseFloat(formData.transferenciaFinal || 0)
  );

  const diferencia = (totalContado - totalVentas).toFixed(2);

  return (
    <div className="cierre-caja-container">
      <div className="cierre-caja-header">
        <h2>Cierre de Caja - {caja.nombre}</h2>
        <p>Usuario: {usuario.nombre}</p>
      </div>

      <div className="monto-inicial">
        <h3>Monto Inicial: Bs. {caja.montoInicial.toFixed(2)}</h3>
      </div>

      <div className="section-card">
        <h3 className="section-title">Ventas por Método de Pago</h3>
        
        <h4>Con Factura</h4>
        <div className="payment-methods-grid">
          <div className="form-group">
            <label>Efectivo</label>
            <input
              type="number"
              className="form-control"
              name="ventaFacturaEfectivo"
              value={formData.ventaFacturaEfectivo}
              onChange={handleChange}
              step="0.01"
              min="0"
            />
          </div>
          
          <div className="form-group">
            <label>Tarjeta</label>
            <input
              type="number"
              className="form-control"
              name="ventaFacturaTarjeta"
              value={formData.ventaFacturaTarjeta}
              onChange={handleChange}
              step="0.01"
              min="0"
            />
          </div>
          
          <div className="form-group">
            <label>QR</label>
            <input
              type="number"
              className="form-control"
              name="ventaFacturaQr"
              value={formData.ventaFacturaQr}
              onChange={handleChange}
              step="0.01"
              min="0"
            />
          </div>
        </div>

        <h4>Sin Factura</h4>
        <div className="payment-methods-grid">
          <div className="form-group">
            <label>Efectivo</label>
            <input
              type="number"
              className="form-control"
              name="ventaSinFacturaEfectivo"
              value={formData.ventaSinFacturaEfectivo}
              onChange={handleChange}
              step="0.01"
              min="0"
            />
          </div>
          
          <div className="form-group">
            <label>Transferencia</label>
            <input
              type="number"
              className="form-control"
              name="ventaSinFacturaTransferencia"
              value={formData.ventaSinFacturaTransferencia}
              onChange={handleChange}
              step="0.01"
              min="0"
            />
          </div>
        </div>
      </div>

      <div className="section-card">
        <h3 className="section-title">Gastos del Turno</h3>
        <div className="form-group">
          <input
            type="number"
            className="form-control"
            name="gastos"
            value={formData.gastos}
            onChange={handleChange}
            step="0.01"
            min="0"
            placeholder="Total de gastos"
          />
        </div>
      </div>

      <div className="section-card">
        <h3 className="section-title">Conteo Final</h3>
        <div className="payment-methods-grid">
          <div className="form-group">
            <label>Efectivo</label>
            <input
              type="number"
              className="form-control"
              name="efectivoFinal"
              value={formData.efectivoFinal}
              onChange={handleChange}
              step="0.01"
              min="0"
            />
          </div>
          
          <div className="form-group">
            <label>Tarjeta</label>
            <input
              type="number"
              className="form-control"
              name="tarjetaFinal"
              value={formData.tarjetaFinal}
              onChange={handleChange}
              step="0.01"
              min="0"
            />
          </div>
          
          <div className="form-group">
            <label>QR</label>
            <input
              type="number"
              className="form-control"
              name="qrFinal"
              value={formData.qrFinal}
              onChange={handleChange}
              step="0.01"
              min="0"
            />
          </div>
          
          <div className="form-group">
            <label>Transferencia</label>
            <input
              type="number"
              className="form-control"
              name="transferenciaFinal"
              value={formData.transferenciaFinal}
              onChange={handleChange}
              step="0.01"
              min="0"
            />
          </div>
        </div>
      </div>

      <div className="section-card">
        <h3 className="section-title">Observaciones</h3>
        <div className="form-group">
          <textarea
            className="form-control observaciones-textarea"
            name="observaciones"
            value={formData.observaciones}
            onChange={handleChange}
            placeholder="Notas relevantes del turno..."
          />
        </div>
      </div>

      <div className="actions">
        <button 
          className="btn btn-primary"
          onClick={calcularCierre}
          disabled={loading}
        >
          {loading ? 'Calculando...' : 'Calcular Cierre'}
        </button>
      </div>

      {showResumen && (
        <div className="resumen-card">
          <h3 className="section-title">Resumen del Cierre</h3>
          
          <div className="resumen-grid">
            <div className="resumen-item">
              <div>Total Ventas</div>
              <div className="resumen-value">Bs. {totalVentas.toFixed(2)}</div>
            </div>
            
            <div className="resumen-item">
              <div>Total Contado</div>
              <div className="resumen-value">Bs. {totalContado.toFixed(2)}</div>
            </div>
            
            <div className="resumen-item">
              <div>Diferencia</div>
              <div className={`resumen-value ${diferencia >= 0 ? 'resumen-positive' : 'resumen-negative'}`}>
                Bs. {diferencia}
              </div>
            </div>
          </div>

          <div className="actions">
            <button 
              className="btn btn-primary"
              onClick={handleGuardar}
              disabled={loading}
            >
              {loading ? 'Guardando...' : 'Guardar Cierre'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CierreCajaForm;