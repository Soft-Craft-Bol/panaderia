import React from "react";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import InputText from "../../components/inputs/InputText";
import SelectSecondary from "../../components/selected/SelectSecondary";
import { Button } from "../../components/buttons/Button";
import { useCajaActiva } from "../../hooks/useHistorialCajas";
import { abonarVentaCredito } from "../../service/api";
import { toast } from "sonner";
import { getUser } from "../../utils/authFunctions";

const METODOS_PAGO = [
  { value: "EFECTIVO", label: "Efectivo" },
  { value: "BILLETERA MOVIL", label: "QR-BILLETERA MOVIL" },
];

const AbonarVenta = ({ venta, onClose, onSuccess }) => {
  const validationSchema = Yup.object().shape({
    montoAbono: Yup.number()
      .required("Este campo es requerido")
      .min(0.01, "El mínimo es 0.01"),
    metodoPago: Yup.string().required("Seleccione un método"),
    referencia: Yup.string()
      .max(100, "Máx. 100 caracteres")
      .nullable(),
  });

  const currentUser = getUser();

  const {
      data: cajaActiva,
      isLoading: isLoadingCaja,
      refetch: refetchCaja
  } = useCajaActiva(currentUser?.id);

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      const payload = {
        ...values,
        cajaId: cajaActiva?.id || 0, 
        usuario: currentUser?.username,
      };
      await abonarVentaCredito(venta.ventaId, payload);

      toast.success("Abono registrado correctamente");
      onSuccess();
      onClose();
    } catch (error) {
      console.error(error);
      toast.error(error?.response?.data || "Error al registrar el abono");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="">
      <div className="">
        <h2>Registrar Abono</h2>
        <p>
          <strong>Venta ID:</strong> {venta.ventaId}
          <br />
          <strong>Saldo Pendiente:</strong> Bs {venta.saldoPendiente.toFixed(2)}
        </p>

        <Formik
          initialValues={{
            montoAbono: "",
            metodoPago: "",
            referencia: "",
          }}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting }) => (
            <Form className="form">
              <InputText
                label="Monto a Abonar (Bs)"
                name="montoAbono"
                type="number"
                required
                step="0.01"
              />

              <SelectSecondary label="Método de Pago" name="metodoPago" required>
                <option value="">Seleccione</option>
                {METODOS_PAGO.map((mp) => (
                  <option key={mp.value} value={mp.value}>
                    {mp.label}
                  </option>
                ))}
              </SelectSecondary>

              <InputText
                label="Referencia (Opcional)"
                name="referencia"
                type="text"
                placeholder="Nro transacción, comprobante, etc."
              />

              <div className="form-actions">
                <Button type="button" variant="secondary" onClick={onClose}>
                  Cancelar
                </Button>

                <Button type="submit" variant="primary" disabled={isSubmitting}>
                  {isSubmitting ? "Procesando..." : "Registrar Abono"}
                </Button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default AbonarVenta;