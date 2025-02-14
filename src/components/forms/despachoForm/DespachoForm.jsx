import React, { useState,useEffect } from "react";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import InputText from "../../inputs/InputText";
import "./DespachoForm.css";
import { fetchItems, getSucursales } from "../../../service/api";


const ElementProduct = ({ id, onSelect }) => {
  const [productosList, setProductosList] = useState([]);

  useEffect(() => {
      const getProducts = async () => {
        try {
          const response = await fetchItems();
          setProductosList(response.data);
        } catch (error) {
          console.error('Error fetching products:', error);
        }
      };
  
      getProducts();
    }, []);
  return (
    <div className="element-product">
      <input type="checkbox" onChange={() => onSelect(id)} />
      <select className="despacho-input">
        <option value="" disabled selected>Seleccione un producto</option>
        {productosList.map((product) => (
          <option key={product.id} value={product.id}>
            {product.descripcion}
          </option>
        ))}
      </select>
      <input type="number" min="1" className="despacho-input" placeholder="Cantidad" />
    </div>
  );
};

export default function DespachoForm() {
  const [productos, setProductos] = useState([]);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [sucursales, setSucursales] = useState([]);
  
  useEffect(() => {
      const fetchSucursales = async () => {
          try {
              const response = await getSucursales();
              setSucursales(response.data);
          } catch (error) {
              console.error('Error fetching sucursales:', error);
          }
      };

      fetchSucursales();
  }, []);

  const agregarProducto = () => {
    setProductos([...productos, { id: Date.now() }]);
  };

  const eliminarProductos = () => {
    setProductos(productos.filter(p => !selectedIds.has(p.id)));
    setSelectedIds(new Set());
  };

  const toggleSeleccion = (id) => {
    setSelectedIds(prev => {
      const newSet = new Set(prev);
      newSet.has(id) ? newSet.delete(id) : newSet.add(id);
      return newSet;
    });
  };

  return (
    
    <div className="despachos-contenedor">
      <h1>Datos del despacho:</h1>
      <Formik
        initialValues={{
          origin: "",
          destination: "",
          date: new Date().toISOString().split("T")[0], 
          transportId: "",
          numberPhone: "",
          comment: "",
        }}
        onSubmit={(values) => console.log(values)}
      >
        <Form style={{ width: "80%" }}>
          <div className="form-group">
            <div>
              <label htmlFor="origin">Origen:</label>
              <Field as="select" name="origin" id="origin" className="despacho-input">
                <option value="" disabled selected>Seleccione un origen</option>
                {sucursales.map(sucursal =>
                <option value={sucursal.id} > {sucursal.nombre} </option>
                )}
              </Field>
            </div>
            <div>
              <label htmlFor="destination">Destino:</label>
              <Field as="select" name="destination" id="destination" className="despacho-input">
                <option value="" disabled selected>Seleccione un destino</option>
                <option value="opcion1">Opción 1</option>
                <option value="opcion2">Opción 2</option>
              </Field>
            </div>
          </div>

          <InputText label="Fecha actual:" name="date" type="text" readOnly />

          <label htmlFor="transportId">ID Transporte:</label>
          <Field as="select" name="transportId" id="transportId" className="despacho-input">
            <option value="" disabled selected>Seleccione transporte</option>
            <option value="logistica1">Logística 1</option>
            <option value="logistica2">Logística 2</option>
          </Field>

          <div className="form-group">
            <InputText label="Número de emergencia:" name="numberPhone" type="text" id="numberPhone" placeholder="En caso de que algo pase con el envío" />
            <InputText label="Comentario:" name="comment" type="text" id="comment" placeholder="Deje algún comentario respecto al envío" />
          </div>

          <div className="despacho-productos">
            <div className="despacho-productos-cabecera">
              <button className="btn-edit" type="button" onClick={agregarProducto}>Agregar productos</button>
              <button className="btn-cancel" type="button" onClick={eliminarProductos} disabled={productos.length === 0}>Eliminar productos</button>
            </div>
            <div className="cuerpo-productos">
              <h3>Productos enviados</h3>
              {productos.map((p) => (
                <ElementProduct key={p.id} id={p.id} onSelect={toggleSeleccion} />
              ))}
            </div>
          </div>

          <div>
            <button type="submit" className="btn-general">Enviar</button>
          </div>
        </Form>
      </Formik>
    </div>
  );
}
