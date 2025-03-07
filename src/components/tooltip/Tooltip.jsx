import React, { useRef, useState, useEffect } from 'react';
import './Tooltip.css';

const Tooltip = ({ insumo, targetElement }) => {
  const tooltipRef = useRef(null);
  const [position, setPosition] = useState('bottom');

  useEffect(() => {
    if (targetElement && tooltipRef.current) {
      const targetRect = targetElement.getBoundingClientRect();
      const tooltipRect = tooltipRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - targetRect.bottom;
      const spaceAbove = targetRect.top;

      if (spaceBelow < tooltipRect.height && spaceAbove >= tooltipRect.height) {
        setPosition('top');
      } else {
        setPosition('bottom');
      }
    }
  }, [targetElement]);

  return (
    <div 
      ref={tooltipRef} 
      className={`tooltip ${position}`}
    >
      <img src={insumo.imagen} alt={insumo.nombre} className="tooltip-image" />
      <div className="tooltip-content">
        <h4>{insumo.nombre}</h4>
        <p><strong>Proveedor:</strong> {insumo.proveedor}</p>
        <p><strong>Marca:</strong> {insumo.marca}</p>
        <p><strong>Precio:</strong> ${insumo.precio}</p>
        <p><strong>Descripción:</strong> {insumo.descripcion}</p>
        {insumo.sucursales.length > 0 && (
          <div>
            <strong>Sucursales:</strong>
            <ul>
              {insumo.sucursales.map((sucursal, index) => (
                <li key={index}>{sucursal.nombre} - {sucursal.cantidad} unidades</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default Tooltip;