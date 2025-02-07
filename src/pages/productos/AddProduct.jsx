import { Formik, Form, Field, ErrorMessage } from "formik";
import React from "react";
import { useNavigate } from "react-router-dom";
import "./Productos.css";

const estiloInput = {
    height: "2.5rem",
    width: "80%",
    padding: "0 1.25rem",
    border: "2px solid var(--primary-color)",
    borderRadius: "4px",
    margin: "0.625rem auto",
    transition: "all 250ms",
};

const AddProduct = ({ onAddProduct }) => {
    const navigate = useNavigate();

    return (
        <div>
            <h1>Agregar Nuevo Producto</h1>

            <Formik
                initialValues={{
                    nameProduct: "",
                    foto: "",
                    priceProduct: "",
                    priceVent: "",
                }}
                onSubmit={(values) => {
                    console.log("Datos del producto:", values);
                    
                    // Agregar el producto a la lista
                    onAddProduct({
                        id: Date.now(),
                        nomProducto: values.nameProduct,
                        foto: values.foto,
                        /*priceProduct: values.priceProduct,
                        priceVent: values.priceVent,*/
                    });
                    navigate("/productos");
                }}
            >
                {({ handleSubmit }) => (
                    <Form onSubmit={handleSubmit} style={{ flexDirection: "column" }}>
                        <h5>Nombre del producto:</h5>
                        <Field name="nameProduct" type="text" placeholder="Ingrese el nombre del Producto" style={estiloInput} />
                        <ErrorMessage name="nameProduct" component="div" className="error-message" />

                        <h5>Imagen:</h5>
                        <Field name="foto" type="text" placeholder="Introduzca la ruta de la fotografía" style={estiloInput} />
                        <ErrorMessage name="foto" component="div" className="error-message" />

                        <h5>Precio Producto:</h5>
                        <Field name="priceProduct" type="number" placeholder="Introduzca el precio del producto" style={estiloInput} />
                        <ErrorMessage name="priceProduct" component="div" className="error-message" />

                        <h5>Precio Venta:</h5>
                        <Field name="priceVent" type="number" placeholder="Introduzca el precio de venta" style={estiloInput} />
                        <ErrorMessage name="priceVent" component="div" className="error-message" />
                        <div style={{display:"flex", justifyContent: "space-between"}}>
                        <button type="button" className="btn-cancel"
                        onClick={() => navigate("/productos")}>
                                Cancelar
                            </button>
                            <button type="submit" className="btn-general" style={{width:"40%"}}>Agregar Producto</button>
                        </div>
                    </Form>
                )}
            </Formik>
        </div>
    );
};

export default AddProduct;
