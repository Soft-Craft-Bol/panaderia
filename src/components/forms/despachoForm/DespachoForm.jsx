import React, { useState, useEffect } from "react";
import { Formik, Form, Field, FieldArray } from "formik";
import * as Yup from "yup";
import { useNavigate } from "react-router-dom"; // Importar useNavigate
import InputText from "../../inputs/InputText";
import "./DespachoForm.css";
import { fetchItems, getSucursales, createDespacho } from "../../../service/api";
import { toast } from "sonner";
import Swal from "sweetalert2";

const alerta = (titulo, mensaje, tipo =  "success") =>{
  Swal.fire({
    title: titulo,
    text: mensaje,
    icon: tipo, 
    timer: 2500,
    showConfirmButton: false,
  });
}

const ElementProduct = ({ index, onUpdate, onRemove, isDefault }) => {
  const [productosList, setProductosList] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState("");
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const getProducts = async () => {
      try {
        const response = await fetchItems();
        setProductosList(response.data);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };
    getProducts();
  }, []);

  return (
    <div className="element-product">
      <select
        className="despacho-input"
        value={selectedProduct}
        onChange={(e) => {
          setSelectedProduct(e.target.value);
          onUpdate(index, e.target.value, quantity);
        }}
      >
        <option value="" disabled>Seleccione un producto</option>
        {productosList.map((product) => (
          <option key={product.id} value={product.id}>
            {product.descripcion}
          </option>
        ))}
      </select>
      <input
        type="number"
        min="1"
        className="despacho-input"
        placeholder="Cantidad"
        value={quantity}
        onChange={(e) => {
          setQuantity(e.target.value);
          onUpdate(index, selectedProduct, e.target.value);
        }}
      />
      {!isDefault && ( 
        <button type="button" className="btn-cancel" onClick={() => onRemove(index)}>
          Eliminar
        </button>
      )}
    </div>
  );
};

export default function DespachoForm() {
  const [sucursales, setSucursales] = useState([]);
  const [mensaje, setMensaje] = useState(null);
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
      .notOneOf([Yup.ref('origin')], "El origen y destino no pueden ser iguales"),
    transportId: Yup.string().required("Ingrese el transporte"),
    numberPhone: Yup.number()
      .typeError("Debe ser un número")
      .required("Ingrese el número de contacto"),
    comment: Yup.string().nullable(),
  });

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    if (values.items.length === 0) {
      setMensaje({ texto: "Debe agregar al menos un producto en el despacho", tipo: "error" });
      setSubmitting(false);
      return;
    }

    try {
      const despachoData = {
        sucursalOrigen: {
          id: parseInt(values.origin),
        },
        sucursalDestino: {
          id: parseInt(values.destination),
        },
        transporte: values.transportId,
        numeroContacto: parseInt(values.numberPhone),
        observaciones: values.comment,
        despachoItems: values.items.map(item => ({
          item: {
            id: parseInt(item.productoId),
          },
          cantidad: parseInt(item.cantidad),
        })),
      };

      await createDespacho(despachoData);
      
      toast.success("Despacho creado con éxito!"); 

      alerta("Despacho realizado", " con éxito!");

      navigate("/despachos");

      resetForm();
      setMensaje({ texto: "Despacho creado con éxito!", tipo: "success" });
    } catch (error) {
      console.error("Error al enviar despacho:", error);
      setMensaje({ texto: "Error al crear el despacho", tipo: "error" });
      alerta("Error al crear despacho",error,"error");
    }

    setSubmitting(false);
  };

  return (
    <div className="despachos-contenedor">
      <h1>Datos del despacho:</h1>

      {mensaje && <p className={mensaje.tipo}>{mensaje.texto}</p>}

      <Formik
        initialValues={{
          origin: "",
          destination: "",
          date: new Date().toISOString().split("T")[0],
          transportId: "",
          numberPhone: "",
          comment: "",
          items: [{ productoId: "", cantidad: 1 }] 
        }}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ errors, touched, values, setFieldValue }) => (
          <Form style={{ width: "80%" }}>
            <div className="form-group">
              <div>
                <label htmlFor="origin">Origen:</label>
                <Field as="select" name="origin" className="despacho-input">
                  <option value="" disabled>Seleccione un origen</option>
                  {sucursales.map((sucursal) => (
                    <option key={sucursal.id} value={sucursal.id}>
                      {sucursal.nombre}
                    </option>
                  ))}
                </Field>
                {errors.origin && touched.origin && <p className="error-message">{errors.origin}</p>}
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
                {errors.destination && touched.destination && <p className="error-message">{errors.destination}</p>}
              </div>
            </div>

            <InputText label="Transporte:" name="transportId" type="text" />

            <div className="form-group">
              <InputText label="Numero de contacto del transporte:" name="numberPhone" type="text" placeholder="Ej. 123456789" />

              <InputText label="Comentarios:" name="comment" type="text" placeholder="Opcional" />
            </div>

            <div className="despacho-productos">
              <div className="cuerpo-productos">
                <h3>Productos a enviar:</h3>
                <FieldArray name="items">
                  {({ push, remove }) => (
                    <>
                      {values.items.map((item, index) => (
                        <ElementProduct
                          key={index}
                          index={index}
                          onUpdate={(index, productoId, cantidad) => {
                            setFieldValue(`items[${index}].productoId`, productoId);
                            setFieldValue(`items[${index}].cantidad`, cantidad);
                          }}
                          onRemove={remove}
                          isDefault={index === 0} 
                        />
                      ))}
                      <button
                        type="button"
                        className="btn-edit"
                        onClick={() => push({ productoId: "", cantidad: 1 })}
                      >
                        + Añadir ítem
                      </button>
                    </>
                  )}
                </FieldArray>
              </div>
            </div>

            <div>
              <button type="submit" className="btn-general">Enviar</button>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
}