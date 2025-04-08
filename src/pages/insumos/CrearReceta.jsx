import React, { useState, useEffect } from 'react';
import { getInsumos, createReceta, getRecetas } from '../../service/api';
import { IoCloseOutline } from 'react-icons/io5';
import './CrearReceta.css';

const CrearReceta = () => {
  const [nombre, setNombre] = useState("");
  const [productoFinalId, setProductoFinalId] = useState("");
  const [peso, setPeso] = useState("");
  const [cantidadUnidades, setCantidadUnidades] = useState("");
  const [insumos, setInsumos] = useState([]);
  const [selectedInsumo, setSelectedInsumo] = useState("");
  const [cantidad, setCantidad] = useState("");
  const [todosLosInsumos, setTodosLosInsumos] = useState([]);
  const [productosFinales, setProductosFinales] = useState([]);

  useEffect(() => {
    cargarInsumos();
    setProductosFinales([
      { id: 1, nombre: "Pan Integral" },
      { id: 2, nombre: "Pan Blanco" },
      { id: 3, nombre: "Pan de Centeno" }
    ]);
  }, []);

  const cargarInsumos = async () => {
    try {
      const response = await getInsumos();
      setTodosLosInsumos(response.data);
    } catch (error) {
      console.error("Error al obtener insumos:", error);
    }
  };

  const toggleInsumo = () => {
    if (!selectedInsumo || !cantidad) return;
    
    const insumoSeleccionado = todosLosInsumos.find(i => i.id === parseInt(selectedInsumo, 10));
    if (!insumoSeleccionado) return;

    // Check if this insumo is already selected
    const exists = insumos.some(i => i.insumoId === insumoSeleccionado.id);
    if (exists) {
      alert("Este insumo ya fue agregado");
      return;
    }

    setInsumos(prev => [
      ...prev,
      {
        insumoId: insumoSeleccionado.id,
        cantidad: parseFloat(cantidad),
        nombre: insumoSeleccionado.nombre // Adding name for display
      }
    ]);
    
    // Reset selection
    setSelectedInsumo("");
    setCantidad("");
  };

  const removeInsumo = (insumoId) => {
    setInsumos(prev => prev.filter(i => i.insumoId !== insumoId));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!nombre || !productoFinalId || !peso || !cantidadUnidades || insumos.length === 0) {
      alert("Por favor complete todos los campos y agregue al menos un insumo");
      return;
    }

    const recetaData = {
      nombre,
      productoFinalId: parseInt(productoFinalId, 10),
      peso: parseFloat(peso),
      cantidadUnidades: parseInt(cantidadUnidades, 10),
      insumos: insumos.map(i => ({
        insumoId: i.insumoId,
        cantidad: i.cantidad
      }))
    };

    try {
      await createReceta(recetaData);
      alert("Receta creada correctamente");
      // Reset form
      setNombre("");
      setProductoFinalId("");
      setPeso("");
      setCantidadUnidades("");
      setInsumos([]);
    } catch (error) {
      console.error("Error al crear la receta:", error);
      alert("Error al crear la receta");
    }
  };

  return (
    <div className="crear-receta-container">
      <h2>Crear Nueva Receta</h2>
      <form onSubmit={handleSubmit}>
        <label>Nombre de la Receta:</label>
        <input 
          type="text" 
          value={nombre} 
          onChange={(e) => setNombre(e.target.value)} 
          required 
        />

        <label>Producto Final:</label>
        <select 
          value={productoFinalId} 
          onChange={(e) => setProductoFinalId(e.target.value)}
          required
        >
          <option value="">Seleccione un producto</option>
          {productosFinales.map(producto => (
            <option key={producto.id} value={producto.id}>{producto.nombre}</option>
          ))}
        </select>

        <label>Peso (kg):</label>
        <input 
          type="number" 
          step="0.1" 
          value={peso} 
          onChange={(e) => setPeso(e.target.value)} 
          required 
        />

        <label>Cantidad de Unidades:</label>
        <input 
          type="number" 
          value={cantidadUnidades} 
          onChange={(e) => setCantidadUnidades(e.target.value)} 
          required 
        />

        <h3>Insumos:</h3>
        <div className="insumos-selector">
          <select 
            value={selectedInsumo} 
            onChange={(e) => setSelectedInsumo(e.target.value)}
          >
            <option value="">Seleccione un insumo</option>
            {todosLosInsumos.map(insumo => (
              <option key={insumo.id} value={insumo.id}>
                {insumo.nombre} ({insumo.marca})
              </option>
            ))}
          </select>

          <input 
            type="number" 
            step="0.1" 
            placeholder="Cantidad" 
            value={cantidad} 
            onChange={(e) => setCantidad(e.target.value)}
            disabled={!selectedInsumo}
          />

          <button 
            type="button" 
            onClick={toggleInsumo}
            disabled={!selectedInsumo || !cantidad}
          >
            Agregar
          </button>
        </div>

        <div className="insumos-seleccionados">
          <h4>Insumos Seleccionados:</h4>
          {insumos.length === 0 ? (
            <p>No hay insumos seleccionados</p>
          ) : (
            <ul>
              {insumos.map((insumo, index) => (
                <li key={index} className="insumo-item">
                  <span>
                    {insumo.nombre} - {insumo.cantidad} {todosLosInsumos.find(i => i.id === insumo.insumoId)?.unidades || ''}
                  </span>
                  <button 
                    type="button" 
                    onClick={() => removeInsumo(insumo.insumoId)}
                    className="remove-btn"
                  >
                    <IoCloseOutline size={20} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <button type="submit" className="submit-btn">Guardar Receta</button>
      </form>
    </div>
  );
};

export default CrearReceta;