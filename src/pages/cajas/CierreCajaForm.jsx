import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  getResumenPagos,
  getResumenPagosCredito,
  cerrarCaja,
  getResumenProductos,
  getProductosByPuntoVenta,
  getStockInicial
} from '../../service/api';

import { FaCashRegister, FaFileInvoiceDollar, FaWallet, FaExchangeAlt, FaPrint, FaSave } from 'react-icons/fa';
import { MdAttachMoney, MdPointOfSale, MdCreditCard, MdAccountBalanceWallet } from 'react-icons/md';

import { generateCierreCajaPDF } from '../../utils/generateCierreCajaPDF';
import './CierreCajaForm.css';
import ResumenProductos from './ResumenProductos';
import { Button } from '../../components/buttons/Button';
import TextArea from '../../components/inputs/TextArea';
import InputText from '../../components/inputs/InputText';

const CierreCajaForm = ({ caja, usuario, onCancelar, onCierreExitoso }) => {

  const [formData, setFormData] = useState({
    gastos: '',
    efectivoFinal: '',
    billeteraMovilFinal: '',
    transferenciaFinal: '',
    observaciones: ''
  });

  const [resumenPagos, setResumenPagos] = useState(null);
  const [resumenCredito, setResumenCredito] = useState(null);
  const [loading, setLoading] = useState(false);

  const reportRef = useRef();

  useEffect(() => {
    (async () => {
      try {
        const res = await getResumenPagos(caja.id);
        setResumenPagos(res.data);
      } catch (e) {
        console.error("Error resumen ventas:", e);
      }
    })();
  }, [caja.id]);

  useEffect(() => {
    (async () => {
      try {
        const res = await getResumenPagosCredito(caja.id);
        setResumenCredito(res.data);
      } catch (e) {
        console.error("Error resumen crédito:", e);
      }
    })();
  }, [caja.id]);

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const subtotalFact = resumenPagos?.facturacion?.subtotal || 0;
  const subtotalSinFact = resumenPagos?.sin_facturacion?.subtotal || 0;

  const totalVentas = useMemo(() => subtotalFact + subtotalSinFact, [subtotalFact, subtotalSinFact]);

  const totalPagoPosterior = useMemo(() => {
    return (resumenPagos?.facturacion?.pago_posterior || 0) +
      (resumenPagos?.sin_facturacion?.pago_posterior || 0);
  }, [resumenPagos]);

  const totalAbonos = resumenCredito?.totalGeneral || 0;

  const getTotalPorMetodoPago = (metodo) => {
    let total = 0;

    // Sumar de ventas con factura
    if (resumenPagos?.facturacion?.[metodo]) {
      total += resumenPagos.facturacion[metodo] || 0;
    }

    // Sumar de ventas sin factura
    if (resumenPagos?.sin_facturacion?.[metodo]) {
      total += resumenPagos.sin_facturacion[metodo] || 0;
    }

    return total;
  };

  // Obtener total por método de pago específico
  const totalEfectivoVentas = useMemo(() => getTotalPorMetodoPago('efectivo'), [resumenPagos]);
  const totalBilleteraMovilVentas = useMemo(() => getTotalPorMetodoPago('billetera_movil'), [resumenPagos]);
  const totalTransferenciaVentas = useMemo(() => getTotalPorMetodoPago('transferencia'), [resumenPagos]);

  const getTotalAbonosPorMetodo = (metodo) => {
    if (!resumenCredito?.resumenMetodos) return 0;

    const metodoEncontrado = resumenCredito.resumenMetodos.find(
      item => item.metodoPago.toLowerCase() === metodo.toLowerCase()
    );

    return metodoEncontrado ? metodoEncontrado.total : 0;
  };

  const totalEfectivoAbonos = useMemo(() => getTotalAbonosPorMetodo('EFECTIVO'), [resumenCredito]);
  const totalBilleteraMovilAbonos = useMemo(() => getTotalAbonosPorMetodo('BILLETERA MOVIL'), [resumenCredito]);
  const totalTransferenciaAbonos = useMemo(() => getTotalAbonosPorMetodo('TRANSFERENCIA'), [resumenCredito]);

  const totalEfectivoGeneral = useMemo(() =>
    totalEfectivoVentas + totalEfectivoAbonos,
    [totalEfectivoVentas, totalEfectivoAbonos]
  );

  const totalBilleteraMovilGeneral = useMemo(() =>
    totalBilleteraMovilVentas + totalBilleteraMovilAbonos,
    [totalBilleteraMovilVentas, totalBilleteraMovilAbonos]
  );

  const totalTransferenciaGeneral = useMemo(() =>
    totalTransferenciaVentas + totalTransferenciaAbonos,
    [totalTransferenciaVentas, totalTransferenciaAbonos]
  );

  const totalSistema = useMemo(() => {
    return totalVentas - totalPagoPosterior + totalAbonos - (parseFloat(formData.gastos || 0));
  }, [totalVentas, totalPagoPosterior, totalAbonos, formData.gastos]);

  const totalContado = useMemo(() => {
    return (
      parseFloat(formData.efectivoFinal || 0) +
      parseFloat(formData.billeteraMovilFinal || 0) +
      parseFloat(formData.transferenciaFinal || 0)
    );
  }, [formData]);

  const diferencia = useMemo(() => {
    return (totalContado - totalSistema).toFixed(2);
  }, [totalContado, totalSistema]);

  const limpiarResumenPagos = (resumen) => {
    const limpio = {};
    for (const tipo in resumen) {
      limpio[tipo] = { ...resumen[tipo] };
      delete limpio[tipo].subtotal;
      delete limpio[tipo].total;
      delete limpio[tipo].general;
    }
    return limpio;
  };

  const handleGuardar = async () => {
    if (!resumenPagos) return alert("No hay datos de ventas");

    setLoading(true);
    try {
      const payload = {
        cajaId: caja.id,
        usuarioId: usuario.id,
        puntoVenta: usuario.puntosVenta[0]?.id || null,

        gastos: Number(formData.gastos) || 0,
        efectivoFinal: Number(formData.efectivoFinal) || 0,
        billeteraMovilFinal: Number(formData.billeteraMovilFinal) || 0,
        transferenciaFinal: Number(formData.transferenciaFinal) || 0,

        totalSistema,
        totalContado,
        diferencia: Number(diferencia),
        observaciones: formData.observaciones,

        resumenPagos: limpiarResumenPagos(resumenPagos),

        resumenMetodosPago: {
          efectivo: totalEfectivoGeneral,
          billeteraMovil: totalBilleteraMovilGeneral,
          transferencia: totalTransferenciaGeneral,
          pagoPosterior: totalPagoPosterior
        },

        resumenAbonos: resumenCredito
      };

      console.log("Payload cierre caja:", payload);
      const res = await cerrarCaja(payload);
      console.log("Cierre guardado:", res.data);
      onCierreExitoso?.();
      alert("Cierre guardado correctamente");

    } catch (e) {
      console.error(e);
      alert("Error al guardar cierre");
    }
    setLoading(false);
  };


  const handleImprimir = async () => {
    try {
      const productosResponse = await getResumenProductos(caja.id);
      const stockResponse = await getProductosByPuntoVenta(usuario.puntosVenta[0]?.id, 0, 1000, '', null, null, [], false, 'cantidadDisponible,desc');
      const stockInicialResponse = await getStockInicial(caja.id);

      const data = {
        caja: caja.nombre,
        usuario: usuario.username,
        montoInicial: caja.montoInicial.toFixed(2),
        resumenPagos,
        resumenProductos: productosResponse.data,
        productosStock: stockResponse.data.productos,
        productosStockInicial: stockInicialResponse.data.productos,
        totalVentas,
        totalAbonos,
        totalSistema,
        totalContado,
        diferencia,
        observaciones: formData.observaciones,
        fecha: new Date().toLocaleString(),
        // Nuevos datos para el PDF
        resumenMetodosPago: {
          efectivo: totalEfectivoGeneral,
          billeteraMovil: totalBilleteraMovilGeneral,
          transferencia: totalTransferenciaGeneral,
          pagoPosterior: totalPagoPosterior
        },
        resumenMetodosPagoDetalle: {
          ventasEfectivo: totalEfectivoVentas,
          ventasBilleteraMovil: totalBilleteraMovilVentas,
          ventasTransferencia: totalTransferenciaVentas,
          abonosEfectivo: totalEfectivoAbonos,
          abonosBilleteraMovil: totalBilleteraMovilAbonos,
          abonosTransferencia: totalTransferenciaAbonos
        },
        resumenAbonos: resumenCredito
      };

      generateCierreCajaPDF(data, reportRef.current);

    } catch (e) {
      console.error(e);
      alert("Error generando PDF");
    }
  };

  return (
    <div className="cierre-dashboard" ref={reportRef}>

      <header className="dashboard-header">
        <FaCashRegister />
        <h1>{caja.nombre}</h1>
        <span>Usuario: {usuario.username}</span>
      </header>

      <div className="dashboard-grid">

        <section className="dashboard-card">
          <h3><MdAttachMoney /> Monto Inicial</h3>
          <strong>Bs. {caja.montoInicial.toFixed(2)}</strong>
        </section>

        <section className="dashboard-card">
          <h3><MdPointOfSale /> Resumen de Ventas</h3>

          {!resumenPagos && <p>Cargando...</p>}

          {resumenPagos && (
            <>
              <p><strong>Total con factura:</strong> Bs. {subtotalFact.toFixed(2)}</p>
              <p><strong>Total sin factura:</strong> Bs. {subtotalSinFact.toFixed(2)}</p>
              <p><strong>Pago posterior:</strong> Bs. {totalPagoPosterior.toFixed(2)}</p>
              <p><strong>Abonos hoy:</strong> Bs. {totalAbonos.toFixed(2)}</p>

              <hr />
              <h4>Total ventas del día:</h4>
              <strong>Bs. {totalVentas.toFixed(2)}</strong>
            </>
          )}
        </section>

        <section className="dashboard-card">
          <h3><MdCreditCard /> Métodos de Pago - Ventas</h3>

          {resumenPagos && (
            <>
              <div className="metodo-pago-item">
                <span><MdAttachMoney /> Efectivo:</span>
                <strong>Bs. {totalEfectivoVentas.toFixed(2)}</strong>
              </div>

              <div className="metodo-pago-item">
                <span><MdAccountBalanceWallet /> Billetera Móvil:</span>
                <strong>Bs. {totalBilleteraMovilVentas.toFixed(2)}</strong>
              </div>

              <div className="metodo-pago-item">
                <span><FaExchangeAlt /> Transferencia:</span>
                <strong>Bs. {totalTransferenciaVentas.toFixed(2)}</strong>
              </div>

              <div className="metodo-pago-item">
                <span><FaFileInvoiceDollar /> Pago Posterior:</span>
                <strong>Bs. {totalPagoPosterior.toFixed(2)}</strong>
              </div>
            </>
          )}
        </section>

        <section className="dashboard-card">
          <h3><FaWallet /> Métodos de Pago - Abonos</h3>

          {!resumenCredito && <p>Cargando abonos...</p>}

          {resumenCredito && (
            <>
              {resumenCredito.resumenMetodos && resumenCredito.resumenMetodos.length > 0 ? (
                <>
                  {resumenCredito.resumenMetodos.map((item, index) => (
                    <div key={index} className="metodo-pago-item">
                      <span>
                        {item.metodoPago === 'EFECTIVO' && <MdAttachMoney />}
                        {item.metodoPago === 'BILLETERA MOVIL' && <MdAccountBalanceWallet />}
                        {item.metodoPago === 'TRANSFERENCIA' && <FaExchangeAlt />}
                        {item.metodoPago}:
                      </span>
                      <strong>Bs. {item.total.toFixed(2)}</strong>
                    </div>
                  ))}

                  <hr />
                  <div className="metodo-pago-item total">
                    <span>Total Abonos:</span>
                    <strong>Bs. {resumenCredito.totalGeneral.toFixed(2)}</strong>
                  </div>
                </>
              ) : (
                <p>No hay abonos registrados</p>
              )}
            </>
          )}
        </section>
        <div className="dashboard-card card-productos">
          <ResumenProductos cajaId={caja.id} />
        </div>

        <section className="dashboard-card">
          <h3>Datos para el cierre</h3>

          <InputText
            label="Gastos"
            name="gastos"
            type="number"
            value={formData.gastos}
            formik={false}
            onChange={handleChange}
          />
          <InputText
            label="Efectivo Final"
            name="efectivoFinal"
            type="number"
            value={formData.efectivoFinal}
            formik={false}
            onChange={handleChange}
          />

          <InputText
            label="Billetera Móvil Final"
            name="billeteraMovilFinal"
            type="number"
            value={formData.billeteraMovilFinal}
            formik={false}
            onChange={handleChange}
          />

          <InputText
            label="Transferencias Finales"
            name="transferenciaFinal"
            type="number"
            value={formData.transferenciaFinal}
            formik={false}
            onChange={handleChange}
          />
          <TextArea
            label="Observaciones"
            name="observaciones"
            formik={false}
            rows={3}
            value={formData.observaciones}
            onChange={handleChange}
          />

        </section>

        <section className="dashboard-card">
          <h3><FaFileInvoiceDollar /> Resumen Final</h3>

          <div className="metodo-pago-item">
            <span>Total sistema:</span>
            <strong>Bs. {totalSistema.toFixed(2)}</strong>
          </div>

          <div className="metodo-pago-item">
            <span>Total contado:</span>
            <strong>Bs. {totalContado.toFixed(2)}</strong>
          </div>

          <div className="metodo-pago-item">
            <span>Diferencia:</span>
            <strong style={{ color: diferencia >= 0 ? 'green' : 'red' }}>
              Bs. {diferencia}
            </strong>
          </div>

          <hr />

          <h4>Totales por Método (Sistema)</h4>
          <div className="metodo-pago-item">
            <span><MdAttachMoney /> Efectivo total:</span>
            <strong>Bs. {totalEfectivoGeneral.toFixed(2)}</strong>
          </div>

          <div className="metodo-pago-item">
            <span><MdAccountBalanceWallet /> Billetera Móvil total:</span>
            <strong>Bs. {totalBilleteraMovilGeneral.toFixed(2)}</strong>
          </div>

          <div className="metodo-pago-item">
            <span><FaExchangeAlt /> Transferencia total:</span>
            <strong>Bs. {totalTransferenciaGeneral.toFixed(2)}</strong>
          </div>
        </section>

      </div>

      <div className="dashboard-actions">
        <Button variant='primary' onClick={handleGuardar} disabled={loading}>
          <FaSave /> Guardar Cierre
        </Button>

        <Button variant='secundary' onClick={handleImprimir} disabled={!resumenPagos}>
          <FaPrint /> Imprimir PDF
        </Button>

        <Button variant='danger' onClick={onCancelar}>
          Cancelar
        </Button>
      </div>
    </div>
  );
};

export default CierreCajaForm;