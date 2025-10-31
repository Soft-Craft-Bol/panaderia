import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import './InsumoSelector.css';

const InsumoSelector = ({
  insumo,
  onSelectionChange,
  seleccionesIniciales = [],
  modoMezcla = false,
  editable = false,
  porcentajeLote = 100
}) => {
  const [selections, setSelections] = useState(seleccionesIniciales);

  const calcularCantidadAjustada = () => insumo.cantidad * (porcentajeLote / 100);

  useEffect(() => {
    if (selections.length > 0) {
      const cantidadAjustada = calcularCantidadAjustada();

      if (!modoMezcla || selections.length === 1) {
        const nuevasSelecciones = selections.map(item => ({
          ...item,
          cantidadUsada: cantidadAjustada
        }));

        setSelections(nuevasSelecciones);
        onSelectionChange(insumo.id, nuevasSelecciones);
      } else {
        const totalActual = selections.reduce((sum, item) => sum + item.cantidadUsada, 0);
        if (totalActual > 0) {
          const factor = cantidadAjustada / totalActual;
          const nuevasSelecciones = selections.map(item => ({
            ...item,
            cantidadUsada: item.cantidadUsada * factor
          }));

          setSelections(nuevasSelecciones);
          onSelectionChange(insumo.id, nuevasSelecciones);
        }
      }
    }
  }, [porcentajeLote]);

  useEffect(() => {
    setSelections(seleccionesIniciales);
  }, [seleccionesIniciales]);

  const handleAddInsumo = () => {
    if (insumo.opcionesEspecificas.length === 0) return;

    const opcionDisponible = insumo.opcionesEspecificas.find(
      opcion => !selections.some(s => s.id === opcion.id)
    );

    if (!opcionDisponible) {
      toast.warning('No hay más opciones disponibles para este insumo');
      return;
    }

    const cantidadAjustada = calcularCantidadAjustada();
    const cantidadPorInsumo = cantidadAjustada / (selections.length + 1);

    const nuevasSelecciones = selections.map(item => ({
      ...item,
      cantidadUsada: cantidadPorInsumo * (selections.length / (selections.length + 1))
    }));

    nuevasSelecciones.push({
      ...opcionDisponible,
      cantidadUsada: cantidadPorInsumo,
      uniqueKey: `${insumo.id}-${opcionDisponible.id}-${Date.now()}`
    });

    setSelections(nuevasSelecciones);
    onSelectionChange(insumo.id, nuevasSelecciones);
  };

  const handleRemoveInsumo = (opcionId) => {
    if (selections.length <= 1) {
      toast.warning('Debe mantener al menos una opción seleccionada');
      return;
    }

    const cantidadAjustada = calcularCantidadAjustada();
    const cantidadPorInsumo = cantidadAjustada / (selections.length - 1);

    const nuevasSelecciones = selections
      .filter(item => item.id !== opcionId)
      .map(item => ({
        ...item,
        cantidadUsada: cantidadPorInsumo
      }));

    setSelections(nuevasSelecciones);
    onSelectionChange(insumo.id, nuevasSelecciones);
  };

  const handleCantidadChange = (opcionId, cantidad) => {
    // cantidad viene como string (puede ser "" cuando borras)
    if (cantidad === "") {
      const updatedSelections = selections.map(item =>
        item.id === opcionId
          ? { ...item, cantidadUsada: "" } // dejamos vacío
          : item
      );
      setSelections(updatedSelections);
      onSelectionChange(insumo.id, updatedSelections);
      return;
    }

    const cantidadNumerica = parseFloat(cantidad);

    if (isNaN(cantidadNumerica) || cantidadNumerica < 0) {
      toast.error('La cantidad no puede ser negativa o inválida');
      return;
    }

    const updatedSelections = selections.map(item =>
      item.id === opcionId
        ? { ...item, cantidadUsada: cantidadNumerica }
        : item
    );
    setSelections(updatedSelections);
    onSelectionChange(insumo.id, updatedSelections);
  };


  const cantidadPorLote = insumo.cantidad;
  const cantidadAjustada = calcularCantidadAjustada();
  const cantidadTotal = selections.reduce((sum, item) => sum + (item.cantidadUsada || 0), 0);
  const diferencia = cantidadAjustada - cantidadTotal;
  const isCompleto = Math.abs(diferencia) < 0.01;

  return (
    <div className={`insumo-selector ${!isCompleto ? 'incompleto' : ''}`}>
      <div className="insumo-header">
        <h4>
          {insumo.nombre}
          <span className="requerimientos">
            <span className="requerido-lote">Lote completo: {cantidadPorLote} {insumo.unidadMedida}</span>
            <span className="requerido-ajustado">| Producción actual: {cantidadAjustada.toFixed(2)} {insumo.unidadMedida}</span>
          </span>
          {!isCompleto && (
            <span className="diferencia">
              ({diferencia > 0
                ? `Faltan: ${diferencia.toFixed(2)}`
                : `Exceso: ${Math.abs(diferencia).toFixed(2)}`
              })
            </span>
          )}
        </h4>
        {modoMezcla && (
          <button
            type="button"
            className="btn-add-insumo"
            onClick={handleAddInsumo}
            disabled={selections.length >= insumo.opcionesEspecificas.length}
          >
            + Agregar insumo
          </button>
        )}
      </div>

      <div className="opciones-container">
        {selections.map((opcion) => {
          const opcionOriginal = insumo.opcionesEspecificas.find(o => o.id === opcion.id) || {};
          const porcentaje = (opcion.cantidadUsada / cantidadAjustada) * 100;

          return (
            <div key={opcion.uniqueKey} className="opcion-item">
              <div className="opcion-info">
                <span className="opcion-nombre">
                  {opcionOriginal.nombre || opcion.nombre}
                </span>
                {modoMezcla && (
                  <button
                    type="button"
                    className="btn-remove-insumo"
                    onClick={() => handleRemoveInsumo(opcion.id)}
                  >
                    ×
                  </button>
                )}
              </div>

              <div className="opcion-details">
                <span>Bs. {opcionOriginal.precioActual || opcion.precioActual} / {opcionOriginal.unidades || opcion.unidades}</span>
                {opcionOriginal.stock !== undefined && (
                  <span className="stock-info">Stock: {opcionOriginal.stock}</span>
                )}
              </div>

              <div className="cantidad-input">
                <label>Cantidad a usar ({insumo.unidadMedida}):</label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={opcion.cantidadUsada === "" ? "" : opcion.cantidadUsada}
                  onChange={(e) => handleCantidadChange(opcion.id, e.target.value)}
                  disabled={!editable && selections.length === 1}
                />

                {modoMezcla && (
                  <span className="porcentaje">
                    {porcentaje.toFixed(1)}%
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default InsumoSelector;