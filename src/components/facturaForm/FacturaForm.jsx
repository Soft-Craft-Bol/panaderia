  // import React, { useState, useEffect } from 'react';
  // import { useLocation, useNavigate } from 'react-router-dom';
  // import { Formik, Form, Field, ErrorMessage } from 'formik';
  // import * as Yup from 'yup';
  // import './FacturaForm.css';
  // import { fetchItems, emitirFactura, fetchPuntosDeVenta, getUserVendor, getUnidadMedida } from '../../service/api';
  // import { generatePDF } from '../../utils/generatePDF';

  // const FacturaForm = () => {
  //   const location = useLocation();
  //   const navigate = useNavigate();
  //   const { flag } = location.state;

  //   console.log('Flag value:', flag);

  //   const client = location.state?.client || {
  //     nombreRazonSocial: "sin usuario",
  //     email: "...",
  //     numeroDocumento: "0000000000 CB"
  //   };

  //   const [items, setItems] = useState([]);
  //   const [vendors, setVendors] = useState([]);
  //   const [puntosDeVenta, setPuntosDeVenta] = useState([]);
  //   const [unidadMedida, setUnidadMedida] = useState([]);

  //   useEffect(() => {
  //     const getItems = async () => {
  //       try {
  //         const response = await fetchItems();
  //         setItems(response.data);
  //       } catch (error) {
  //         console.error('Error fetching items:', error);
  //       }
  //     };
      
  //     const getVendors = async () => {
  //       try{
  //         const response = await getUserVendor();
  //         setVendors(response.data);
  //         console.log('vendedores:', response.data);
  //       }catch(error){
  //         console.error('Error fetching vendors:', error);
  //       }
  //     };
  //     const getPuntosDeVenta = async () => {
  //       try {
  //         const response = await fetchPuntosDeVenta();
  //         setPuntosDeVenta(response.data);
  //         console.log('Puntos de venta:', response.data);
  //       } catch (error) {
  //         console.error('Error fetching puntos de venta:', error);
  //       }
  //     };
  //     const getUnidadMedidas = async () => {
  //       try {
  //         const response = await getUnidadMedida();
  //         setUnidadMedida(response.data);
  //         console.log('Unidad de medida:', response.data);
  //       }catch(error){
  //         console.error('Error fetching unidad de medida:', error);
  //       }
  //     };
  //     getUnidadMedidas();
  //     getVendors();
  //     getItems();
  //     getPuntosDeVenta();
  //   }, []);

  //   const initialValues = {
  //     item: '',
  //     cantidad: '',
  //     unidadMedida: '',
  //     precioUnitario: '',
  //     descuento: 0,
  //     puntoDeVenta: ''
  //   };

  //   const validationSchema = Yup.object({
  //     item: Yup.string().required('Seleccione un item'),
  //     cantidad: Yup.number().required('Ingrese la cantidad').positive('Debe ser un número positivo'),
  //     unidadMedida: Yup.string().required('Ingrese la unidad de medida'),
  //     precioUnitario: Yup.number().required('Ingrese el precio unitario').positive('Debe ser un número positivo'),
  //     descuento: Yup.number().min(0, 'Debe ser un número positivo o cero'),
  //     puntoDeVenta: Yup.string().required('Seleccione un punto de venta'),
  //     vendedor: Yup.string().required('Seleccione un vendedor')
  //   });

  //   const handleBack = () => {
  //     navigate("/facturacion");
  //   };

  //   const handleVentaSinFactura = () => {
  //     console.log('Venta sin factura');
  //   }

  //   const handleSubmit = async (values, { resetForm }) => {
  //     try {
  //       const selectedItem = items.find(item => item.descripcion === values.item);
  //       const selectedPuntoDeVenta = puntosDeVenta.find(punto => punto.nombre === values.puntoDeVenta);
  //       const facturaData = {
  //         idPuntoVenta: selectedPuntoDeVenta.id,
  //         idCliente: client.id,
  //         usuario: client.nombreRazonSocial,
  //         detalle: [
  //           {
  //             idProducto: selectedItem.id,
  //             cantidad: values.cantidad,
  //             montoDescuento: values.descuento
  //           }
  //         ]
  //       };
  //       const response = await emitirFactura(facturaData);
  //       console.log('Link generado:');
  //       console.log('Respuesta del servidor:', response.data);
        
  //       const doc = await generatePDF(response.data.xmlContent);
  //       doc.save(`factura-${response.data.cuf}.pdf`); 
        
  //       alert('Factura emitida y descargada con éxito');
  //       console.log('Respuesta del servidor:', response.data);
  //       console.log('Link generado:');
  //       resetForm();
  //       navigate('/ventas');
  //     } catch (error) {
  //       console.error('Error al emitir la factura:', error);
  //       alert('Error al emitir la factura');
  //     }
  //   };

  //   return (
  //     <main className="factura-container">
  //       <h1>Formulario de venta</h1>
  //       <h2>Datos del Cliente</h2>
  //       <div className="form-group">
  //         <label>Razón Social:</label>
  //         <input type="text" value={client.nombreRazonSocial || ''} readOnly />
  //       </div>
  //       <div className="form-group">
  //         <label>Correo:</label>
  //         <input type="email" value={client.email || ''} readOnly />
  //       </div>
  //       <div className="form-group">
  //         <label>NIT/CI:</label>
  //         <input type="text" value={client.numeroDocumento || ''} readOnly />
  //       </div>

  //       <h2>Detalles coorporativos</h2>
  //       <Formik
  //         initialValues={initialValues}
  //         validationSchema={validationSchema}
  //         onSubmit={handleSubmit}
  //       >
  //         {({ resetForm, setFieldValue }) => (
  //           <Form>
  //             <div className="form-group">
  //               <label>Punto de Venta:</label>
  //               <Field as="select" name="puntoDeVenta">
  //                 <option value="">Seleccione un punto de venta</option>
  //                 {puntosDeVenta.map(punto => (
  //                   <option key={punto.id} value={punto.nombre}>
  //                     {punto.nombre}
  //                   </option>
  //                 ))}
  //               </Field>
  //               <ErrorMessage name="puntoDeVenta" component="div" className="error-message" />
  //             </div>
  //             <div className="form-group">
  //               <label>Vendedor:</label>
  //               <Field as="select" name="vendedor">
  //                 <option value="">Persona a cargo de la venta</option>
  //                 {vendors.map(vendor => {
  //                   const vendorFullName = `${vendor.firstName} ${vendor.lastName}`;
  //                   return (
  //                     <option key={vendor.id} value={vendorFullName}>
  //                       {vendorFullName}
  //                     </option>
  //                   );
  //                 })}
  //               </Field>
  //               <ErrorMessage name="vendedor" component="div" className="error-message" />
  //             </div>
  //             <h2>Detalle de la Transacción</h2>
  //             <div className="form-group">
  //               <label>Item/Descripción:</label>
  //               <Field as="select" name="item" onChange={(e) => {
  //                 const selectedItem = items.find(item => item.descripcion === e.target.value);
  //                 setFieldValue('item', e.target.value);
  //                 setFieldValue('precioUnitario', selectedItem ? selectedItem.precioUnitario : '');
  //               }}>
  //                 <option value="">Seleccione un item</option>
  //                 {items.map(item => (
  //                   <option key={item.id} value={item.descripcion}>
  //                     {item.descripcion}
  //                   </option>
  //                 ))}
  //               </Field>
  //               <ErrorMessage name="item" component="div" className="error-message" />
  //             </div>
  //             <div className="row">
  //               <div className="form-group">
  //                 <label>Cantidad:</label>
  //                 <Field type="number" name="cantidad" />
  //                 <ErrorMessage name="cantidad" component="div" className="error-message" />
  //               </div>
                
  //               <div className="row">
  //                 <div className="form-group">
  //                   <label>Precio Unitario (Bs):</label>
  //                   <Field type="number" name="precioUnitario" readOnly />
  //                   <ErrorMessage name="precioUnitario" component="div" className="error-message" />
  //                 </div>
  //                 <div className="form-group">
  //                 <label>Descuento (Bs):</label>
  //                 <Field type="number" name="descuento" />
  //                 <ErrorMessage name="descuento" component="div" className="error-message" />
  //                 </div>
  //               </div>
  //             </div>
             
  //             <div className="form-buttons">
  //               <button 
  //                   type="submit" 
  //                   disabled={!flag}
  //                   className={flag ? 'btn-enabled' : 'btn-disabled'}
  //                   >Emitir Factura
  //               </button>
  //               <button className='btn-clear' type="button" onClick={resetForm}>Limpiar Datos</button>
  //             </div>
  //           </Form>
  //         )}
  //       </Formik>
  //       <div className='bot-btns'>
  //         <button 
  //                 className={`btn-no-fact ${flag ? 'btn-disabled' : 'btn-enabled'}`}
  //                 onClick={handleVentaSinFactura} 
  //                 disabled={flag}
  //                 >Registrar venta sin Factura
  //         </button>
  //         <button className='btn-back' onClick={handleBack}>Generar factura con un NIT diferente</button>
  //       </div>
  //     </main>
  //   );
  // };

  // export default FacturaForm;
  // //unidad medida si es que en algun momento se necesita
  // {/* <div className="form-group">
  //                 <label>Unidad Medida:</label>
  //                 <Field as="select" name="unidadMedida">
  //                   <option value="">Seleccione unidad medida:</option>
  //                   {unidadMedida.map(unidad => {
  //                     return (
  //                       <option key={unidad.codigoClasificador} value={unidad.descripcion}>
  //                         {unidad.descripcion}
  //                       </option>
  //                     );
  //                   })}
  //                 </Field>
  //                 <ErrorMessage name="unidadMedida" component="div" className="error-message" />
  //               </div> */}
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import './FacturaForm.css';
import { fetchItems, emitirFactura, fetchPuntosDeVenta, getUserVendor, getUnidadMedida } from '../../service/api';
import { generatePDF } from '../../utils/generatePDF';

const FacturaForm = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { flag } = location.state;

  console.log('Flag value:', flag);

  const client = location.state?.client || {
    nombreRazonSocial: "sin usuario",
    email: "...",
    numeroDocumento: "0000000000 CB"
  };

  const [items, setItems] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [puntosDeVenta, setPuntosDeVenta] = useState([]);
  const [unidadMedida, setUnidadMedida] = useState([]);

  useEffect(() => {
    const getItems = async () => {
      try {
        const response = await fetchItems();
        setItems(response.data);
      } catch (error) {
        console.error('Error fetching items:', error);
      }
    };

    const getVendors = async () => {
      try {
        const response = await getUserVendor();
        setVendors(response.data);
        console.log('vendedores:', response.data);
      } catch (error) {
        console.error('Error fetching vendors:', error);
      }
    };

    const getPuntosDeVenta = async () => {
      try {
        const response = await fetchPuntosDeVenta();
        setPuntosDeVenta(response.data);
        console.log('Puntos de venta:', response.data);
      } catch (error) {
        console.error('Error fetching puntos de venta:', error);
      }
    };

    const getUnidadMedidas = async () => {
      try {
        const response = await getUnidadMedida();
        setUnidadMedida(response.data);
        console.log('Unidad de medida:', response.data);
      } catch (error) {
        console.error('Error fetching unidad de medida:', error);
      }
    };

    getUnidadMedidas();
    getVendors();
    getItems();
    getPuntosDeVenta();
  }, []);

  const initialValues = {
    item: '',
    cantidad: '',
    unidadMedida: '',
    precioUnitario: '',
    descuento: 0,
    puntoDeVenta: ''
  };

  const validationSchema = Yup.object({
    item: Yup.string().required('Seleccione un item'),
    cantidad: Yup.number().required('Ingrese la cantidad').positive('Debe ser un número positivo'),
    unidadMedida: Yup.string().required('Ingrese la unidad de medida'),
    precioUnitario: Yup.number().required('Ingrese el precio unitario').positive('Debe ser un número positivo'),
    descuento: Yup.number().min(0, 'Debe ser un número positivo o cero'),
    puntoDeVenta: Yup.string().required('Seleccione un punto de venta'),
    vendedor: Yup.string().required('Seleccione un vendedor')
  });

  const handleBack = () => {
    navigate("/facturacion");
  };

  const handleVentaSinFactura = () => {
    console.log('Venta sin factura');
  };

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
      console.log('Link generado:');
      console.log('Respuesta del servidor:', response.data);

      const doc = await generatePDF(response.data.xmlContent);
      doc.save(`factura-${response.data.cuf}.pdf`);

      alert('Factura emitida y descargada con éxito');
      console.log('Respuesta del servidor:', response.data);
      console.log('Link generado:');
      resetForm();
      navigate('/ventas');
    } catch (error) {
      console.error('Error al emitir la factura:', error);
      alert('Error al emitir la factura');
    }
  };

  return (
    <main className="factura-container">
      <h1>Formulario de venta</h1>
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

      <h2>Detalles corporativos</h2>
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
            <div className="form-group">
              <label>Vendedor:</label>
              <Field as="select" name="vendedor">
                <option value="">Persona a cargo de la venta</option>
                {vendors.map(vendor => {
                  const vendorFullName = `${vendor.firstName} ${vendor.lastName}`;
                  return (
                    <option key={vendor.id} value={vendorFullName}>
                      {vendorFullName}
                    </option>
                  );
                })}
              </Field>
              <ErrorMessage name="vendedor" component="div" className="error-message" />
            </div>
            <h2>Detalle de la Transacción</h2>
            <div className="form-row">
              <div className="form-group item-field">
                <label>Item/Descripción:</label>
                <Field as="select" name="item" onChange={(e) => {
                  const selectedItem = items.find(item => item.descripcion === e.target.value);
                  setFieldValue('item', e.target.value);
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
              <div className="form-group cantidad-field">
                <label>Cantidad:</label>
                <Field type="number" name="cantidad" />
                <ErrorMessage name="cantidad" component="div" className="error-message" />
              </div>
              <div className="form-group precio-field">
                <label>Precio Unitario (Bs):</label>
                <Field type="number" name="precioUnitario" readOnly />
                <ErrorMessage name="precioUnitario" component="div" className="error-message" />
              </div>
              <div className="form-group descuento-field">
                <label>Descnto(Bs):</label>
                <Field type="number" name="descuento" />
                <ErrorMessage name="descuento" component="div" className="error-message" />
              </div>
            </div>
            <div className="form-buttons">
              <button
                type="submit"
                disabled={!flag}
                className={flag ? 'btn-enabled' : 'btn-disabled'}
              >
                Emitir Factura
              </button>
              <button className="btn-clear" type="button" onClick={resetForm}>
                Limpiar Datos
              </button>
            </div>
          </Form>
        )}
      </Formik>
      <div className="bot-btns">
        <button
          className={`btn-no-fact ${flag ? 'btn-disabled' : 'btn-enabled'}`}
          onClick={handleVentaSinFactura}
          disabled={flag}
        >
          Registrar venta sin Factura
        </button>
        <button className="btn-back" onClick={handleBack}>
          Generar factura con un NIT diferente
        </button>
      </div>
    </main>
  );
};

export default FacturaForm;