import React, { useState, useEffect } from 'react';
import { getActivos, createReceta } from '../../service/api';
import { IoCloseOutline } from 'react-icons/io5';
import { useProductos } from '../../hooks/useProductos';
import './CrearReceta.css';
import { useLocation } from 'react-router-dom';

const CrearReceta = () => {
  const location = useLocation();
  const { productoId, nombreProducto } = location.state || {};

  const [formData, setFormData] = useState({
    nombre: nombreProducto || '',
    descripcion: '',
    cantidadUnidades: '',
    pesoUnitario: '',
    productoId: productoId || ''
  });

  // Estado para los insumos
  const [insumosReceta, setInsumosReceta] = useState([]);
  const [insumoSeleccionado, setInsumoSeleccionado] = useState({
    insumoId: '',
    cantidad: '',
    unidadMedida: 'kg' // Valor por defecto
  });

  // Obtener productos finales usando el hook personalizado
  const {
    productos: productosFinales,
    isFetching: isFetchingProductos,
    refetch: refetchProductos
  } = useProductos('');

  // Datos para los selects de insumos
  const [todosLosInsumos, setTodosLosInsumos] = useState([]);
  const [loadingInsumos, setLoadingInsumos] = useState(false);
  const [error, setError] = useState(null);

  // Unidades de medida disponibles
  const unidadesMedida = [
    { value: 'kg', label: 'Kilogramos (kg)' },
    { value: 'g', label: 'Gramos (g)' },
    { value: 'l', label: 'Litros (l)' },
    { value: 'ml', label: 'Mililitros (ml)' },
    { value: 'unidades', label: 'Unidades' }
  ];

  // Cargar insumos activos al montar el componente
  React.useEffect(() => {
    const cargarInsumos = async () => {
      setLoadingInsumos(true);
      try {
        const insumosResponse = await getActivos();
        setTodosLosInsumos(insumosResponse.data.content);
      } catch (err) {
        setError('Error al cargar los insumos');
        console.error(err);
      } finally {
        setLoadingInsumos(false);
      }
    };

    cargarInsumos();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleInsumoChange = (e) => {
    const { name, value } = e.target;
    setInsumoSeleccionado(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const agregarInsumo = () => {
    if (!insumoSeleccionado.insumoId || !insumoSeleccionado.cantidad) {
      alert('Por favor seleccione un insumo y especifique la cantidad');
      return;
    }

    // Verificar si el insumo ya fue agregado
    const existe = insumosReceta.some(
      item => item.insumoId === parseInt(insumoSeleccionado.insumoId)
    );

    if (existe) {
      alert('Este insumo ya fue agregado a la receta');
      return;
    }

    // Obtener información completa del insumo
    const insumoCompleto = todosLosInsumos.find(
      i => i.id === parseInt(insumoSeleccionado.insumoId)
    );

    if (!insumoCompleto) {
      alert('Insumo no encontrado');
      return;
    }

    // Agregar a la lista de insumos
    setInsumosReceta(prev => [
      ...prev,
      {
        insumoId: parseInt(insumoSeleccionado.insumoId),
        cantidad: parseFloat(insumoSeleccionado.cantidad),
        unidadMedida: insumoSeleccionado.unidadMedida,
        nombre: insumoCompleto.nombre,
        marca: insumoCompleto.marca
      }
    ]);

    // Resetear el formulario de insumo
    setInsumoSeleccionado({
      insumoId: '',
      cantidad: '',
      unidadMedida: 'kg'
    });
  };

  const eliminarInsumo = (insumoId) => {
    setInsumosReceta(prev => prev.filter(item => item.insumoId !== insumoId));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Validaciones básicas
    if (!formData.nombre || !formData.productoId || !formData.cantidadUnidades || !formData.pesoUnitario) {
      setError('Por favor complete todos los campos obligatorios');
      return;
    }

    if (insumosReceta.length === 0) {
      setError('Debe agregar al menos un insumo a la receta');
      return;
    }

    // Preparar los datos para enviar al backend
    const recetaData = {
      nombre: formData.nombre,
      descripcion: formData.descripcion,
      cantidadUnidades: parseInt(formData.cantidadUnidades),
      pesoUnitario: parseFloat(formData.pesoUnitario),
      productoId: parseInt(formData.productoId),
      insumos: insumosReceta.map(item => ({
        insumoId: item.insumoId,
        cantidad: item.cantidad,
        unidadMedida: item.unidadMedida
      }))
    };

    try {
      setLoadingInsumos(true);
      await createReceta(recetaData);
      alert('Receta creada exitosamente!');
      
      // Resetear el formulario
      setFormData({
        nombre: '',
        descripcion: '',
        cantidadUnidades: '',
        pesoUnitario: '',
        productoId: ''
      });
      setInsumosReceta([]);
    } catch (err) {
      console.error('Error al crear la receta:', err);
      setError('Error al crear la receta. Por favor intente nuevamente.');
    } finally {
      setLoadingInsumos(false);
    }
  };

  useEffect(() => {
    // Si recibimos el productoId y nombreProducto, actualizamos el estado
    if (productoId && nombreProducto) {
      setFormData(prev => ({
        ...prev,
        productoId,
        nombre: nombreProducto
      }));
    }
  }, [productoId, nombreProducto]);

  if (loadingInsumos && !todosLosInsumos.length) {
    return <div className="loading">Cargando datos...</div>;
  }

  return (
    <div className="crear-receta-container">
      <h2>Crear Nueva Receta de Producción</h2>
      
      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit}>
        {/* Sección de información básica */}
        <div className="form-section">
          <h3>Información Básica</h3>
          
          <div className="form-group">
            <label>Nombre de la Receta*</label>
            <input
              type="text"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Descripción</label>
            <textarea
              name="descripcion"
              value={formData.descripcion}
              onChange={handleChange}
              rows="3"
            />
          </div>

          <div className="form-group">
        <label>Producto Final*</label>
        {productoId ? (
          <input
            type="text"
            value={nombreProducto}
            readOnly
            className="read-only-input"
          />
        ) : (
          <select
            name="productoId"
            value={formData.productoId}
            onChange={handleChange}
            required
            disabled={isFetchingProductos || !!productoId}
          >
            <option value="">Seleccione un producto</option>
            {productosFinales.map(producto => (
              <option key={producto.id} value={producto.id}>
                {producto.descripcion}
              </option>
            ))}
          </select>
        )}
        {isFetchingProductos && <small>Cargando productos...</small>}
      </div>

          <div className="form-row">
            <div className="form-group">
              <label>Cantidad de Unidades*</label>
              <input
                type="number"
                name="cantidadUnidades"
                min="1"
                value={formData.cantidadUnidades}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Peso Unitario (kg)*</label>
              <input
                type="number"
                name="pesoUnitario"
                step="0.001"
                min="0.001"
                value={formData.pesoUnitario}
                onChange={handleChange}
                required
              />
            </div>
          </div>
        </div>

        {/* Sección de insumos */}
        <div className="form-section">
          <h3>Insumos Requeridos</h3>
          
          <div className="agregar-insumo">
            <div className="form-row">
              <div className="form-group">
                <label>Insumo</label>
                <select
                  name="insumoId"
                  value={insumoSeleccionado.insumoId}
                  onChange={handleInsumoChange}
                  disabled={loadingInsumos}
                >
                  <option value="">Seleccione un insumo</option>
                  {todosLosInsumos.map(insumo => (
                    <option key={insumo.id} value={insumo.id}>
                      {insumo.nombre} ({insumo.marca})
                    </option>
                  ))}
                </select>
                {loadingInsumos && <small>Cargando insumos...</small>}
              </div>

              <div className="form-group">
                <label>Cantidad</label>
                <input
                  type="number"
                  name="cantidad"
                  step="0.001"
                  min="0.001"
                  value={insumoSeleccionado.cantidad}
                  onChange={handleInsumoChange}
                  disabled={!insumoSeleccionado.insumoId}
                />
              </div>

              <div className="form-group">
                <label>Unidad de Medida</label>
                <select
                  name="unidadMedida"
                  value={insumoSeleccionado.unidadMedida}
                  onChange={handleInsumoChange}
                  disabled={!insumoSeleccionado.insumoId}
                >
                  {unidadesMedida.map(unidad => (
                    <option key={unidad.value} value={unidad.value}>
                      {unidad.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button
              type="button"
              className="btn-agregar"
              onClick={agregarInsumo}
              disabled={!insumoSeleccionado.insumoId || !insumoSeleccionado.cantidad || loadingInsumos}
            >
              Agregar Insumo
            </button>
          </div>

          {/* Lista de insumos agregados */}
          <div className="insumos-list">
            <h4>Insumos en la Receta</h4>
            
            {insumosReceta.length === 0 ? (
              <p className="no-items">No hay insumos agregados</p>
            ) : (
              <ul>
                {insumosReceta.map((insumo, index) => (
                  <li key={index} className="insumo-item">
                    <div className="insumo-info">
                      <span className="insumo-nombre">{insumo.nombre} ({insumo.marca})</span>
                      <span className="insumo-cantidad">
                        {insumo.cantidad} {insumo.unidadMedida}
                      </span>
                    </div>
                    <button
                      type="button"
                      className="btn-eliminar"
                      onClick={() => eliminarInsumo(insumo.insumoId)}
                      disabled={loadingInsumos}
                    >
                      <IoCloseOutline size={18} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="form-actions">
          <button
            type="submit"
            className="btn-primary"
            disabled={loadingInsumos}
          >
            {loadingInsumos ? 'Guardando...' : 'Guardar Receta'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CrearReceta;