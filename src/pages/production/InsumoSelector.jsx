import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import Modal from '../../components/modal/Modal'; // Ajusta la ruta según tu estructura
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
  const [showModalMasivo, setShowModalMasivo] = useState(false);
  const [seleccionesTemporales, setSeleccionesTemporales] = useState([]);

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

  // Abrir modal para selección masiva
  const abrirModalMasivo = () => {
    // Inicializar selecciones temporales con las actuales + opciones disponibles
    const opcionesDisponibles = insumo.opcionesEspecificas.filter(
      opcion => !selections.some(s => s.id === opcion.id)
    );
    
    setSeleccionesTemporales([
      ...selections.map(opcion => ({ 
        ...opcion, 
        seleccionado: true,
        cantidadUsada: opcion.cantidadUsada 
      })),
      ...opcionesDisponibles.map(opcion => ({
        ...opcion,
        seleccionado: false,
        cantidadUsada: 0,
        uniqueKey: `${insumo.id}-${opcion.id}-temp`
      }))
    ]);
    setShowModalMasivo(true);
  };

  // Aplicar selección masiva
  const aplicarSeleccionMasiva = () => {
    const seleccionadas = seleccionesTemporales
      .filter(opcion => opcion.seleccionado && opcion.cantidadUsada > 0)
      .map(opcion => ({
        id: opcion.id,
        nombre: opcion.nombre,
        precioActual: opcion.precioActual,
        unidades: opcion.unidades,
        stock: opcion.stock,
        cantidadUsada: opcion.cantidadUsada,
        uniqueKey: `${insumo.id}-${opcion.id}-${Date.now()}`
      }));

    if (seleccionadas.length === 0) {
      toast.error('Debe seleccionar al menos un insumo con cantidad mayor a 0');
      return;
    }

    // Distribuir la cantidad total entre las selecciones
    const cantidadAjustada = calcularCantidadAjustada();
    const totalSeleccionado = seleccionadas.reduce((sum, item) => sum + item.cantidadUsada, 0);
    
    const seleccionesAjustadas = seleccionadas.map(item => ({
      ...item,
      cantidadUsada: (item.cantidadUsada / totalSeleccionado) * cantidadAjustada
    }));

    setSelections(seleccionesAjustadas);
    onSelectionChange(insumo.id, seleccionesAjustadas);
    setShowModalMasivo(false);
    toast.success(`${seleccionesAjustadas.length} insumos seleccionados`);
  };

  // Manejar cambios en el modal
  const handleToggleSeleccion = (opcionId) => {
    setSeleccionesTemporales(prev => 
      prev.map(opcion => 
        opcion.id === opcionId 
          ? { ...opcion, seleccionado: !opcion.seleccionado }
          : opcion
      )
    );
  };

  const handleCantidadTemporalChange = (opcionId, cantidad) => {
    const cantidadNumerica = parseFloat(cantidad) || 0;
    
    setSeleccionesTemporales(prev => 
      prev.map(opcion => 
        opcion.id === opcionId 
          ? { ...opcion, cantidadUsada: cantidadNumerica }
          : opcion
      )
    );
  };

  // Distribuir cantidad equitativamente
  const distribuirEquitativamente = () => {
    const seleccionadas = seleccionesTemporales.filter(opcion => opcion.seleccionado);
    if (seleccionadas.length === 0) {
      toast.warning('No hay insumos seleccionados');
      return;
    }

    const cantidadPorInsumo = calcularCantidadAjustada() / seleccionadas.length;
    
    setSeleccionesTemporales(prev => 
      prev.map(opcion => 
        opcion.seleccionado 
          ? { ...opcion, cantidadUsada: cantidadPorInsumo }
          : opcion
      )
    );
  };

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
    if (cantidad === "") {
      const updatedSelections = selections.map(item =>
        item.id === opcionId
          ? { ...item, cantidadUsada: "" }
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
    <>
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
            <div className="insumo-actions">
              <button
                type="button"
                className="btn-add-insumo"
                onClick={handleAddInsumo}
                disabled={selections.length >= insumo.opcionesEspecificas.length}
              >
                + Agregar uno
              </button>
              <button
                type="button"
                className="btn-add-masivo"
                onClick={abrirModalMasivo}
              >
                📦 Selección masiva
              </button>
            </div>
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

      {/* Modal de selección masiva */}
      <Modal
        isOpen={showModalMasivo}
        onClose={() => setShowModalMasivo(false)}
        title={`Selección masiva - ${insumo.nombre}`}
        size="lg"
      >
        <div className="modal-masivo-content">
          <div className="masivo-header">
            <p>Selecciona los insumos y asigna cantidades. Total requerido: <strong>{calcularCantidadAjustada().toFixed(2)} {insumo.unidadMedida}</strong></p>
            <button
              type="button"
              className="btn-distribuir"
              onClick={distribuirEquitativamente}
            >
              🔄 Distribuir equitativamente
            </button>
          </div>

          <div className="masivo-opciones-list">
            {seleccionesTemporales.map((opcion) => (
              <div key={opcion.uniqueKey} className="masivo-opcion-item">
                <div className="masivo-opcion-checkbox">
                  <input
                    type="checkbox"
                    checked={opcion.seleccionado || false}
                    onChange={() => handleToggleSeleccion(opcion.id)}
                  />
                  <span className="masivo-opcion-nombre">
                    {opcion.nombre}
                  </span>
                </div>

                <div className="masivo-opcion-details">
                  <span>Bs. {opcion.precioActual} / {opcion.unidades}</span>
                  {opcion.stock !== undefined && (
                    <span className="stock-info">Stock: {opcion.stock}</span>
                  )}
                </div>

                <div className="masivo-cantidad-input">
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={opcion.cantidadUsada || 0}
                    onChange={(e) => handleCantidadTemporalChange(opcion.id, e.target.value)}
                    disabled={!opcion.seleccionado}
                    placeholder="Cantidad"
                  />
                  <span>{insumo.unidadMedida}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="masivo-actions">
            <button
              type="button"
              className="btn-cancelar"
              onClick={() => setShowModalMasivo(false)}
            >
              Cancelar
            </button>
            <button
              type="button"
              className="btn-aplicar"
              onClick={aplicarSeleccionMasiva}
            >
              Aplicar selección
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default InsumoSelector;