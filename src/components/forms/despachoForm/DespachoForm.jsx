import React, { useState, useEffect } from "react";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import InputText from "../../inputs/InputText";
import "./DespachoForm.css";
import { fetchItems, getSucursales, createDespacho } from "../../../service/api";

const ElementProduct = ({ id, onUpdate, onSelect }) => {
  const [productosList, setProductosList] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
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
      <input type="checkbox" onChange={() => onSelect(id)}  />
      <select
        className="despacho-input"
        onChange={(e) => {
          setSelectedProduct(e.target.value);
          onUpdate(id, e.target.value, quantity);
        }}
      >
        <option value="" disabled selected>Seleccione un producto</option>
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
          onUpdate(id, selectedProduct, e.target.value);
        }}
      />
    </div>
  );
};


export default function DespachoForm() {
  const [productos, setProductos] = useState([]);
  const [sucursales, setSucursales] = useState([]);
  const [mensaje, setMensaje] = useState(null); // Para mensajes de éxito/error
  const [selectedIds, setSelectedIds] = useState(new Set());

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

  // Esquema de validación con Yup
  const validationSchema = Yup.object().shape({
    origin: Yup.string().required("Debe seleccionar un origen"),
    destination: Yup.string().required("Debe seleccionar un destino"),
    transportId: Yup.string().required("Ingrese el transporte"),
    numberPhone: Yup.number()
      .typeError("Debe ser un número")
      .required("Ingrese el número de contacto"),
    comment: Yup.string().nullable(), // Puede estar vacío
  });

  const agregarProducto = () => {
    setProductos([...productos, { id: Date.now(), productoId: null, cantidad: 1 }]);
  };
  
  const eliminarProductos = () => {
    setProductos(productos.filter(p => !selectedIds.has(p.id)));
    setSelectedIds(new Set());
  };

  const toggleSeleccion = (id) => {
    setSelectedIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);  // Si ya está seleccionado, lo eliminamos.
      } else {
        newSet.add(id);  // Si no está seleccionado, lo añadimos.
      }
      return newSet;
    });
  };
  

  const actualizarProducto = (id, productoId, cantidad) => {
    setProductos((prevProductos) =>
      prevProductos.map((p) => (p.id === id ? { ...p, productoId, cantidad: parseInt(cantidad) } : p))
    );
  };
  

  return (
    <div className="despachos-contenedor">
      <h1>Datos del despacho:</h1>
      
      {mensaje && <p className={mensaje.tipo}>{mensaje.texto}</p>} {/* Mensajes de éxito/error */}

      <Formik
        initialValues={{
          origin: "",
          destination: "",
          date: new Date().toISOString().split("T")[0],
          transportId: "",
          numberPhone: "",
          comment: "",
        }}
        validationSchema={validationSchema}
        onSubmit={async (values, { setSubmitting, resetForm }) => {
          try {
            const despachoData = {
              sucursalOrigenId: parseInt(values.origin),
              destinoId: parseInt(values.destination),
              transporte: values.transportId,
              numeroContacto: parseInt(values.numberPhone),
              observaciones: values.comment,
              itemIds: productos
              .filter((p) => p.productoId)  // Filtra productos sin productoId
              .map((p) => parseInt(p.productoId))   // Solo pasa el productoId
            };

            await createDespacho(despachoData);

            setMensaje({ texto: "Despacho creado con éxito!", tipo: "success" });
            resetForm();
          } catch (error) {
            console.error("Error al enviar despacho:", error);
            setMensaje({ texto: "Error al crear el despacho", tipo: "error" });
          }
          setSubmitting(false);
        }}
      >
        {({ errors, touched }) => (
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
                {errors.origin && touched.origin && <p className="error">{errors.origin}</p>}
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
                {errors.destination && touched.destination && <p className="error">{errors.destination}</p>}
              </div>
            </div>

            {/*<InputText label="Fecha actual:" name="date" type="text" readOnly />*/}
            <InputText label="Transporte usado:" name="transportId" type="text" />
            {errors.transportId && touched.transportId && <p className="error">{errors.transportId}</p>}

            <div className="form-group">
              <InputText label="Número de emergencia:" name="numberPhone" type="text" placeholder="Ej. 123456789" />
              {errors.numberPhone && touched.numberPhone && <p className="error">{errors.numberPhone}</p>}
              
              <InputText label="Comentario:" name="comment" type="text" placeholder="Opcional" />
            </div>

            <div className="despacho-productos">
            <div className="despacho-productos-cabecera">
              <button className="btn-edit" type="button" onClick={agregarProducto}>Agregar productos</button>
              <button className="btn-cancel" type="button" onClick={eliminarProductos} disabled={productos.length === 0}>Eliminar productos</button>
            </div>
            <div className="cuerpo-productos">
              <h3>Productos enviados</h3>
              {productos.map((p) => (
                <ElementProduct key={p.id} id={p.id} onUpdate={actualizarProducto} onSelect={toggleSeleccion} />
              ))}
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
