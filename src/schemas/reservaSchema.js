import * as Yup from "yup";

export const reservaSchema = Yup.object().shape({
  metodoPago: Yup.string().required("El método de pago es requerido"),
  anticipo: Yup.number()
    .required("El anticipo es requerido")
    .min(0, "El anticipo no puede ser negativo")
    .max(Yup.ref("totalCarrito")),
  observaciones: Yup.string().optional(),
});