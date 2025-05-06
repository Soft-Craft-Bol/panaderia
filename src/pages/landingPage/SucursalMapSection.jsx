import React from 'react';
import MapComponent from '../../components/map/MapComponent';
import { useSucursales } from '../../hooks/useSucursales';
import './Sucursal.css'

const SucursalMapSection = () => {
    const { data, isLoading, isError } = useSucursales();
    const sucursales = data || [];
  
    if (isLoading) return <p>Cargando sucursales...</p>;
    if (isError) return <p>Error al cargar las sucursales.</p>;
  
    return (
      <section className="location-section">
        <div className="section-container">
          <h2 className="section-title">Nuestras Sucursales</h2>
          <p className="section-subtitle">
            Descubre dónde estamos ubicados y visítanos en el horario de atención
          </p>
  
          <div className="location-grid">
            {sucursales.map((sucursal) => (
              <div key={sucursal.id} className="map-container">
                <MapComponent
                  coordinates={[sucursal.latitud, sucursal.longitud]}
                  zoom={16}
                  direccion={sucursal.direccion}
                  img={sucursal.image}
                />
                <div className="location-info">
                  <h3>{sucursal.nombre}</h3>
                  <p>{sucursal.direccion}</p>
                  <p>Teléfono: {sucursal.telefono}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  };    
export default SucursalMapSection;
