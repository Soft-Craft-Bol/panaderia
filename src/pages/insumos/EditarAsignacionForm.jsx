import React from 'react';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { updateAsignacionInsumoGenerico } from '../../service/api';
import InputText from '../../components/inputs/InputText';
import ButtonPrimary from '../../components/buttons/ButtonPrimary';
import SelectorInsumosPaginado from '../../components/selected/SelectorInsumosPaginado';
import { useInsumos } from '../../hooks/useInsumos';
import { useQuery } from '@tanstack/react-query';
import { getInsumoGenericoById } from '../../service/api';


const validationSchema = Yup.object().shape({
  prioridad: Yup.number()
    .required('La prioridad es requerida')
    .min(1, 'La prioridad mínima es 1')
    .max(1000, 'La prioridad máxima es 1000'),
  insumoId: Yup.number()
    .required('Debe seleccionar un insumo')
});

const EditarAsignacionForm = ({  genericoId, asignacionId, onClose }) => {
  const [filtroNombre, setFiltroNombre] = useState('');
  const queryClient = useQueryClient();

  const {
    data: insumos,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: isLoadingInsumos
  } = useInsumos({
    nombre: filtroNombre
  });

  const { data: insumoGenerico, isLoading } = useQuery({
    queryKey: ['insumoGenerico', genericoId],
    queryFn: () => getInsumoGenericoById(genericoId).then(res => res.data)
  });

  const asignacion = insumoGenerico.insumosAsociados.find(a => a.id === asignacionId);

  const updateMutation = useMutation({
    mutationFn: ({ genericoId, asignacionId, data }) => 
      updateAsignacionInsumoGenerico(genericoId, asignacionId, data),
    onSuccess: () => {
      toast.success('Asignación actualizada correctamente');
      queryClient.invalidateQueries(['insumosGenericos']);
      onSuccess();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Error al actualizar asignación');
    }
  });

  const handleSubmit = (values, { setSubmitting }) => {
    updateMutation.mutate({
      genericoId: insumoGenerico.id,
      asignacionId: asignacion.id,
      data: {
        insumoId: values.insumoId,
        prioridad: values.prioridad
      }
    });
    setSubmitting(false);
  };

  return (
    <div className="editar-asignacion-form">
      <h2>Editar Asignación</h2>
      
      <Formik
        initialValues={{
          insumoId: asignacion.insumoId,
          nombreInsumo: asignacion.nombreInsumo,
          prioridad: asignacion.prioridad
        }}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ values, setFieldValue, isSubmitting }) => (
          <Form>
            <div className="form-group">
              <label>Insumo Específico</label>
              <SelectorInsumosPaginado
                insumos={insumos}
                value={values.insumoId}
                onChange={(insumo) => {
                  setFieldValue('insumoId', insumo.id);
                  setFieldValue('nombreInsumo', insumo.nombre);
                }}
                onLoadMore={fetchNextPage}
                hasNextPage={hasNextPage}
                isFetchingNextPage={isFetchingNextPage}
                isLoading={isLoading}
                placeholder="Buscar insumo..."
                onSearch={setFiltroNombre}
              />
            </div>

            <div className="form-group">
              <InputText
                label="Prioridad"
                name="prioridad"
                type="number"
                min={1}
                max={1000}
                required
              />
            </div>

            <div className="form-actions">
              <ButtonPrimary
                type="submit"
                variant="primary"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
              </ButtonPrimary>

              <ButtonPrimary
                type="button"
                variant="secondary"
                onClick={onCancel}
              >
                Cancelar
              </ButtonPrimary>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default EditarAsignacionForm;