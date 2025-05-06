import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getRecetas, createProduccion } from '../../service/api';
import { useSucursales } from '../../hooks/useSucursales';
import './ProduccionForm.css';

const ProduccionForm = () => {
  const { data: recetas = [], isLoading: isLoadingRecetas } = useQuery({
    queryKey: ['recetas'],
    queryFn: getRecetas,
    select: (response) => {
      const data = response.data;
      return data.map(receta => ({
        ...receta,
        producto: {
          ...receta.producto,
          nombre: receta.nombreProducto || `Producto ${receta.productoId}`
        }
      }));
    },
    onError: (error) => {
      console.error('Error al obtener recetas:', error);
    }
  });

  const { data: sucursales = [], isLoading: isLoadingSucursales } = useSucursales();

  const [formData, setFormData] = useState({
    recetaId: '',
    cantidad: 1,
    sucursalId: '',
    observaciones: '' // Eliminamos rendimiento y tiempoEstimado ya que el backend no los necesita
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    setIsSubmitting(true);
  
    try {
      if (!formData.recetaId || !formData.sucursalId) {
        throw new Error('Receta y sucursal son campos obligatorios');
      }
  
      // Solo enviamos los datos que el backend necesita
      const produccionData = {
        recetaId: Number(formData.recetaId),
        cantidad: Number(formData.cantidad),
        sucursalId: Number(formData.sucursalId),
        observaciones: formData.observaciones
      };
  
      // Console.log antes de enviar
      console.log('Datos a enviar a la API:', produccionData);
      console.log('Receta seleccionada:', recetas.find(r => r.id === Number(formData.recetaId)));
      console.log('Sucursal seleccionada:', sucursales.find(s => s.id === Number(formData.sucursalId)));
  
      await createProduccion(produccionData);
      
      setSuccessMessage('Producción registrada correctamente');
      setFormData({
        recetaId: '',
        cantidad: 1,
        sucursalId: '',
        observaciones: ''
      });
    } catch (error) {
      console.error('Error al registrar producción:', error);
      setErrorMessage(error.message || 'Error al registrar producción');
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedReceta = recetas.find(r => r.id === Number(formData.recetaId));
  const unidadesTotales = selectedReceta 
    ? formData.cantidad * selectedReceta.cantidadUnidades 
    : 0;

  return (
    <div className="produccion-container">
      <h2 className="produccion-title">Registro de Producción</h2>
      
      <form onSubmit={handleSubmit} className="produccion-form">
        {successMessage && <div className="alert alert-success">{successMessage}</div>}
        {errorMessage && <div className="alert alert-error">{errorMessage}</div>}

        <div className="form-group">
          <label htmlFor="recetaId">Receta*</label>
          <select
            id="recetaId"
            name="recetaId"
            value={formData.recetaId}
            onChange={handleChange}
            required
            disabled={isLoadingRecetas || isSubmitting}
          >
            <option value="">Seleccione una receta</option>
            {recetas.map(receta => (
              <option key={receta.id} value={receta.id}>
                {receta.nombre} (Rinde: {receta.cantidadUnidades} unidades)
              </option>
            ))}
          </select>
          {isLoadingRecetas && <small>Cargando recetas...</small>}
        </div>

        {selectedReceta && (
          <div className="receta-details">
            <h4>Detalles de la Receta:</h4>
            <p><strong>Producto final:</strong> {selectedReceta.producto?.nombre}</p>
            <p><strong>Descripción:</strong> {selectedReceta.descripcion}</p>
            <p><strong>Insumos requeridos:</strong></p>
            <ul className="insumos-list">
              {selectedReceta.insumos?.map((insumo, index) => (
                <li key={index}>
                  {insumo.nombreInsumo} ({insumo.marcaInsumo}) - {insumo.cantidad} {insumo.unidadMedida}
                  {insumo.precioUnitario && (
                    <span> (Bs. {insumo.precioUnitario.toFixed(2)} c/u)</span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="cantidad">Cantidad de lotes*</label>
            <input
              type="number"
              id="cantidad"
              name="cantidad"
              min="1"
              value={formData.cantidad}
              onChange={handleChange}
              required
              disabled={isSubmitting}
            />
          </div>

          <div className="form-group">
            <label>Unidades totales</label>
            <input
              type="text"
              value={`${unidadesTotales} unidades`}
              readOnly
              className="read-only-input"
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="sucursalId">Sucursal de producción*</label>
          <select
            id="sucursalId"
            name="sucursalId"
            value={formData.sucursalId}
            onChange={handleChange}
            required
            disabled={isLoadingSucursales || isSubmitting}
          >
            <option value="">Seleccione una sucursal</option>
            {sucursales.map(sucursal => (
              <option key={sucursal.id} value={sucursal.id}>
                {sucursal.nombre}
              </option>
            ))}
          </select>
          {isLoadingSucursales && <small>Cargando sucursales...</small>}
        </div>

        <div className="form-group">
          <label htmlFor="observaciones">Observaciones</label>
          <textarea
            id="observaciones"
            name="observaciones"
            value={formData.observaciones}
            onChange={handleChange}
            rows="3"
            disabled={isSubmitting}
            placeholder="Detalles adicionales sobre esta producción..."
          />
        </div>

        <button
          type="submit"
          className="submit-btn"
          disabled={!formData.recetaId || !formData.sucursalId || isSubmitting}
        >
          {isSubmitting ? (
            <>
              <span className="spinner"></span>
              Registrando...
            </>
          ) : (
            'Registrar Producción'
          )}
        </button>
      </form>
    </div>
  );
};

export default ProduccionForm;