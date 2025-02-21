import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage, FieldArray } from 'formik';
import * as Yup from 'yup';
import './FacturaForm.css';
import { fetchItems, emitirFactura, fetchPuntosDeVenta } from '../../service/api';
import { generatePDF } from '../../utils/generatePDF';
import { getUser } from '../../utils/authFunctions';

const FacturaForm = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { flag } = location.state;
  const currentUser = getUser();

  const client = location.state?.client || {
    nombreRazonSocial: "sin usuario",
    email: "...",
    numeroDocumento: "0000000000 CB",
    id: null
  };

  const [items, setItems] = useState([]);
  const [puntosDeVenta, setPuntosDeVenta] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [itemsRes, puntosRes] = await Promise.all([
          fetchItems(),
          fetchPuntosDeVenta()
        ]);

        setItems(itemsRes.data);
        setPuntosDeVenta(puntosRes.data);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Error al cargar los datos necesarios');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const initialValues = {
    puntoDeVenta: '',
    metodoPago: 'EFECTIVO', // Solo EFECTIVO
    items: [
      {
        item: '',
        cantidad: '',
        precioUnitario: '',
        descuento: 0
      }
    ]
  };

  const validationSchema = Yup.object({
    puntoDeVenta: Yup.string().required('Seleccione un punto de venta'),
    metodoPago: Yup.string().required('Método de pago es requerido'),
    items: Yup.array().of(
      Yup.object().shape({
        item: Yup.string().required('Seleccione un item'),
        cantidad: Yup.number()
          .required('Ingrese la cantidad')
          .positive('Debe ser un número positivo'),
        precioUnitario: Yup.number()
          .required('Ingrese el precio unitario')
          .positive('Debe ser un número positivo'),
        descuento: Yup.number()
          .min(0, 'Debe ser un número positivo o cero')
      })
    )
  });

  const handleBack = () => {
    navigate("/facturacion");
  };

  const handleVentaSinFactura = () => {
    console.log('Venta sin factura');
  };

  const handleSubmit = async (values, { resetForm, setSubmitting }) => {
    try {
      const selectedPuntoDeVenta = puntosDeVenta.find(punto => punto.nombre === values.puntoDeVenta);

      if (!selectedPuntoDeVenta) {
        throw new Error('Punto de venta no encontrado');
      }

      const facturaData = {
        idPuntoVenta: selectedPuntoDeVenta.id,
        idCliente: client.id,
        tipoComprobante: "FACTURA",
        metodoPago: values.metodoPago,
        username: currentUser.username, // Usamos el username del currentUser
        usuario: client.nombreRazonSocial,
        detalle: values.items.map(item => {
          const selectedItem = items.find(i => i.descripcion === item.item);
          if (!selectedItem) {
            throw new Error(`Item no encontrado: ${item.item}`);
          }
          return {
            idProducto: selectedItem.id,
            cantidad: Number(item.cantidad),
            montoDescuento: Number(item.descuento || 0)
          };
        })
      };
      console.log('Enviando datos de factura:', facturaData);
      
      const response = await emitirFactura(facturaData);
      console.log('Respuesta de emisión:', response);

      try {
        const doc = await generatePDF(response.data.xmlContent);
        doc.save(`factura-${response.data.cuf}.pdf`);
        console.log('PDF generado exitosamente');
      } catch (pdfError) {
        console.error('Error al generar PDF:', pdfError);
        alert('Factura emitida pero hubo un error al generar el PDF');
      }

      alert('Factura emitida con éxito');
      resetForm();
      navigate('/ventas');
    } catch (error) {
      console.error('Error al emitir la factura:', error);
      alert(`Error al emitir la factura: ${error.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="loading">Cargando...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <main className="factura-container">
      <h1>Formulario de venta</h1>
      
      <section className="client-info">
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
      </section>

      <section className="corporate-details">
        <h2>Detalles corporativos</h2>
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ resetForm, setFieldValue, values, isSubmitting }) => (
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

              <div className="form-group">
                <label>Método de Pago:</label>
                <Field as="select" name="metodoPago">
                  <option value="EFECTIVO">Efectivo</option>
                </Field>
                <ErrorMessage name="metodoPago" component="div" className="error-message" />
              </div>

              <section className="transaction-details">
                <h2>Detalle de la Transacción</h2>
                <FieldArray name="items">
                  {({ push, remove }) => (
                    <div className="items-container">
                      {values.items.map((item, index) => (
                        <div key={index} className="form-row">
                          <div className="form-group item-field">
                            <label>Item/Descripción:</label>
                            <Field 
                              as="select" 
                              name={`items[${index}].item`}
                              onChange={(e) => {
                                const selectedItem = items.find(i => i.descripcion === e.target.value);
                                setFieldValue(`items[${index}].item`, e.target.value);
                                setFieldValue(
                                  `items[${index}].precioUnitario`,
                                  selectedItem ? selectedItem.precioUnitario : ''
                                );
                              }}
                            >
                              <option value="">Seleccione un item</option>
                              {items.map(i => (
                                <option key={i.id} value={i.descripcion}>
                                  {i.descripcion}
                                </option>
                              ))}
                            </Field>
                            <ErrorMessage name={`items[${index}].item`} component="div" className="error-message" />
                          </div>

                          <div className="form-group cantidad-field">
                            <label>Cantidad:</label>
                            <Field type="number" name={`items[${index}].cantidad`} />
                            <ErrorMessage name={`items[${index}].cantidad`} component="div" className="error-message" />
                          </div>

                          <div className="form-group precio-field">
                            <label>Precio Unitario (Bs):</label>
                            <Field type="number" name={`items[${index}].precioUnitario`} readOnly />
                            <ErrorMessage name={`items[${index}].precioUnitario`} component="div" className="error-message" />
                          </div>

                          <div className="form-group descuento-field">
                            <label>Descuento (Bs):</label>
                            <Field type="number" name={`items[${index}].descuento`} />
                            <ErrorMessage name={`items[${index}].descuento`} component="div" className="error-message" />
                          </div>

                          {index > 0 && (
                            <button 
                              type="button" 
                              className="remove-item-btn"
                              onClick={() => remove(index)}
                            >
                              Eliminar
                            </button>
                          )}
                        </div>
                      ))}
                      <button
                        type="button"
                        className="add-item-btn"
                        onClick={() => push({
                          item: '',
                          cantidad: '',
                          precioUnitario: '',
                          descuento: 0
                        })}
                      >
                        + Añadir ítem
                      </button>
                    </div>
                  )}
                </FieldArray>
              </section>

              <div className="form-buttons">
                <button
                  type="submit"
                  disabled={!flag || isSubmitting}
                  className={flag ? 'btn-enabled' : 'btn-disabled'}
                >
                  {isSubmitting ? 'Emitiendo...' : 'Emitir Factura'}
                </button>
                <button 
                  className="btn-clear" 
                  type="button" 
                  onClick={resetForm}
                  disabled={isSubmitting}
                >
                  Limpiar Datos
                </button>
              </div>
            </Form>
          )}
        </Formik>
      </section>

      <div className="bot-btns">
        <button
          className={`btn-no-fact ${flag ? 'btn-disabled' : 'btn-enabled'}`}
          onClick={handleVentaSinFactura}
          disabled={flag}
        >
          Registrar venta sin Factura
        </button>
        <button 
          className="btn-back" 
          onClick={handleBack}
        >
          Generar factura con un NIT diferente
        </button>
      </div>
    </main>
  );
};

export default FacturaForm;