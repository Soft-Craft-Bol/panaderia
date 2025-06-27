import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { topClientes } from '../../service/api';
import './TopClients.css';

const TopClients = () => {
  const { data: response, isLoading, error } = useQuery({
    queryKey: ['top-clientes'],
    queryFn: topClientes,
  });

  // Asegurarnos de que clients sea un array
  const clients = Array.isArray(response) ? response : response?.data || [];

  if (isLoading) {
    return <div className="loading">Cargando clientes destacados...</div>;
  }

  if (error) {
    return <div className="error">Error al cargar clientes: {error.message}</div>;
  }

  // Verificar si hay datos para mostrar
  if (clients.length === 0) {
    return <div className="no-clients">No hay datos de clientes disponibles</div>;
  }

  return (
    <section className="top-clients-section">
      <div className="top-clients-header">
        <h2>Nuestros Clientes Destacados</h2>
        <p>Reconociendo a nuestros clientes más frecuentes y su lealtad</p>
      </div>
      
      <div className="clients-container">
        <div className="clients-grid">
          {clients.map((client, index) => (
            <div key={`${client.id}-${index}`} className="client-card">
              <div className="client-rank">{index + 1}</div>
              <div className="client-info">
                <h3 className="client-name">{client.nombreRazonSocial}</h3>
                <div className="client-stats">
                  <span className="stat-label">Compras:</span>
                  <span className="stat-value">{client.totalCompras}</span>
                </div>
                <div className="progress-bar">
                  <div 
                    className="progress-fill"
                    style={{ 
                      width: `${Math.min(100, (client.totalCompras / clients[0].totalCompras) * 100)}%` 
                    }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TopClients;