import React, { useState, useEffect } from 'react';
import './Facturacion.css';
import { getAllClient, createClient, fetchProductos, emitirFactura } from '../../service/api';

const Facturacion = () => {
  const contribuyente = {
    nit: '3655579015',
    razonSocial: 'COA CARDONA DE CARDOZO ANTONIA',
    dependencia: 'CHUQUISACA'
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
    id: null, // Nuevo campo para guardar el ID del cliente
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

  const [productos, setProductos] = useState([]);
  const [mensaje, setMensaje] = useState('');

  useEffect(() => {
    // Cargar productos al montar el componente
    fetchProductos().then(response => {
      setProductos(response.data);
    }).catch(error => {
      console.error('Error fetching productos:', error);
    });
  }, []);

  const buscarCliente = async (numeroDocumento) => {
    try {
      const response = await getAllClient();
      const clienteEncontrado = response.data.find(cliente => cliente.numeroDocumento === numeroDocumento);
      if (clienteEncontrado) {
        setCliente({
          id: clienteEncontrado.id, // Guardar el ID del cliente encontrado
          razonSocial: clienteEncontrado.nombreRazonSocial,
          correo: clienteEncontrado.email || '',
          nit: clienteEncontrado.numeroDocumento
        });
        setMensaje('');
      } else {
        setMensaje('Cliente no encontrado. Por favor, cree un nuevo cliente.');
      }
    } catch (error) {
      console.error('Error buscando cliente:', error);
    }
  };

  const crearCliente = async () => {
    const nuevoCliente = {
      nombreRazonSocial: cliente.razonSocial,
      codigoTipoDocumentoIdentidad: 5, // Asumiendo que 5 es el código para CI
      numeroDocumento: cliente.nit,
      complemento: null,
      codigoCliente: `C-${cliente.nit}`,
      email: cliente.correo
    };

    try {
      const response = await createClient(nuevoCliente);
      setCliente({
        ...cliente,
        id: response.data.id // Guardar el ID del cliente creado
      });
      setMensaje('Cliente creado exitosamente.');
    } catch (error) {
      console.error('Error creando cliente:', error);
    }
  };

  const handleEmitir = async () => {
    if (!cliente.id) {
      setMensaje('Por favor, complete los datos del cliente.');
      return;
    }

    const facturaData = {
      idPuntoVenta: transaccion.sucursal,
      idCliente: cliente.id, // Usar el ID del cliente
      usuario: contribuyente.razonSocial,
      detalle: [{
        idProducto: detalle.producto,
        cantidad: detalle.cantidad,
        montoDescuento: detalle.descuento
      }]
    };

    try {
      await emitirFactura(facturaData);
      setMensaje('Factura emitida exitosamente.');
    } catch (error) {
      console.error('Error emitiendo factura:', error);
    }
  };

  const handleLimpiar = () => {
    setTransaccion({ sucursal: '', actividad: '', casoEspecial: 'Ninguna', tipoDocumento: '', documento: '', correo: '' });
    setCliente({ id: null, razonSocial: '', correo: '', nit: '' });
    setDetalle({ producto: '', cantidad: 1, unidad: '', precioUnitario: 0, descuento: 0 });
    setMensaje('');
  };

  return (
    <div className="facturacion-container">
      <div className="contribuyente-section">
        <div className="contribuyente-item">
          <strong>NIT:</strong> {contribuyente.nit}
        </div>
        <div className="contribuyente-item">
          <strong>Razón Social:</strong> {contribuyente.razonSocial}
        </div>
        <div className="contribuyente-item">
          <strong>Dependencia:</strong> {contribuyente.dependencia}
        </div>
      </div>

      <div className="section transaccion-section">
        <h2>Datos de la Transacción</h2>
        <div className="input-grid">
          <label>
            Punto de Venta:
            <input type="text" value={transaccion.sucursal} onChange={e => setTransaccion({ ...transaccion, sucursal: e.target.value })} />
          </label>
          <label>
            Caso Especial:
            <select value={transaccion.casoEspecial} onChange={e => setTransaccion({ ...transaccion, casoEspecial: e.target.value })}>
              <option value="Ninguna">Ninguna</option>
              <option value="99001">Extranjero no inscrito</option>
              <option value="99002">Control Tributario</option>
              <option value="99003">Ventas Menores</option>
            </select>
          </label>
          <label>
            Tipo Documento:
            <input type="text" value={transaccion.tipoDocumento} onChange={e => setTransaccion({ ...transaccion, tipoDocumento: e.target.value })} />
          </label>
          <label>
            Nº Documento/NIT:
            <input 
              type="text" 
              value={transaccion.documento} 
              onChange={e => {
                setTransaccion({ ...transaccion, documento: e.target.value });
                if (e.target.value.length === 8 || e.target.value.length === 10) { // Asumiendo que el CI tiene 8 dígitos y el NIT 10
                  buscarCliente(e.target.value);
                }
              }} 
            />
          </label>
          <label>
            Correo:
            <input type="email" value={transaccion.correo} onChange={e => setTransaccion({ ...transaccion, correo: e.target.value })} />
          </label>
        </div>
      </div>

      <div className="section cliente-section">
        <h2>Datos del Cliente</h2>
        <div className="input-grid">
          <label>
            Razón Social:
            <input type="text" value={cliente.razonSocial} onChange={e => setCliente({ ...cliente, razonSocial: e.target.value })} />
          </label>
          <label>
            Correo:
            <input type="email" value={cliente.correo} onChange={e => setCliente({ ...cliente, correo: e.target.value })} />
          </label>
          <label>
            NIT/CI:
            <input type="text" value={cliente.nit} onChange={e => setCliente({ ...cliente, nit: e.target.value })} />
          </label>
        </div>
        {mensaje && <p>{mensaje}</p>}
        {mensaje === 'Cliente no encontrado. Por favor, cree un nuevo cliente.' && (
          <button onClick={crearCliente}>Crear Cliente</button>
        )}
      </div>

      <div className="section detalle-section">
        <h2>Detalle de la Transacción</h2>
        <div className="input-grid">
          <label className="producto-input">
            Producto/Descripción:
            <select value={detalle.producto} onChange={e => setDetalle({ ...detalle, producto: e.target.value })}>
              <option value="">Seleccione un producto</option>
              {productos.map(producto => (
                <option key={producto.id} value={producto.id}>{producto.descripcionProducto}</option>
              ))}
            </select>
          </label>
          <label>
            Cantidad:
            <input type="number" value={detalle.cantidad} onChange={e => setDetalle({ ...detalle, cantidad: parseInt(e.target.value) })} />
          </label>
          <label>
            Precio Unitario (Bs):
            <input type="number" value={detalle.precioUnitario} onChange={e => setDetalle({ ...detalle, precioUnitario: parseFloat(e.target.value) })} />
          </label>
          <label>
            Descuento (Bs):
            <input type="number" value={detalle.descuento} onChange={e => setDetalle({ ...detalle, descuento: parseFloat(e.target.value) })} />
          </label>
        </div>
      </div>

      <div className="buttons-container">
        <button className="btn-emitir" onClick={handleEmitir}>Emitir</button>
        <button className="btn-limpiar" onClick={handleLimpiar}>Limpiar</button>
      </div>
    </div>
  );
};

export default Facturacion;