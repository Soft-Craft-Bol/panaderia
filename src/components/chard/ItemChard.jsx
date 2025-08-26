import React, { useEffect, useState, useMemo } from 'react';
import { useTheme } from '../../hooks/useTheme';
import './Chard.css';
import { getItemsLimited } from '../../service/api';

const ItemChard = () => {
  const { theme } = useTheme();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const columns = useMemo(() => [
    { header: 'Id', accessor: 'id' },
    { header: 'Descripción', accessor: 'descripcion' },
    { header: 'Unidad de Medida', accessor: 'unidadMedida' },
    { header: 'Precio Unitario', accessor: 'precioUnitario' },
    { header: 'Código Producto', accessor: 'codigoProductoSin' }
  ], []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getItemsLimited();
        console.log('getItemsLimited response:', response);
        if (Array.isArray(response?.data)) {
          setData(response.data);
        } else {
          throw new Error('Datos no son un array');
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Error al cargar los productos');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div className="loading-table">Cargando productos...</div>;
  if (error) return <div className="error-table">{error}</div>;

  return (
    <div className={`table-container ${theme}`}>
      <div className="table-responsive">
        <table className="custom-table">
          <thead>
            <tr>
              {columns.map((col) => (
                <th key={col.accessor}>{col.header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((item, index) => (
              <tr key={index}>
                {columns.map((col) => (
                  <td key={`${index}-${col.accessor}`} data-label={col.header}>
                    {col.accessor === 'precioUnitario'
                      ? `Bs ${parseFloat(item[col.accessor]).toFixed(2)}`
                      : item[col.accessor] || '-'}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default React.memo(ItemChard);