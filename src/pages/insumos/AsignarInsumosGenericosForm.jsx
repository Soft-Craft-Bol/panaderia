import React, { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { asignarInsumosGenericos, updateAsignacionInsumoGenerico, getInsumoGenericoById } from '../../service/api';
import SelectorInsumosPaginado from '../../components/selected/SelectorInsumosPaginado';
import { toast } from 'sonner';
import { FaPlus, FaTrash } from 'react-icons/fa';
import { useInsumosGenericos } from '../../hooks/useInsumosGenericos';
import { useInsumos } from '../../hooks/useInsumos';
import SelectorInsumosGenericosPaginado from '../../components/selected/SelectorInsumosGenericosPaginado';
import { Button } from '../../components/buttons/Button';
import './AsignarInsumosGenericosForm.css';

const validationSchema = Yup.object().shape({
  insumoGenerico: Yup.object()
    .required('Debe seleccionar un insumo genérico'),
  insumosEspecificos: Yup.array()
    .min(1, 'Debe asignar al menos un insumo específico')
    .required('Debe asignar al menos un insumo específico')
    .test('prioridades-validas', 'Todas las prioridades deben estar entre 1 y 1000', function (value) {
      if (!value || value.length === 0) return true;
      return value.every(insumo =>
        insumo.prioridad &&
        insumo.prioridad >= 1 &&
        insumo.prioridad <= 1000
      );
    })
    .test('prioridades-unicas', 'No puede haber prioridades duplicadas', function (value) {
      if (!value || value.length === 0) return true;
      const prioridades = value.map(insumo => insumo.prioridad);
      return prioridades.length === new Set(prioridades).size;
    })
});

const AsignarInsumosGenericosForm = ({
  insumoGenerico,
  onSuccess,
  onCancel
}) => {
  const [filtroNombreGenerico, setFiltroNombreGenerico] = useState('');
  const [filtroNombreEspecifico, setFiltroNombreEspecifico] = useState('');
  const [insumoEspecificoSeleccionado, setInsumoEspecificoSeleccionado] = useState(null);

  const { data: insumoGenericoCompleto } = useQuery({
    queryKey: ['insumoGenerico', insumoGenerico?.id],
    queryFn: () => getInsumoGenericoById(insumoGenerico.id),
    enabled: !!insumoGenerico?.id,
    initialData: insumoGenerico,
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
  const insumosgenericos = insumoGenericoCompleto?.insumosAsociados || [];

  const asignacionesExistentes = insumosgenericos.map(asignacion => ({
    id: asignacion.id,
    insumoId: asignacion.insumoId,
    nombre: asignacion.nombreInsumo,
    prioridad: asignacion.prioridad,
    unidades: 'unidad'
  })) || [];


  const {
    data: insumosGenericos = [],
    fetchNextPage: fetchNextPageGenericos,
    hasNextPage: hasNextPageGenericos,
    isFetchingNextPage: isFetchingNextPageGenericos,
    isLoading: loadingGenericos,
    refetch: refetchGenericos
  } = useInsumosGenericos({
    nombre: filtroNombreGenerico
  });

  const insumosGenericosFlattened = insumosGenericos.pages?.flatMap(page => page.data) || [];

  const {
    data: insumosEspecificos = [],
    fetchNextPage: fetchNextPageEspecificos,
    hasNextPage: hasNextPageEspecificos,
    isFetchingNextPage: isFetchingNextPageEspecificos,
    isLoading: loadingEspecificos,
    refetch: refetchEspecificos
  } = useInsumos({
    nombre: filtroNombreEspecifico
  });

  const asignarMutation = useMutation({
    mutationFn: (data) => {
      const payload = data.insumosEspecificos.map(insumo => ({
        id: insumo.id,
        insumoId: insumo.insumoId || insumo.id,
        nombreInsumo: insumo.nombre,
        prioridad: parseInt(insumo.prioridad, 10)
      }));

      return asignacionesExistentes.length > 0
        ? updateAsignacionInsumoGenerico(data.insumoGenerico.id, payload)
        : asignarInsumosGenericos(data.insumoGenerico.id, payload);
    },
    onSuccess: (response) => {
      toast.success(asignacionesExistentes.length > 0
        ? 'Asignaciones actualizadas correctamente'
        : 'Insumos asignados correctamente');
      onSuccess();
    },
    onError: (error) => {
      const errorMessage = error.response?.data?.message ||
        error.message ||
        'Error al asignar insumos';
      toast.error(errorMessage);
    }
  });

  const handleInsumoEspecificoSelect = (insumo) => {
    setInsumoEspecificoSeleccionado(insumo);
  };

  const handleSearchGenericos = (searchTerm) => {
    setFiltroNombreGenerico(searchTerm);
  };

  const handleSearchEspecificos = (searchTerm) => {
    setFiltroNombreEspecifico(searchTerm);
  };

  // FUNCIÓN DE ENVÍO CORREGIDA
  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      if (!values.insumoGenerico) {
        toast.error('Debe seleccionar un insumo genérico');
        setSubmitting(false);
        return;
      }

      if (!values.insumosEspecificos || values.insumosEspecificos.length === 0) {
        toast.error('Debe asignar al menos un insumo específico');
        setSubmitting(false);
        return;
      }

      const prioridadesInvalidas = values.insumosEspecificos.some(insumo =>
        !insumo.prioridad || insumo.prioridad < 1 || insumo.prioridad > 1000
      );

      if (prioridadesInvalidas) {
        toast.error('Todas las prioridades deben estar entre 1 y 1000');
        setSubmitting(false);
        return;
      }

      await asignarMutation.mutateAsync(values);

    } catch (error) {
      console.error('Error en handleSubmit:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const agregarInsumoEspecifico = (values, setFieldValue) => {
    if (!insumoEspecificoSeleccionado) {
      toast.warning('Seleccione un insumo específico primero');
      return;
    }

    const yaAsignado = values.insumosEspecificos.some(i => i.id === insumoEspecificoSeleccionado.id);
    if (yaAsignado) {
      toast.warning('Este insumo ya está asignado');
      return;
    }

    const prioridadesUsadas = values.insumosEspecificos.map(i => parseInt(i.prioridad, 10));
    let nuevaPrioridad = 1;
    while (prioridadesUsadas.includes(nuevaPrioridad)) {
      nuevaPrioridad++;
    }

    const nuevoInsumo = {
      ...insumoEspecificoSeleccionado,
      prioridad: nuevaPrioridad,
      nombreInsumo: insumoEspecificoSeleccionado.nombre || 'Nombre no disponible'
    };

    setFieldValue('insumosEspecificos', [
      ...values.insumosEspecificos,
      nuevoInsumo
    ]);

    setInsumoEspecificoSeleccionado(null);
    setFiltroNombreEspecifico('');
  };

  const eliminarInsumoEspecifico = (values, setFieldValue, index) => {
    const nuevosInsumos = [...values.insumosEspecificos];
    const eliminado = nuevosInsumos.splice(index, 1);
    setFieldValue('insumosEspecificos', nuevosInsumos);
  };

  return (
    <div className="asignar-insumos-container">
      <Formik
        initialValues={{
          insumoGenerico: insumoGenericoCompleto || null,
          insumosEspecificos: asignacionesExistentes,
        }}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
        validateOnChange={true}
        validateOnBlur={true}
        enableReinitialize={true}
      >
        {({ values, setFieldValue, isSubmitting, errors, isValid }) => {

          return (
            <Form className="asignar-insumos-form">
              <div className="form-section-asignacion">
                {insumoGenerico && (
                  <div className="form-section-asignacion">
                    <h3 className="section-title-asignacion">Insumo Genérico</h3>
                    <div className="selected-generic-card">
                      <div className="generic-info">
                        <strong>{insumoGenerico.nombre} </strong>
                        <span>
                          - {insumoGenerico.unidadMedida}
                        </span>
                      </div>
                      <div className="generic-description">
                        {insumoGenerico.descripcion || 'Sin descripción'}
                      </div>
                    </div>
                  </div>
                )}
                {!insumoGenerico && (
                  <div className="form-section-asignacion">
                    <h3 className="section-title-asignacion">Seleccionar Insumo Genérico</h3>
                    <SelectorInsumosGenericosPaginado
                      insumosGenericos={insumosGenericosFlattened}
                      value={values.insumoGenerico?.id}
                      onChange={(insumo) => {
                        console.log('Insumo genérico seleccionado:', insumo); // DEBUG
                        setFieldValue('insumoGenerico', insumo);
                      }}
                      onLoadMore={fetchNextPageGenericos}
                      hasNextPage={hasNextPageGenericos}
                      isFetchingNextPage={isFetchingNextPageGenericos}
                      isLoading={loadingGenericos}
                      placeholder="Buscar insumo genérico..."
                      onSearch={handleSearchGenericos}
                    />

                    {errors.insumoGenerico && (
                      <div className="error-message">{errors.insumoGenerico}</div>
                    )}
                  </div>
                )}

              </div>

              <div className="form-section-asignacion">
                <h3 className="section-title-asignacion">Seleccionar Insumos Específicos</h3>

                <div className="selector-container-asignacion">
                  <SelectorInsumosPaginado
                    insumos={insumosEspecificos}
                    value={insumoEspecificoSeleccionado?.id}
                    onChange={handleInsumoEspecificoSelect}
                    onLoadMore={fetchNextPageEspecificos}
                    hasNextPage={hasNextPageEspecificos}
                    isFetchingNextPage={isFetchingNextPageEspecificos}
                    isLoading={loadingEspecificos}
                    placeholder="Seleccionar insumo específico..."
                    onSearch={handleSearchEspecificos}
                  />

                  <Button
                    variant="primary"
                    onClick={() => agregarInsumoEspecifico(values, setFieldValue)}
                    disabled={!insumoEspecificoSeleccionado}
                  >
                    <FaPlus style={{ marginRight: 4 }} />
                    Agregar
                  </Button>
                </div>

                <div className="insumos-asignados">
                  <h4>Insumos asignados</h4>

                  {values.insumosEspecificos.length === 0 && (
                    <p className="no-items">Aún no se ha agregado ningún insumo específico.</p>
                  )}

                  <ul className="insumos-list">
                    {values.insumosEspecificos.map((insumo, index) => (
                      <li key={`${insumo.id}-${index}`} className="insumo-mini-card">
                        <div>
                          <strong>{insumo.nombre}</strong>
                          <span className="unidad">({insumo.unidades})</span>
                        </div>
                        <div className="prioridad-edit">
                          <label>Prioridad:</label>
                          <input
                            type="number"
                            min={1}
                            max={1000}
                            value={insumo.prioridad || ''}
                            onChange={(e) => {
                              const valor = parseInt(e.target.value, 10);
                              if (!isNaN(valor)) {
                                const nuevaLista = [...values.insumosEspecificos];
                                nuevaLista[index].prioridad = valor;
                                setFieldValue('insumosEspecificos', nuevaLista);
                              }
                            }}
                          />
                        </div>
                        <button
                          type="button"
                          className="btn-eliminar"
                          onClick={() => eliminarInsumoEspecifico(values, setFieldValue, index)}
                        >
                          <FaTrash />
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>

                {errors.insumosEspecificos && (
                  <div className="error-message">{errors.insumosEspecificos}</div>
                )}
              </div>

              <div className="form-actions-asignacion">
                <Button
                  type="submit"
                  variant="primary"
                  disabled={isSubmitting || asignarMutation.isPending || !isValid || values.insumosEspecificos.length === 0}
                  onClick={(e) => {
                    if (!isValid) {
                      console.log('Errores de validación:', errors);
                      toast.error('Por favor complete todos los campos correctamente');
                    }
                    e.stopPropagation();
                  }}
                >
                  {isSubmitting || asignarMutation.isPending
                    ? 'Asignando...'
                    : 'Asignar Insumos'}
                </Button>

                <Button
                  type="button"
                  variant="secondary"
                  onClick={onCancel}
                >
                  Cancelar
                </Button>
              </div>
            </Form>
          );
        }}
      </Formik>
    </div>
  );
};

export default AsignarInsumosGenericosForm;