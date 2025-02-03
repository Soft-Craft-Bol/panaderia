import React, { useState } from 'react';
import './Facturacion.css';

const Facturacion = () => {
  const contribuyente = {
    nit: '5132689015',
    razonSocial: 'VARGAS UGARTE NELSON MARIO',
    dependencia: 'TUPIZA'
  };

  const [transaccion, setTransaccion] = useState({
    sucursal: '',
    actividad: '',
    casoEspecial: 'Ninguna',
    tipoDocumento: '',
    documento: '',
    correo: ''
  });

  const [cliente, setCliente] = useState({
    razonSocial: '',
    correo: '',
    nit: ''
  });

  const [detalle, setDetalle] = useState({
    producto: '',
    cantidad: 1,
    unidad: '',
    precioUnitario: 0,
    descuento: 0
  });

  const handleEmitir = () => {
    console.log('Emitir factura', { contribuyente, transaccion, cliente, detalle });
  };

  const handleLimpiar = () => {
    setTransaccion({ sucursal: '', actividad: '', casoEspecial: 'Ninguna', tipoDocumento: '', documento: '', correo: '' });
    setCliente({ razonSocial: '', correo: '', nit: '' });
    setDetalle({ producto: '', cantidad: 1, unidad: '', precioUnitario: 0, descuento: 0 });
  };

  return (
    <div className="facturacion-container">
      <div className="section contribuyente-section">
        <h2>Datos Básicos del Contribuyente</h2>
        <p><strong>NIT:</strong> {contribuyente.nit}</p>
        <p><strong>Nombre o Razón Social:</strong> {contribuyente.razonSocial}</p>
        <p><strong>Dependencia:</strong> {contribuyente.dependencia}</p>
      </div>
      <div className="section transaccion-section">
        <h2>Datos de la Transacción Comercial</h2>
        <label>Sucursal: <input type="text" value={transaccion.sucursal} onChange={e => setTransaccion({ ...transaccion, sucursal: e.target.value })} /></label>
        <label>Actividad: <input type="text" value={transaccion.actividad} onChange={e => setTransaccion({ ...transaccion, actividad: e.target.value })} /></label>
        <label>Caso Especial: 
          <select value={transaccion.casoEspecial} onChange={e => setTransaccion({ ...transaccion, casoEspecial: e.target.value })}>
            <option value="Ninguna">Ninguna</option>
            <option value="99001">Extranjero no inscrito</option>
            <option value="99002">Control Tributario</option>
            <option value="99003">Ventas Menores</option>
          </select>
        </label>
        <label>Tipo Documento: <input type="text" value={transaccion.tipoDocumento} onChange={e => setTransaccion({ ...transaccion, tipoDocumento: e.target.value })} /></label>
        <label>Nº Documento/NIT: <input type="text" value={transaccion.documento} onChange={e => setTransaccion({ ...transaccion, documento: e.target.value })} /></label>
        <label>Correo Electrónico: <input type="email" value={transaccion.correo} onChange={e => setTransaccion({ ...transaccion, correo: e.target.value })} /></label>
      </div>

      <div className="section cliente-section">
        <h2>Datos Básicos del Cliente</h2>
        <label>Razón Social: <input type="text" value={cliente.razonSocial} onChange={e => setCliente({ ...cliente, razonSocial: e.target.value })} /></label>
        <label>Correo Electrónico: <input type="email" value={cliente.correo} onChange={e => setCliente({ ...cliente, correo: e.target.value })} /></label>
        <label>NIT/CI: <input type="text" value={cliente.nit} onChange={e => setCliente({ ...cliente, nit: e.target.value })} /></label>
      </div>

      <div className="section detalle-section">
        <h2>Detalle de la Transacción Comercial</h2>
        <label>Producto/Descripción: <input type="text" value={detalle.producto} onChange={e => setDetalle({ ...detalle, producto: e.target.value })} /></label>
        <label>Cantidad: <input type="number" value={detalle.cantidad} onChange={e => setDetalle({ ...detalle, cantidad: parseInt(e.target.value) })} /></label>
        <label>Unidad de Medida: <input type="text" value={detalle.unidad} onChange={e => setDetalle({ ...detalle, unidad: e.target.value })} /></label>
        <label>Precio Unitario (Bs): <input type="number" value={detalle.precioUnitario} onChange={e => setDetalle({ ...detalle, precioUnitario: parseFloat(e.target.value) })} /></label>
        <label>Descuento (Bs): <input type="number" value={detalle.descuento} onChange={e => setDetalle({ ...detalle, descuento: parseFloat(e.target.value) })} /></label>
      </div>

      <div className="buttons-container">
        <button className='btn-emitir' onClick={handleEmitir}>Emitir</button>
        <button className='btn-limpiar' onClick={handleLimpiar}>Limpiar</button>
      </div>
    </div>
  );
};

export default Facturacion;
