import React, { useState, useEffect } from 'react';
import './ModalPromocion.css';

const ModalPromocion = ({ product, onClose, onConfirm }) => {
  const [descuento, setDescuento] = useState('');
  const [sucursalId, setSucursalId] = useState('');
  const [precioFinal, setPrecioFinal] = useState(0);

  useEffect(() => {
    if (descuento && product.precioUnitario) {
      const descuentoDecimal = parseFloat(descuento) / 100;
      const precioConDescuento = product.precioUnitario * (1 - descuentoDecimal);
      setPrecioFinal(precioConDescuento.toFixed(2));
    } else {
      setPrecioFinal(product.precioUnitario?.toFixed(2) || '0.00');
    }
  }, [descuento, product.precioUnitario]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (descuento && sucursalId) {
      onConfirm(parseFloat(descuento), parseInt(sucursalId));
    }
  };

  return (
    <div className="modal-promocion-overlay">
      <div className="modal-promocion-content">
        <h2>Aplicar Promoción</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
          <div className="price-row">
              <span>Precio original:</span>
              <span className="original-price">{product.precioUnitario?.toFixed(2) || '0.00'} Bs</span>
            </div>
            <label>Sucursal:</label>
            <select 
              value={sucursalId}
              onChange={(e) => setSucursalId(e.target.value)}
              required
            >
              <option value="">Seleccione sucursal</option>
              {product.sucursales.map(sucursal => (
                <option key={sucursal.sucursalId} value={sucursal.sucursalId}>
                  {sucursal.nombre} (Stock: {sucursal.cantidad})
                </option>
              ))}
            </select>
          </div>
          
          <div className="form-group">
            <label>Descuento (%):</label>
            <input
              type="number"
              min="1"
              max="100"
              value={descuento}
              onChange={(e) => setDescuento(e.target.value)}
              required
            />
          </div>

          <div className="price-info">
            
            <div className="price-row">
              <span>Descuento:</span>
              <span className="discount-value">{descuento || '0'}%</span>
            </div>
            <div className="price-row">
              <span>Precio final:</span>
              <span className="final-price">{precioFinal} Bs</span>
            </div>
          </div>
          
          <div className="modal-buttons">
            <button type="button" onClick={onClose}>Cancelar</button>
            <button type="submit">Aplicar Promoción</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModalPromocion;