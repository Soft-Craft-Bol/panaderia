import { Formik, Form, Field, ErrorMessage } from "formik";
import React from "react";
import { useNavigate } from "react-router-dom";
import "./Productos.css";
import ItemForm from "../../components/forms/itemForm/ItemForm";

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
        <ItemForm></ItemForm>
    );
};

export default AddProduct;
