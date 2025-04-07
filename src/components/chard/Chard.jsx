import React, { useEffect, useState, useMemo } from 'react';
import { useTheme } from '../../hooks/useTheme'; // Asumiendo que tienes un hook de tema
import './Chard.css';
import { getClientLimited } from '../../service/api';

const Chard = () => {
  const { theme } = useTheme();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Configuración de columnas memoizada
  const columns = useMemo(() => [
    { header: 'Id', accessor: 'id' },
    { header: 'Nombre/Razón Social', accessor: 'nombreRazonSocial' },
    { header: 'Tipo Documento', accessor: 'codigoTipoDocumentoIdentidad' },
    { header: 'Número Documento', accessor: 'numeroDocumento' },
    { header: 'Complemento', accessor: 'complemento' },
    { header: 'Código Cliente', accessor: 'codigoCliente' },
    { header: 'Email', accessor: 'email' }
  ], []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getClientLimited();
        if (Array.isArray(response?.data)) {
          setData(response.data);
        } else {
          throw new Error('Datos no son un array');
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Error al cargar los datos');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div className="loading-table">Cargando clientes...</div>;
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
                    {item[col.accessor] || '-'}
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

export default React.memo(Chard);