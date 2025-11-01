import { Formik, Form } from "formik";
import * as Yup from "yup";
import { toast } from "sonner";
import InputText from "../../components/inputs/InputText";
import SelectPrimary from "../../components/selected/SelectPrimary";
import ButtonPrimary from "../../components/buttons/ButtonPrimary";
import CustomDatePicker from "../../components/inputs/DatePicker";
import { createEgreso, updateEgreso } from "../../service/api";
import { useCajaActiva } from "../../hooks/useHistorialCajas";
import { getUser } from "../../utils/authFunctions";

const EgresoForm = ({ egreso, onSuccess, onCancel }) => {
    const validationSchema = Yup.object().shape({
        fechaDePago: Yup.date().required("La fecha de pago es obligatoria"),
        descripcion: Yup.string()
            .required("La descripción es obligatoria")
            .max(1024, "Máximo 1024 caracteres"),
        gastoEnum: Yup.string().required("Debe seleccionar una categoría de gasto"),
        monto: Yup.number()
            .required("El monto es obligatorio")
            .positive("Debe ser mayor a 0"),
        tipoPagoEnum: Yup.string().required("Debe seleccionar el tipo de pago"),
        pagadoA: Yup.string().max(1024, "Máximo 1024 caracteres"),
        numFacturaComprobante: Yup.string().max(1024, "Máximo 1024 caracteres"),
        observaciones: Yup.string().required("Las observaciones son obligatorias"),
    });

    const formatDate = (date) => {
        if (!date) return null;
        return new Date(date).toISOString().split("T")[0];
    };
const currentUser = getUser();
    const {
  data: cajaActiva,
} = useCajaActiva(currentUser?.id);

    const handleSubmit = async (values, { setSubmitting, resetForm }) => {
        try {
            const payload = {
                ...values,
                fechaDePago: formatDate(values.fechaDePago),
                cajaId: cajaActiva?.id || null,
            };

            if (egreso?.id) {
                await updateEgreso(egreso.id, payload);
                toast.success("✅ Egreso actualizado correctamente");
            } else {
                await createEgreso(payload);
                toast.success("✅ Egreso registrado correctamente");
            }
            if (onSuccess) onSuccess();
            resetForm();
        } catch (error) {
            console.error("Error al guardar egreso:", error);
            toast.error("❌ Error al guardar egreso");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="form-container">
            <h2>{egreso ? "Editar Egreso" : "Registrar Egreso"}</h2>
            <Formik
                initialValues={{
                    fechaDePago: egreso?.fechaDePago ? new Date(egreso.fechaDePago) : new Date(), // 🔹 Por defecto HOY
                    descripcion: egreso?.descripcion || "",
                    gastoEnum: egreso?.gastoEnum || "",
                    monto: egreso?.monto || "",
                    tipoPagoEnum: egreso?.tipoPagoEnum || "",
                    pagadoA: egreso?.pagadoA || "",
                    numFacturaComprobante: egreso?.numFacturaComprobante || "",
                    observaciones: egreso?.observaciones || "",
                }}
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
            >
                {({ isSubmitting, values, setFieldValue }) => (
                    <Form className="form">
                        <CustomDatePicker
                            label="Fecha de Pago"
                            name="fechaDePago"
                            selected={values.fechaDePago}
                            onChange={(date) => setFieldValue("fechaDePago", date)}
                            required
                        />

                        <InputText label="Descripción (Motivo)" name="descripcion" type="text" required />

                        <SelectPrimary label="Tipo de Gasto" name="gastoEnum" required>
                            <option value="">Seleccione...</option>
                            <option value="GASTOS_ADMINISTRATIVOS">Gastos Administrativos</option>
                            <option value="GASTOS_LOGISTICA">Gastos Logística</option>
                            <option value="COMPRA_MATERIA_PRIMA">Compra Materia Prima</option>
                            <option value="COMPRA_PRODUCTOS_TERMINADOS">Compra Productos Terminados</option>
                        </SelectPrimary>

                        <InputText label="Monto" name="monto" type="number" step="0.01" required />

                        <SelectPrimary label="Tipo de Pago" name="tipoPagoEnum" required>
                            <option value="">Seleccione...</option>
                            <option value="EFECTIVO">Efectivo</option>
                            <option value="TRANSFERENCIA">Transferencia</option>
                            <option value="TARJETA">Tarjeta</option>
                        </SelectPrimary>

                        <InputText label="Pagado a" name="pagadoA" type="text" placeholder="Persona o proveedor" />
                        <InputText label="N° Factura / Comprobante" name="numFacturaComprobante" type="text" />
                        <InputText label="Observaciones" name="observaciones" as="textarea" rows="3" required />

                        <div className="form-actions">
                            <ButtonPrimary type="submit" variant="primary" disabled={isSubmitting}>
                                {isSubmitting
                                    ? egreso
                                        ? "Actualizando..."
                                        : "Registrando..."
                                    : egreso
                                        ? "Actualizar Egreso"
                                        : "Registrar Egreso"}
                            </ButtonPrimary>

                            <ButtonPrimary type="button" variant="secondary" onClick={onCancel}>
                                Cancelar
                            </ButtonPrimary>
                        </div>
                    </Form>
                )}
            </Formik>
        </div>
    );
};

export default EgresoForm;
