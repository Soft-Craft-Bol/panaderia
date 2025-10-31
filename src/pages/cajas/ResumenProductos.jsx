import { useState, useEffect } from 'react';
import { getResumenProductos } from '../../service/api';
import './ResumenProductos.css';
import { FaBox } from 'react-icons/fa';

const ResumenProductos = ({ cajaId }) => {
  const [resumen, setResumen] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchResumen = async () => {
      try {
        setLoading(true);
        const response = await getResumenProductos(cajaId);
        setResumen(response.data);
      } catch (error) {
        console.error('Error al obtener el resumen de productos:', error);
      } finally {
        setLoading(false);
      }
    };

    if (cajaId) {
      fetchResumen();
    }
  }, [cajaId]);

  if (loading) {
    return <div className="loading">Cargando productos...</div>;
  }

  if (!resumen) {
    return <div className="no-data">No hay datos de productos</div>;
  }

  return (
    <div className="resumen-productos">
      <h3><FaBox /> Resumen de Productos Vendidos</h3>
      <div className="resumen-totales">
        <span><strong>Total Productos Vendidos:</strong> {resumen.totalProductosVendidos}</span>
        <span><strong>Total Ventas:</strong>    {resumen.totalVentas.toFixed(2)}</span>
      </div>

      <div className="productos-list">
        {resumen.detallesProductos.map(prod => (
          <div key={prod.idProducto} className="producto-item">
            <div className="producto-info">
              <span className="producto-nombre">{prod.descripcionProducto}</span>
              <span className="producto-cantidad">{prod.totalCantidad} unidades</span>
            </div>
            <div className="producto-total">Bs. {prod.totalVenta.toFixed(2)}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ResumenProductos;
