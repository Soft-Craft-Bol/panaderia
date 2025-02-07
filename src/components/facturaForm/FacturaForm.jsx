import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import './FacturaForm.css';
import { fetchProductos,emitirFactura } from '../../service/api';

const FacturaForm = () => {
  const location = useLocation();
  const client = location.state?.client || {
    nombreRazonSocial: "Torricos SRL",
    email: "gfredo@softcraft.bo",
    numeroDocumento: "14382800019 CB"
  };

  const [productos, setProductos] = useState([]);
  const [selectedProducto, setSelectedProducto] = useState('');

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

  const handleProductoChange = (e) => {
    setSelectedProducto(e.target.value);
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
      <div className="form-group">
        <label>Producto/Descripción:</label>
        <select value={selectedProducto} onChange={handleProductoChange}>
          <option value="">Seleccione un producto</option>
          {productos.map(producto => (
            <option key={producto.id} value={producto.descripcionProducto}>
              {producto.descripcionProducto}
            </option>
          ))}
        </select>
      </div>
      <div className="row">
        <div className="form-group">
          <label>Cantidad:</label>
          <input type="number"/>
        </div>
        <div className="form-group">
          <label>Unidad de Medida:</label>
          <input type="text"/>
        </div>
      </div>
      <div className="row">
        <div className="form-group">
          <label>Precio Unitario (Bs):</label>
          <input type="number"/>
        </div>
        <div className="form-group">
          <label>Descuento (Bs):</label>
          <input type="number"/>
        </div>
      </div>
    </main>
  );
};

export default FacturaForm;