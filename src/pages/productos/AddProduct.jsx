import { Formik, Form, Field, ErrorMessage } from "formik";
import React from "react";
import { useNavigate } from "react-router-dom"; // Importar useNavigate
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
    const navigate = useNavigate(); // Hook para la navegación

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
                    
                    // Agregar el producto a la lista (lo enviamos como prop a Productos.jsx)
                    onAddProduct({
                        id: Date.now(),
                        nomProducto: values.nameProduct,
                        foto: values.foto,
                        /*priceProduct: values.priceProduct,
                        priceVent: values.priceVent,*/
                    });

                    // Regresar a la página anterior
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
                        
                        <button type="button" 
                        style={{width:"30%", padding: "6px 16px",
                            border: "none",
                            backgroundColor: "#f9635c",
                            color: "white",
                            borderRadius: "4px",
                            cursor: "pointer",
                            fontSize: "0.9rem",
                            height: "40px",
                            gap:"10px",
                            marginRight:"20%",
                            marginTop:"30px"}}
                        onClick={() => navigate("/productos")}>
                                Cancelar
                            </button>
                            <button type="submit" className="productos-btnAgregar" style={{width:"30%"}}>Agregar Producto</button>
                        
                    </Form>
                )}
            </Formik>
        </div>
    );
};

export default AddProduct;
