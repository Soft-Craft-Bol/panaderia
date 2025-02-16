import React, { useState, useEffect } from "react";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import InputText from "../../inputs/InputText";
import "./DespachoForm.css";
import { fetchItems, getSucursales, createDespacho } from "../../../service/api";
import { toast } from "sonner"; // Importar Sonner

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
      <input type="checkbox" onChange={() => onSelect(id)} />
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
  const [mensaje, setMensaje] = useState(null);
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
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const actualizarProducto = (id, productoId, cantidad) => {
    setProductos((prevProductos) =>
      prevProductos.map((p) => (p.id === id ? { ...p, productoId, cantidad: parseInt(cantidad) } : p))
    );
  };

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    if (productos.length === 0) {
      setMensaje({ texto: "Debe agregar al menos un producto en el despacho", tipo: "error" });
      setSubmitting(false);
      return;
    }

    try {
      const despachoData = {
        sucursalOrigenId: parseInt(values.origin),
        destinoId: parseInt(values.destination),
        transporte: values.transportId,
        numeroContacto: parseInt(values.numberPhone),
        observaciones: values.comment,
        itemIds: productos
          .filter((p) => p.productoId)
          .map((p) => parseInt(p.productoId))
      };

      await createDespacho(despachoData);

      toast.success("Despacho creado con éxito!"); // Notificación de éxito

      resetForm();
      setMensaje({ texto: "Despacho creado con éxito!", tipo: "success" });
    } catch (error) {
      console.error("Error al enviar despacho:", error);
      setMensaje({ texto: "Error al crear el despacho", tipo: "error" });
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
        }}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
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
