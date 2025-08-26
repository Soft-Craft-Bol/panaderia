import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { createReceta, updateReceta, getRecetaID } from '../../service/api';
import { IoCloseOutline } from 'react-icons/io5';
import { Button } from '../../components/buttons/Button';
import InputText from '../../components/inputs/InputText';
import SelectorInsumosGenericosPaginado from '../../components/selected/SelectorInsumosGenericosPaginado';
import './CrearReceta.css';
import { toast, Toaster } from 'sonner';
import BackButton from '../../components/buttons/BackButton';
import { useInsumosGenericos } from '../../hooks/useInsumosGenericos';
import Modal from '../../components/modal/Modal';
import { FaFlask, FaWeight, FaBoxes, FaListOl, FaInfoCircle } from 'react-icons/fa';

const validationSchema = Yup.object().shape({
  nombre: Yup.string().required('El nombre es obligatorio'),
  descripcion: Yup.string().required('La descripción es obligatoria'),
  cantidadUnidades: Yup.number().required('La cantidad es obligatoria').min(1),
  productoId: Yup.number().required('El producto es obligatorio'),
});

const CrearReceta = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { productoId, nombreProducto } = location.state || {};
  const isEditing = !!id;

  const [formData, setFormData] = useState({
    nombre: nombreProducto || '',
    descripcion: '',
    cantidadUnidades: '',
    pesoUnitario: '',
    productoId: productoId || '',
    instrucciones: '',
    tiempoProduccionMinutos: '',
  });

  const [insumosGenericosReceta, setInsumosGenericosReceta] = useState([]);
  const [insumoGenericoSeleccionado, setInsumoGenericoSeleccionado] = useState({
    insumoGenericoId: '',
    cantidad: '',
    unidadMedida: '',
    insumoGenericoCompleto: null
  });

  const [filtroNombreGenerico, setFiltroNombreGenerico] = useState('');
  const [modalInsumosEspecificos, setModalInsumosEspecificos] = useState({
    open: false,
    insumoGenerico: null
  });

  const {
    data: insumosGenericos = [],
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: loadingInsumosGenericos,
    refetch
  } = useInsumosGenericos({
    nombre: filtroNombreGenerico
  });

  const insumosGenericosFlattened = insumosGenericos.pages?.flatMap(page => page.data) || [];

  useEffect(() => {
    if (isEditing) {
      const loadReceta = async () => {
        try {
          const response = await getRecetaID(id);
          const recetaData = response.data;

          setFormData({
            nombre: recetaData.nombre,
            descripcion: recetaData.descripcion || '',
            cantidadUnidades: recetaData.cantidadUnidades,
            pesoUnitario: recetaData.pesoUnitario,
            productoId: recetaData.productoId,
            instrucciones: recetaData.instrucciones,
            tiempoProduccionMinutos: recetaData.tiempoProduccionMinutos
          });

          // Formatear correctamente los insumos genéricos
          const insumosFormateados = recetaData.insumosGenericos?.map(insumo => ({
            insumoGenericoId: insumo.id,
            cantidad: insumo.cantidad,
            unidadMedida: insumo.unidadMedida,
            nombre: insumo.nombre,
            insumosEspecificos: insumo.opcionesEspecificas?.map(opcion => ({
              id: opcion.id,
              nombreInsumo: opcion.nombre,
              prioridad: opcion.prioridad,
              precioActual: opcion.precioActual,
              unidades: opcion.unidades
            })) || []
          })) || [];

          setInsumosGenericosReceta(insumosFormateados);
        } catch (error) {
          toast.error('Error al cargar la receta');
          console.error(error);
        }
      };

      loadReceta();
    } else if (productoId && nombreProducto) {
      setFormData(prev => ({
        ...prev,
        productoId,
        nombre: nombreProducto
      }));
    }
  }, [id, isEditing, productoId, nombreProducto]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleInsumoGenericoChange = (e) => {
    const { name, value } = e.target;
    setInsumoGenericoSeleccionado(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleInsumoGenericoSelect = (insumo) => {
    setInsumoGenericoSeleccionado(prev => ({
      ...prev,
      insumoGenericoId: insumo.id,
      unidadMedida: insumo.unidadMedida,
      insumoGenericoCompleto: insumo
    }));
  };

  const handleSearchInsumosGenericos = (searchTerm) => {
    setFiltroNombreGenerico(searchTerm);
  };

  const agregarInsumoGenerico = () => {
    if (!insumoGenericoSeleccionado.insumoGenericoId || !insumoGenericoSeleccionado.cantidad) {
      toast.warning('Por favor seleccione un insumo y especifique la cantidad');
      return;
    }

    const existe = insumosGenericosReceta.some(
      item => item.insumoGenericoId === parseInt(insumoGenericoSeleccionado.insumoGenericoId)
    );

    if (existe) {
      toast.warning('Este insumo genérico ya fue agregado a la receta');
      return;
    }

    const insumoCompleto = insumoGenericoSeleccionado.insumoGenericoCompleto ||
      insumosGenericosFlattened.find(i => i.id === parseInt(insumoGenericoSeleccionado.insumoGenericoId));

    if (!insumoCompleto) {
      toast.error('Insumo no encontrado');
      return;
    }

    setInsumosGenericosReceta(prev => [
      ...prev,
      {
        insumoGenericoId: parseInt(insumoGenericoSeleccionado.insumoGenericoId),
        cantidad: parseFloat(insumoGenericoSeleccionado.cantidad),
        unidadMedida: insumoGenericoSeleccionado.unidadMedida,
        nombre: insumoCompleto.nombre,
        insumosEspecificos: insumoCompleto.insumosAsociados || []
      }
    ]);

    setInsumoGenericoSeleccionado({
      insumoGenericoId: '',
      cantidad: '',
      unidadMedida: '',
      insumoGenericoCompleto: null
    });

    setFiltroNombreGenerico('');
    toast.success('Insumo genérico agregado correctamente');
  };

  const eliminarInsumoGenerico = (insumoGenericoId) => {
    setInsumosGenericosReceta(prev => prev.filter(item => item.insumoGenericoId !== insumoGenericoId));
    toast.success('Insumo eliminado');
  };

  const mostrarInsumosEspecificos = (insumoGenerico) => {
    setModalInsumosEspecificos({
      open: true,
      insumoGenerico
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.nombre || !formData.productoId || !formData.cantidadUnidades) {
      toast.error('Por favor complete todos los campos obligatorios');
      return;
    }

    if (insumosGenericosReceta.length === 0) {
      toast.error('Debe agregar al menos un insumo genérico a la receta');
      return;
    }

    const recetaData = {
      nombre: formData.nombre,
      descripcion: formData.descripcion,
      cantidadUnidades: parseInt(formData.cantidadUnidades),
      pesoUnitario: formData.pesoUnitario === '' ? null : parseFloat(formData.pesoUnitario),
      productoId: parseInt(formData.productoId),
      instrucciones: formData.instrucciones,
      tiempoProduccionMinutos: formData.tiempoProduccionMinutos,
      insumosGenericos: insumosGenericosReceta.map(item => ({
        insumoGenericoId: item.insumoGenericoId,
        cantidad: item.cantidad,
        unidadMedida: item.unidadMedida
      }))
    };

    try {
      if (isEditing) {
        await updateReceta(id, recetaData);
        toast.success('Receta actualizada exitosamente!');
      } else {
        await createReceta(recetaData);
        toast.success('Receta creada exitosamente!');
      }

      navigate('/recetas');
    } catch (err) {
      console.error('Error al guardar la receta:', err);
      toast.error(`Error al ${isEditing ? 'actualizar' : 'crear'} la receta. Por favor intente nuevamente.`);
    }
  };

  return (
    <div className="crear-receta-container">
      <Toaster position="top-center" />
      <BackButton position="left" to="/recetas" />

      <h2>{isEditing ? 'Editar Receta de Producción' : 'Crear Nueva Receta de Producción'}</h2>

      <Formik
        initialValues={formData}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
        enableReinitialize
      >
        {({ isSubmitting, values, setFieldValue }) => (
          <form onSubmit={handleSubmit} className="receta-form">
            <div className="form-section">
              <h3 className="section-title">Información Básica</h3>

              <div className="form-grid">
                <InputText
                  label="Nombre de la Receta"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  required
                  readOnly={isEditing}
                />

                <div className="form-group">
                  <label>Descripción</label>
                  <textarea
                    name="descripcion"
                    value={formData.descripcion}
                    onChange={handleChange}
                    rows="3"
                    required
                    className="form-textarea"
                  />
                </div>

                <div className="form-group">
                  <label>Producto Final</label>
                  <input
                    type="text"
                    value={nombreProducto || 'Producto asociado'}
                    readOnly
                    className="read-only-input"
                  />
                  <input
                    type="hidden"
                    name="productoId"
                    value={formData.productoId}
                  />
                </div>

                <div className="form-row">
                  <InputText
                    label="Cantidad de Unidades"
                    name="cantidadUnidades"
                    type="number"
                    min="1"
                    step="1"
                    value={formData.cantidadUnidades}
                    onChange={handleChange}
                    required
                  />

                  <InputText
                    label="Peso Unitario (kg)"
                    name="pesoUnitario"
                    type="number"
                    step="0.001"
                    min="0.001"
                    value={formData.pesoUnitario}
                    onChange={handleChange}
                  />
                </div>

                <InputText
                  label="Tiempo de Producción (minutos)"
                  name="tiempoProduccionMinutos"
                  type="number"
                  min="1"
                  value={formData.tiempoProduccionMinutos}
                  onChange={handleChange}
                />

                <div className="form-group">
                  <label>Instrucciones de Producción</label>
                  <textarea
                    name="instrucciones"
                    value={formData.instrucciones}
                    onChange={handleChange}
                    rows="3"
                    className="form-textarea"
                  />
                </div>
              </div>
            </div>

            <div className="form-section">
              <div className="section-header">
                <FaFlask className="section-icon" />
                <h3 className="section-title">Insumos Genéricos Requeridos</h3>
              </div>

              <div className="agregar-insumo">
                <div className="form-row">
                  <div className="form-group">
                    <label>Insumo Genérico *</label>
                    <SelectorInsumosGenericosPaginado
                      insumosGenericos={insumosGenericosFlattened}
                      value={insumoGenericoSeleccionado.insumoGenericoId}
                      onChange={handleInsumoGenericoSelect}
                      onLoadMore={fetchNextPage}
                      hasNextPage={hasNextPage}
                      isFetchingNextPage={isFetchingNextPage}
                      isLoading={loadingInsumosGenericos}
                      placeholder="Seleccionar insumo genérico..."
                      onSearch={handleSearchInsumosGenericos}
                    />
                  </div>

                  <div className="form-group">
                    <label>Cantidad *</label>
                    <InputText
                      name="cantidad"
                      type="number"
                      step="0.001"
                      min="0.001"
                      value={insumoGenericoSeleccionado.cantidad}
                      onChange={handleInsumoGenericoChange}
                      disabled={!insumoGenericoSeleccionado.insumoGenericoId}
                      placeholder="0.000"
                    />
                  </div>

                  <div className="form-group">
                    <label>Unidad de Medida</label>
                    <input
                      type="text"
                      value={insumoGenericoSeleccionado.unidadMedida}
                      readOnly
                      className="read-only-input"
                      placeholder="Se asigna automáticamente"
                    />
                  </div>
                </div>

                <Button
                  variant="primary"
                  type="button"
                  onClick={agregarInsumoGenerico}
                  disabled={!insumoGenericoSeleccionado.insumoGenericoId || !insumoGenericoSeleccionado.cantidad}
                  className="btn-agregar"
                >
                  Agregar Insumo Genérico
                </Button>
              </div>

              <div className="insumos-list">
                <div className="list-header">
                  <h4 className="list-title">
                    Insumos en la Receta ({insumosGenericosReceta.length})
                  </h4>
                </div>

                {insumosGenericosReceta.length === 0 ? (
                  <p className="no-items">No hay insumos genéricos agregados</p>
                ) : (
                  <div className="insumos-grid">
                    {insumosGenericosReceta.map((insumo, index) => (
                      <div key={index} className="insumo-card">
                        <div className="insumo-header">
                          <h4 className="insumo-nombre">{insumo.nombre}</h4>
                          <div className="insumo-cantidad">
                            <FaWeight className="cantidad-icon" />
                            <span>{insumo.cantidad} {insumo.unidadMedida}</span>
                          </div>
                        </div>

                        <div className="insumo-actions">
                          <button
                            type="button"
                            className="btn-ver-especificos"
                            onClick={() => mostrarInsumosEspecificos(insumo)}
                          >
                            <FaListOl className="action-icon" />
                            Ver marcas
                          </button>
                          <button
                            type="button"
                            className="btn-eliminar"
                            onClick={() => eliminarInsumoGenerico(insumo.insumoGenericoId)}
                            aria-label="Eliminar insumo"
                          >
                            <IoCloseOutline size={18} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="form-actions">
              <Button
                type="submit"
                variant="primary"
                disabled={isSubmitting || loadingInsumosGenericos}
                className="btn-submit"
              >
                {isSubmitting
                  ? isEditing
                    ? 'Actualizando...'
                    : 'Guardando...'
                  : isEditing
                    ? 'Actualizar Receta'
                    : 'Guardar Receta'}
              </Button>
            </div>
          </form>
        )}
      </Formik>

      {/* Modal para mostrar insumos específicos */}
      <Modal
        isOpen={modalInsumosEspecificos.open}
        onClose={() => setModalInsumosEspecificos({ open: false, insumoGenerico: null })}
        title={`Marcas disponibles para ${modalInsumosEspecificos.insumoGenerico?.nombre || ''}`}
        size="md"
      >
        {modalInsumosEspecificos.insumoGenerico && (
          <div className="insumos-especificos-modal">
            <div className="modal-content">
              {modalInsumosEspecificos.insumoGenerico.insumosEspecificos.length > 0 ? (
                <div className="opciones-grid">
                  {modalInsumosEspecificos.insumoGenerico.insumosEspecificos
                    .sort((a, b) => a.prioridad - b.prioridad)
                    .map((opcion, idx) => (
                      <div key={idx} className="opcion-card">
                        <div className="opcion-prioridad">
                          <span>{opcion.prioridad}°</span>
                        </div>
                        <div className="opcion-info">
                          <div className="opcion-nombre">{opcion.nombreInsumo}</div>
                          <div className="opcion-detalle">
                            <span className="opcion-precio">${opcion.precioActual || 'N/A'}</span>
                            <span className="opcion-unidad">{opcion.unidades}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <p className="no-opciones">No hay marcas específicas configuradas para este insumo</p>
              )}
            </div>
            <div className="modal-actions">
              <Button
                variant="primary"
                onClick={() => setModalInsumosEspecificos({ open: false, insumoGenerico: null })}
              >
                Cerrar
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default CrearReceta;