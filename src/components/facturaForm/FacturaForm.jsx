import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import './FacturaForm.css';
import { fetchProductos, emitirFactura } from '../../service/api';

const FacturaForm = () => {
  const location = useLocation();
  const client = location.state?.client || {
    nombreRazonSocial: "Torricos SRL",
    email: "gfredo@softcraft.bo",
    numeroDocumento: "14382800019 CB"
  };

  const [productos, setProductos] = useState([]);

  useEffect(() => {
    const getProductos = async () => {
      try {
        const response = await fetchProductos();
        setProductos(response.data);
      } catch (error) {
        console.error('Error fetching productos:', error);
      }
    };

    getProductos();
  }, []);

  const initialValues = {
    producto: '',
    cantidad: '',
    unidadMedida: '',
    precioUnitario: '',
    descuento: ''
  };

  const validationSchema = Yup.object({
    producto: Yup.string().required('Seleccione un producto'),
    cantidad: Yup.number().required('Ingrese la cantidad').positive('Debe ser un número positivo'),
    unidadMedida: Yup.string().required('Ingrese la unidad de medida'),
    precioUnitario: Yup.number().required('Ingrese el precio unitario').positive('Debe ser un número positivo'),
    descuento: Yup.number().min(0, 'Debe ser un número positivo o cero')
  });

  const handleSubmit = async (values, { resetForm }) => {
    try {
      const selectedProducto = productos.find(producto => producto.descripcionProducto === values.producto);
      const facturaData = {
        idPuntoVenta: 1,
        idCliente: client.id,
        usuario: client.nombreRazonSocial,
        detalle: [
          {
            //idProducto: selectedProducto.id,
            idProducto: 1,
            cantidad: values.cantidad,
            montoDescuento: values.descuento
          }
        ]
      };
      const response = await emitirFactura(facturaData);
      console.log('Respuesta del servidor:', response.data);
      alert('Factura emitida con éxito');
      resetForm();
    } catch (error) {
      console.error('Error al emitir la factura:', error);
      alert('Error al emitir la factura');
    }
  };

  return (
    <main className="factura-container">
      <h2>Datos del Cliente</h2>
      <div className="form-group">
        <label>Razón Social:</label>
        <input type="text" value={client.nombreRazonSocial} readOnly />
      </div>
      <div className="form-group">
        <label>Correo:</label>
        <input type="email" value={client.email} readOnly />
      </div>
      <div className="form-group">
        <label>NIT/CI:</label>
        <input type="text" value={client.numeroDocumento} readOnly />
      </div>

      <h2>Detalle de la Transacción</h2>
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ resetForm }) => (
          <Form>
            <div className="form-group">
              <label>Producto/Descripción:</label>
              <Field as="select" name="producto">
                <option value="">Seleccione un producto</option>
                {productos.map(producto => (
                  <option key={producto.id} value={producto.descripcionProducto}>
                    {producto.descripcionProducto}
                  </option>
                ))}
              </Field>
              <ErrorMessage name="producto" component="div" className="error-message" />
            </div>
            <div className="row">
              <div className="form-group">
                <label>Cantidad:</label>
                <Field type="number" name="cantidad" />
                <ErrorMessage name="cantidad" component="div" className="error-message" />
              </div>
              <div className="form-group">
                <label>Unidad de Medida:</label>
                <Field type="text" name="unidadMedida" />
                <ErrorMessage name="unidadMedida" component="div" className="error-message" />
              </div>
            </div>
            <div className="row">
              <div className="form-group">
                <label>Precio Unitario (Bs):</label>
                <Field type="number" name="precioUnitario" />
                <ErrorMessage name="precioUnitario" component="div" className="error-message" />
              </div>
              <div className="form-group">
                <label>Descuento (Bs):</label>
                <Field type="number" name="descuento" />
                <ErrorMessage name="descuento" component="div" className="error-message" />
              </div>
            </div>
            <div className="form-buttons">
              <button type="submit">Emitir Factura</button>
              <button type="button" onClick={resetForm}>Borrar</button>
            </div>
          </Form>
        )}
      </Formik>
    </main>
  );
};

export default FacturaForm;