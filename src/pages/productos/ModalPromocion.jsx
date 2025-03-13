import React, { useState } from 'react';
import './ModalPromocion.css';

const ModalPromocion = ({ product, onClose, onConfirm }) => {
  const [descuento, setDescuento] = useState(""); 

  const calcularPrecioFinal = () => {
    if (descuento === "") return product.precioUnitario; 
    const descuentoNumerico = parseFloat(descuento);
    if (isNaN(descuentoNumerico)) return product.precioUnitario;
    return product.precioUnitario * (1 - descuentoNumerico / 100);
  };

  const precioFinal = calcularPrecioFinal();

  const handleDescuentoChange = (e) => {
    const value = e.target.value;
    if (value === "") {
      setDescuento("");
      return;
    }
    const numericValue = parseFloat(value);
    if (!isNaN(numericValue)) {
      if (numericValue >= 0 && numericValue <= 100) {
        setDescuento(value); 
      }
    }
  };

  const handleBlur = () => {

    if (descuento === "") {
      setDescuento("0"); 
    } else {
      const numericValue = parseFloat(descuento);
      if (isNaN(numericValue)) {
        setDescuento("0");
      }
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
            onBlur={handleBlur}
          />
        </div>
        <p>Precio Final: {precioFinal.toFixed(2)} Bs</p>
        <div className="modal-actions">
          <button onClick={onClose}>Cancelar</button>
          <button onClick={() => onConfirm(parseFloat(descuento))}>Aplicar Descuento</button>
        </div>
      </div>
    </div>
  );
};

export default ModalPromocion;