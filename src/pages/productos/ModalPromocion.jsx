import React, { useState } from 'react';
import './ModalPromocion.css';

const ModalPromocion = ({ product, onClose, onConfirm }) => {
  const [descuento, setDescuento] = useState("");
  const [sucursalId, setSucursalId] = useState("");
  const [isLoading, setIsLoading] = useState(false);

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

  const handleSucursalChange = (e) => {
    setSucursalId(e.target.value);
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

  const handleConfirm = async () => {
    if (descuento === "" || parseFloat(descuento) < 0 || parseFloat(descuento) > 100) {
      alert("El descuento debe estar entre 0 y 100.");
      return;
    }
    if (sucursalId === "") {
      alert("Seleccione una sucursal.");
      return;
    }

    setIsLoading(true);
    try {
      await onConfirm(parseFloat(descuento), parseInt(sucursalId));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="modal-promocion">
      <div className="modal-content">
        <h2>Aplicar Descuento</h2>
        <p>Producto: {product.descripcion}</p>
        <p>Precio Original: {product.precioUnitario} Bs</p>

        <div className="input-group">
          <label>Sucursal:</label>
          <select value={sucursalId} onChange={handleSucursalChange}>
            <option value="">Seleccione una sucursal</option>
            {product.sucursales.map((sucursal) => (
              <option key={sucursal.id} value={sucursal.id}>
                {sucursal.nombre}
              </option>
            ))}
          </select>
        </div>

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
          <button onClick={handleConfirm} disabled={isLoading}>
            {isLoading ? "Aplicando..." : "Aplicar Descuento"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalPromocion;