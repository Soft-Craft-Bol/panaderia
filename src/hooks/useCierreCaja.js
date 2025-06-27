import { useState } from 'react';
import { createCierreCaja } from '../service/api'; // Asegúrate de que esta ruta sea correcta

const useCierreCaja = () => {
  const [loading, setLoading] = useState(false);

  const calcularCierre = (values) => {
    const {
      ventaFacturaEfectivo = 0,
      ventaFacturaTarjeta = 0,
      ventaFacturaQr = 0,
      ventaSinFacturaEfectivo = 0,
      ventaSinFacturaTransferencia = 0,
      gastos = 0
    } = values;

    const totalVentas = ventaFacturaEfectivo + ventaFacturaTarjeta + ventaFacturaQr + 
                       ventaSinFacturaEfectivo + ventaSinFacturaTransferencia;
    
    return {
      totalVentas,
      totalGastos: gastos,
      totalEsperado: totalVentas - gastos
    };
  };

  const guardarCierre = async (data) => {
    setLoading(true);
    try {
      // Esto deberá actualizarse cuando tengas el endpoint
      const response = await createCierreCaja.post('/cierre-cajas', data);
      return response.data;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return { calcularCierre, guardarCierre, loading };
};

export default useCierreCaja;