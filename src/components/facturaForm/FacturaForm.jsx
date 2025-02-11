import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import './FacturaForm.css';
import { fetchItems, emitirFactura, fetchPuntosDeVenta } from '../../service/api';
import { generatePDF } from '../../utils/generatePDF';




const FacturaForm = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const client = location.state?.client || {
    nombreRazonSocial: "Torricos SRL",
    email: "gfredo@softcraft.bo",
    numeroDocumento: "14382800019 CB"
  };

  const [items, setItems] = useState([]);
  const [puntosDeVenta, setPuntosDeVenta] = useState([]);

  useEffect(() => {
    const getItems = async () => {
      try {
        const response = await fetchItems();
        setItems(response.data);
      } catch (error) {
        console.error('Error fetching items:', error);
      }
    };

    const getPuntosDeVenta = async () => {
      try {
        const response = await fetchPuntosDeVenta();
        setPuntosDeVenta(response.data);
      } catch (error) {
        console.error('Error fetching puntos de venta:', error);
      }
    };

    getItems();
    getPuntosDeVenta();
  }, []);

  const initialValues = {
    item: '',
    cantidad: '',
    unidadMedida: '',
    precioUnitario: '',
    descuento: '',
    puntoDeVenta: ''
  };

  const validationSchema = Yup.object({
    item: Yup.string().required('Seleccione un item'),
    cantidad: Yup.number().required('Ingrese la cantidad').positive('Debe ser un número positivo'),
    unidadMedida: Yup.string().required('Ingrese la unidad de medida'),
    precioUnitario: Yup.number().required('Ingrese el precio unitario').positive('Debe ser un número positivo'),
    descuento: Yup.number().min(0, 'Debe ser un número positivo o cero'),
    puntoDeVenta: Yup.string().required('Seleccione un punto de venta')
  });

  const handleBack = () => {
    navigate("/facturacion");
  };

  // const handleSubmit = async (values, { resetForm }) => {
  //   try {
  //     const selectedItem = items.find(item => item.descripcion === values.item);
  //     const selectedPuntoDeVenta = puntosDeVenta.find(punto => punto.nombre === values.puntoDeVenta);
  //     const facturaData = {
  //       idPuntoVenta: selectedPuntoDeVenta.id,
  //       idCliente: client.id,
  //       usuario: client.nombreRazonSocial,
  //       detalle: [
  //         {
  //           idProducto: selectedItem.id,
  //           cantidad: values.cantidad,
  //           montoDescuento: values.descuento
  //         }
  //       ]
  //     };
  //     const response = await emitirFactura(facturaData);
  //     console.log('Respuesta del servidor:', response.data);
  //     const doc = generatePDF(response.data.xmlContent);
  //     doc.save(`factura-${response.data.cuf}.pdf`);
  //     alert('Factura emitida y descargada con éxito');
  //     resetForm();
  //   } catch (error) {
  //     console.error('Error al emitir la factura:', error);
  //     alert('Error al emitir la factura');
  //   }
  // };
  const handleSubmit = async (values, { resetForm }) => {
    try {
      const selectedItem = items.find(item => item.descripcion === values.item);
      const selectedPuntoDeVenta = puntosDeVenta.find(punto => punto.nombre === values.puntoDeVenta);
      const facturaData = {
        idPuntoVenta: selectedPuntoDeVenta.id,
        idCliente: client.id,
        usuario: client.nombreRazonSocial,
        detalle: [
          {
            idProducto: selectedItem.id,
            cantidad: values.cantidad,
            montoDescuento: values.descuento
          }
        ]
      };
      const response = await emitirFactura(facturaData);
      console.log('Respuesta del servidor:', response.data);
  
      // Generar el PDF
      const doc = await generatePDF(response.data.xmlContent); // Asegúrate de usar `await`
      doc.save(`factura-${response.data.cuf}.pdf`); // Guardar el PDF
  
      alert('Factura emitida y descargada con éxito');
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
        <input type="text" value={client.nombreRazonSocial || ''} readOnly />
      </div>
      <div className="form-group">
        <label>Correo:</label>
        <input type="email" value={client.email || ''} readOnly />
      </div>
      <div className="form-group">
        <label>NIT/CI:</label>
        <input type="text" value={client.numeroDocumento || ''} readOnly />
      </div>

      <h2>Punto de Venta</h2>
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ resetForm, setFieldValue }) => (
          <Form>
            <div className="form-group">
              <label>Punto de Venta:</label>
              <Field as="select" name="puntoDeVenta">
                <option value="">Seleccione un punto de venta</option>
                {puntosDeVenta.map(punto => (
                  <option key={punto.id} value={punto.nombre}>
                    {punto.nombre}
                  </option>
                ))}
              </Field>
              <ErrorMessage name="puntoDeVenta" component="div" className="error-message" />
            </div>

            <h2>Detalle de la Transacción</h2>
            <div className="form-group">
              <label>Item/Descripción:</label>
              <Field as="select" name="item" onChange={(e) => {
                const selectedItem = items.find(item => item.descripcion === e.target.value);
                setFieldValue('item', e.target.value);
                setFieldValue('unidadMedida', selectedItem ? selectedItem.unidadMedida : '');
                setFieldValue('precioUnitario', selectedItem ? selectedItem.precioUnitario : '');
              }}>
                <option value="">Seleccione un item</option>
                {items.map(item => (
                  <option key={item.id} value={item.descripcion}>
                    {item.descripcion}
                  </option>
                ))}
              </Field>
              <ErrorMessage name="item" component="div" className="error-message" />
            </div>
            <div className="row">
              <div className="form-group">
                <label>Cantidad:</label>
                <Field type="number" name="cantidad" />
                <ErrorMessage name="cantidad" component="div" className="error-message" />
              </div>
              <div className="form-group">
                <label>Unidad de Medida:</label>
                <Field type="text" name="unidadMedida" readOnly />
                <ErrorMessage name="unidadMedida" component="div" className="error-message" />
              </div>
            </div>
            <div className="row">
              <div className="form-group">
                <label>Precio Unitario (Bs):</label>
                <Field type="number" name="precioUnitario" readOnly />
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
      <button className='btn-back' onClick={handleBack}>Generar factura con un NIT diferente</button>
    </main>
  );
};

export default FacturaForm;