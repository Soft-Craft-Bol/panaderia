import React, { useState } from 'react';
import './ModalPromocion.css';

const ModalPromocion = ({ product, onClose, onConfirm }) => {
  const [descuento, setDescuento] = useState(0);
  const precioFinal = product.precioUnitario * (1 - descuento / 100);

  const handleDescuentoChange = (e) => {
    const value = parseFloat(e.target.value);
    if (!isNaN(value) && value >= 0 && value <= 100) {
      setDescuento(value);
    }
  };

  return (
    <div className="modal-promocion">
      <div className="modal-content">
        <h2>Aplicar Descuento</h2>
        <p>Producto: {product.descripcion}</p>
        <p>Precio Original: {product.precioUnitario} Bs</p>
        <div className="input-group">
          <label>Descuento (%):</label>
          <input
            type="number"
            min="0"
            max="100"
            value={descuento}
            onChange={handleDescuentoChange}
          />
        </div>
        <p>Precio Final: {precioFinal.toFixed(2)} Bs</p>
        <div className="modal-actions">
          <button onClick={onClose}>Cancelar</button>
          <button onClick={() => onConfirm(descuento)}>Aplicar Descuento</button>
        </div>
      </div>
    </div>
  );
};

export default ModalPromocion;