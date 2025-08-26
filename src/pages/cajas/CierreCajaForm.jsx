import React, { useState, useEffect, useMemo, useRef } from 'react';
import { getResumenPagos, cerrarCaja } from '../../service/api';
import { getUser } from '../../utils/authFunctions';
import { FaCashRegister, FaFileInvoiceDollar, FaMoneyBillWave, FaWallet, FaExchangeAlt, FaPrint, FaSave, FaCalculator, FaFileAlt, FaInfoCircle } from 'react-icons/fa';
import { MdAttachMoney, MdPointOfSale, MdReceipt } from 'react-icons/md';
import { generateCierreCajaPDF } from '../../utils/generateCierreCajaPDF';
import './CierreCajaForm.css';

const CierreCajaForm = ({ caja }) => {
  const currentUser = useMemo(() => getUser(), []);
  const [formData, setFormData] = useState({
    gastos: '',
    efectivoFinal: '',
    billeteraMovilFinal: '',
    transferenciaFinal: '',
    observaciones: ''
  });
  
  const [resumenPagos, setResumenPagos] = useState(null);
  const [loading, setLoading] = useState(false);
  const [calculando, setCalculando] = useState(false);
  const reportRef = useRef();

  useEffect(() => {
    const fetchResumenPagos = async () => {
      try {
        setCalculando(true);
        const response = await getResumenPagos(caja.id);
        setResumenPagos(response.data);
      } catch (error) {
        console.error('Error al obtener el resumen de pagos:', error);
      } finally {
        setCalculando(false);
      }
    };

    fetchResumenPagos();
  }, [caja.id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const totalVentas = useMemo(() => {
    return resumenPagos 
      ? (resumenPagos.facturacion?.subtotal || 0) + (resumenPagos.sin_facturacion?.subtotal || 0)
      : 0;
  }, [resumenPagos]);

  const totalContado = useMemo(() => {
    return parseFloat(formData.efectivoFinal || 0) + 
           parseFloat(formData.billeteraMovilFinal || 0) + 
           parseFloat(formData.transferenciaFinal || 0);
  }, [formData.efectivoFinal, formData.billeteraMovilFinal, formData.transferenciaFinal]);

  const diferencia = useMemo(() => {
    return (totalContado - totalVentas).toFixed(2);
  }, [totalContado, totalVentas]);

  const handleGuardar = async () => {
    if (!resumenPagos || !resumenPagos.facturacion || !resumenPagos.sin_facturacion) {
      alert('No hay datos de ventas para esta caja');
      return;
    }

    setLoading(true);
    try {
      const formattedResumen = {
        facturacion: {},
        sin_facturacion: {}
      };

      const processPagos = (pagos, destino) => {
        Object.entries(pagos).forEach(([metodo, monto]) => {
          if (metodo !== 'subtotal' && monto) {
            const metodoNormalizado = metodo.toLowerCase().replace(' ', '_');
            destino[metodoNormalizado] = Number(monto);
          }
        });
      };

      processPagos(resumenPagos.facturacion, formattedResumen.facturacion);
      processPagos(resumenPagos.sin_facturacion, formattedResumen.sin_facturacion);

      const payload = {
        cajaId: caja.id,
        usuarioId: currentUser.id,
        efectivoFinal: Number(formData.efectivoFinal) || 0,
        billeteraMovilFinal: Number(formData.billeteraMovilFinal) || 0,
        transferenciaFinal: Number(formData.transferenciaFinal) || 0,
        gastos: Number(formData.gastos) || 0,
        totalSistema: totalVentas,
        diferencia: Number(diferencia),
        observaciones: formData.observaciones || '',
        resumenPagos: formattedResumen
      };

      await cerrarCaja(payload);
      alert('Cierre guardado exitosamente');
    } catch (error) {
      console.error('Error al guardar el cierre:', error);
      alert(`Error al guardar el cierre: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleImprimir = () => {
    const data = {
      caja: caja.nombre,
      usuario: currentUser.username,
      montoInicial: caja.montoInicial.toFixed(2),
      resumenPagos,
      totalVentas: totalVentas.toFixed(2),
      totalContado: totalContado.toFixed(2),
      diferencia,
      observaciones: formData.observaciones,
      fecha: new Date().toLocaleDateString()
    };
    generateCierreCajaPDF(data, reportRef.current);
  };

  const renderMetodoPago = (metodo, valor) => (
    <div className="metodo-pago-item" key={metodo}>
      <div className="metodo-icon">
        {metodo === 'efectivo' && <MdAttachMoney />}
        {metodo === 'billetera_movil' && <FaWallet />}
        {metodo === 'transferencia' && <FaExchangeAlt />}
        {metodo === 'tarjeta' && <MdPointOfSale />}
        {metodo === 'pago_online' && <FaFileInvoiceDollar />}
        {metodo.includes('factura') && <MdReceipt />}
      </div>
      <div className="metodo-info">
        <span className="metodo-nombre">{metodo.replace('_', ' ').toUpperCase()}</span>
        <span className="metodo-valor">Bs. {parseFloat(valor || 0).toFixed(2)}</span>
      </div>
    </div>
  );

  return (
    <div className="cierre-dashboard" ref={reportRef}>
      <div className="dashboard-header">
        <FaCashRegister className="header-icon" />
        <h1>Cierre de Caja - {caja.nombre}</h1>
        <div className="user-info">
          <span>Usuario: {currentUser.username}</span>
        </div>
      </div>
      <div className="dashboard-card card-inicial">
          <div className="card-header">
            <FaMoneyBillWave className="card-icon" />
            <h3>Monto Inicial</h3>
          </div>
          <div className="card-content">
            <span className="card-value">Bs. {caja.montoInicial.toFixed(2)}</span>
          </div>
        </div>

      <div className="dashboard-grid">
        {/* Resumen inicial */}
        

        {/* Resumen de ventas */}
        <div className="dashboard-card card-ventas">
          <div className="card-header">
            <MdPointOfSale className="card-icon" />
            <h3>Resumen de Ventas</h3>
          </div>
          <div className="card-content">
            {calculando ? (
              <div className="loading-content">
                <span>Calculando ventas...</span>
              </div>
            ) : resumenPagos ? (
              <div className="ventas-grid">
                <div className="ventas-group">
                  <h4><FaFileAlt /> Con Factura</h4>
                  {Object.entries(resumenPagos.facturacion)
                    .filter(([key]) => key !== 'subtotal')
                    .map(([metodo, valor]) => renderMetodoPago(metodo, valor))}
                  <div className="ventas-total">
                    <span>TOTAL:</span>
                    <strong>Bs. {resumenPagos.facturacion.subtotal?.toFixed(2) || '0.00'}</strong>
                  </div>
                </div>

                <div className="ventas-group">
                  <h4><FaFileAlt /> Sin Factura</h4>
                  {Object.entries(resumenPagos.sin_facturacion)
                    .filter(([key]) => key !== 'subtotal')
                    .map(([metodo, valor]) => renderMetodoPago(metodo, valor))}
                  <div className="ventas-total">
                    <span>TOTAL:</span>
                    <strong>Bs. {resumenPagos.sin_facturacion.subtotal?.toFixed(2) || '0.00'}</strong>
                  </div>
                </div>

                <div className="ventas-total-general">
                  <h4><FaInfoCircle /> Total General</h4>
                  <span>Bs. {totalVentas.toFixed(2)}</span>
                </div>
              </div>
            ) : (
              <div className="no-data">
                No hay datos disponibles para esta caja
              </div>
            )}
          </div>
        </div>

        {/* Formulario de cierre */}
        <div className="dashboard-card card-formulario">
          <div className="card-header">
            <FaCalculator className="card-icon" />
            <h3>Datos de Cierre</h3>
          </div>
          <div className="card-content">
            <div className="form-group">
              <label><FaMoneyBillWave /> Gastos del Turno</label>
              <input
                type="number"
                name="gastos"
                value={formData.gastos}
                onChange={handleChange}
                step="0.01"
                min="0"
                placeholder="Total de gastos"
              />
            </div>

            <div className="form-group">
              <label><MdAttachMoney /> Efectivo en Caja</label>
              <input
                type="number"
                name="efectivoFinal"
                value={formData.efectivoFinal}
                onChange={handleChange}
                step="0.01"
                min="0"
                placeholder="Ingrese el monto contado"
              />
            </div>

            <div className="form-group">
              <label><FaWallet /> Billetera Móvil</label>
              <input
                type="number"
                name="billeteraMovilFinal"
                value={formData.billeteraMovilFinal}
                onChange={handleChange}
                step="0.01"
                min="0"
                placeholder="Total billetera móvil"
              />
            </div>

            <div className="form-group">
              <label><FaExchangeAlt /> Transferencias</label>
              <input
                type="number"
                name="transferenciaFinal"
                value={formData.transferenciaFinal}
                onChange={handleChange}
                step="0.01"
                min="0"
                placeholder="Total transferencias"
              />
            </div>

            <div className="form-group">
              <label><FaFileAlt /> Observaciones</label>
              <textarea
                name="observaciones"
                value={formData.observaciones}
                onChange={handleChange}
                placeholder="Notas relevantes del turno..."
              />
            </div>
          </div>
        </div>

        {/* Resumen final */}
        <div className="dashboard-card card-resumen">
          <div className="card-header">
            <FaFileInvoiceDollar className="card-icon" />
            <h3>Resumen Final</h3>
          </div>
          <div className="card-content">
            <div className="resumen-item">
              <span>Total Ventas (Sistema)</span>
              <span className="resumen-value">Bs. {totalVentas.toFixed(2)}</span>
            </div>
            
            <div className="resumen-item">
              <span>Total Gastos</span>
              <span className="resumen-value">Bs. {parseFloat(formData.gastos || 0).toFixed(2)}</span>
            </div>
            
            <div className="resumen-subgrid">
              <h4><MdAttachMoney /> Conteo Final</h4>
              <div className="resumen-item">
                <span>Efectivo</span>
                <span className="resumen-value">Bs. {parseFloat(formData.efectivoFinal || 0).toFixed(2)}</span>
              </div>
              <div className="resumen-item">
                <span>Billetera Móvil</span>
                <span className="resumen-value">Bs. {parseFloat(formData.billeteraMovilFinal || 0).toFixed(2)}</span>
              </div>
              <div className="resumen-item">
                <span>Transferencias</span>
                <span className="resumen-value">Bs. {parseFloat(formData.transferenciaFinal || 0).toFixed(2)}</span>
              </div>
              <div className="resumen-item total">
                <span>TOTAL CONTADO</span>
                <span className="resumen-value">Bs. {totalContado.toFixed(2)}</span>
              </div>
            </div>
            
            <div className="resumen-item diferencia">
              <span>Diferencia</span>
              <span className={`resumen-value ${diferencia >= 0 ? 'positive' : 'negative'}`}>
                Bs. {diferencia}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="dashboard-actions">
        <button 
          className="btn btn-primary btn-icon"
          onClick={handleGuardar}
          disabled={loading}
        >
          <FaSave /> {loading ? 'Guardando...' : 'Guardar Cierre'}
        </button>
        
        <button 
          className="btn btn-secondary btn-icon"
          onClick={handleImprimir}
          disabled={!resumenPagos}
        >
          <FaPrint /> Generar PDF
        </button>
      </div>
    </div>
  );
};

export default CierreCajaForm;