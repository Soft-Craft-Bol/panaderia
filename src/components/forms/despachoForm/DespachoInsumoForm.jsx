import React, { useState, useEffect } from "react";
import { Formik, Form, Field, FieldArray } from "formik";
import * as Yup from "yup";
import { useNavigate } from "react-router-dom";
import InputText from "../../inputs/InputText";
import "./DespachoForm.css";
import { getSucursales, createDespachoInsumo } from "../../../service/api";
import { toast } from "sonner";
import Swal from "sweetalert2";
import ElementInsumo from "./ElementInsumo";
import { Button } from "../../buttons/Button";
import BackButton from "../../buttons/BackButton";

const alerta = (titulo, mensaje, tipo = "success") => {
    Swal.fire({
        title: titulo,
        text: mensaje,
        icon: tipo,
        timer: 2500,
        showConfirmButton: false,
    });
};

export default function DespachoInsumoForm() {
    const [sucursales, setSucursales] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchSucursales = async () => {
            try {
                const response = await getSucursales();
                setSucursales(response.data);
            } catch (error) {
                console.error("Error fetching sucursales:", error);
            }
        };

        fetchSucursales();
    }, []);

    const validationSchema = Yup.object().shape({
        origin: Yup.string().required("Debe seleccionar un origen"),
        destination: Yup.string()
            .required("Debe seleccionar un destino")
            .notOneOf([Yup.ref("origin")], "El origen y destino no pueden ser iguales"),
        responsable: Yup.string().required("Ingrese el responsable del despacho"),
        observaciones: Yup.string().nullable(),
        items: Yup.array().of(
            Yup.object().shape({
                insumoId: Yup.string().required("Seleccione un insumo"),
                cantidad: Yup.number()
                    .min(0.01, "La cantidad debe ser mayor a 0")
                    .required("Ingrese la cantidad")
            })
        ).min(1, "Debe agregar al menos un insumo")
    });

    const handleSubmit = async (values, { setSubmitting, resetForm }) => {
        try {
            const despachoData = {
                sucursalOrigen: parseInt(values.origin),
                sucursalDestino: parseInt(values.destination),
                responsable: values.responsable,
                observaciones: values.observaciones,
                items: values.items.map(item => ({
                    insumo: parseInt(item.insumoId),
                    cantidadEnviada: parseFloat(item.cantidad),
                })),
            };
            
            await createDespachoInsumo(despachoData);

            toast.success("Despacho de insumos creado con éxito!");
            alerta("Despacho realizado", "Con éxito!");
            navigate("/despachos");
            resetForm();
        } catch (error) {
            console.error("Error al enviar despacho:", error);
            const errorMessage = error.response?.data?.details?.[0] || error.message;
            alerta("Error al crear despacho", errorMessage, "error");
        }

        setSubmitting(false);
    };

    return (
        <div className="despachos-contenedor">
            <BackButton to="/despachos" />
            <h1>Datos del despacho de insumos:</h1>

            <Formik
                initialValues={{
                    origin: "",
                    destination: "",
                    responsable: "",
                    observaciones: "",
                    items: [{ insumoId: "", cantidad: "" }]
                }}
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
            >
                {(formik) => (
                    <Form style={{ width: "80%", margin: "0 auto" }}>
                        <div className="form-group">
                            <div>
                                <label htmlFor="origin">Origen:</label>
                                <Field
                                    as="select"
                                    name="origin"
                                    className="despacho-input"
                                    onChange={(e) => {
                                        formik.handleChange(e);
                                        // Limpiar items cuando cambia la sucursal
                                        formik.setFieldValue("items", [{ insumoId: "", cantidad: "" }]);
                                    }}
                                >
                                    <option value="" disabled>Seleccione un origen</option>
                                    {sucursales.map((sucursal) => (
                                        <option key={sucursal.id} value={sucursal.id}>
                                            {sucursal.nombre}
                                        </option>
                                    ))}
                                </Field>
                                {formik.errors.origin && formik.touched.origin && (
                                    <p className="error-message">{formik.errors.origin}</p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="destination">Destino:</label>
                                <Field as="select" name="destination" className="despacho-input">
                                    <option value="" disabled>Seleccione un destino</option>
                                    {sucursales.map((sucursal) => (
                                        <option key={sucursal.id} value={sucursal.id}>
                                            {sucursal.nombre}
                                        </option>
                                    ))}
                                </Field>
                                {formik.errors.destination && formik.touched.destination && (
                                    <p className="error-message">{formik.errors.destination}</p>
                                )}
                            </div>
                        </div>

                        <InputText
                            label="Responsable del despacho:"
                            name="responsable"
                            type="text"
                            placeholder="Nombre de la persona responsable"
                        />

                        <InputText
                            label="Observaciones:"
                            name="observaciones"
                            type="text"
                            placeholder="Opcional"
                        />

                        <div className="despacho-productos">
                            <h3>Insumos a enviar:</h3>
                            <FieldArray name="items">
                                {({ push, remove }) => (
                                    <>
                                        {formik.values.items.map((item, index) => (
                                            <ElementInsumo
                                                key={index}
                                                index={index}
                                                item={item}
                                                onUpdate={(index, field, value) => {
                                                    const newItems = [...formik.values.items];
                                                    newItems[index][field] = value;
                                                    formik.setFieldValue("items", newItems);
                                                }}
                                                onRemove={remove}
                                                isDefault={false}
                                                sucursalId={formik.values.origin}
                                            />
                                        ))}
                                        
                                        {formik.errors.items && typeof formik.errors.items === 'string' && (
                                            <p className="error-message">{formik.errors.items}</p>
                                        )}
                                        
                                        <Button
                                            type="button"
                                            variant="secondary"
                                            onClick={() => push({ insumoId: "", cantidad: "" })}
                                            disabled={!formik.values.origin}
                                        >
                                            + Añadir insumo
                                        </Button>
                                    </>
                                )}
                            </FieldArray>
                        </div>

                        <div>
                            <Button
                                type="submit"
                                variant="primary"
                                className="btn-general"
                                disabled={formik.isSubmitting || !formik.isValid}
                            >
                                {formik.isSubmitting ? "Enviando..." : "Enviar"}
                            </Button>
                        </div>
                    </Form>
                )}
            </Formik>
        </div>
    );
}