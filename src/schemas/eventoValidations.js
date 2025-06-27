import * as Yup from 'yup';

export const eventoValidationSchema = Yup.object({
  cufdEvento: Yup.string().required('Selecciona un CUFD'),
  fechaHoraInicioEvento: Yup.string().required('Selecciona una fecha de inicio'),
  fechaHoraFinEvento: Yup.string()
    .required('Selecciona una fecha de fin')
    .test('is-greater', 'La fecha fin debe ser mayor a la fecha inicio', function (value) {
      if (!this.parent.fechaHoraInicioEvento || !value) return true;
      return new Date(value) > new Date(this.parent.fechaHoraInicioEvento);
    })
    .test('not-future', 'La fecha fin no puede ser mayor a hoy', function (value) {
      if (!value) return true;
      return new Date(value) <= new Date();
    }),
  codigoMotivoEvento: Yup.number().required('Selecciona un motivo de evento'),
});