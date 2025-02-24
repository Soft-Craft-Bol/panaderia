import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const MapComponent = ({ coordinates, zoom, id, direccion }) => {
  const mapRef = useRef(null); 

  useEffect(() => {
    if (mapRef.current && !mapRef.current._leaflet_map) {
      const map = L.map(mapRef.current).setView(coordinates, zoom);
  
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(map);
  
      L.marker(coordinates).addTo(map)
        .bindPopup(direccion)
        .openPopup();
  
      mapRef.current._leaflet_map = map;
    }
    return () => {
      if (mapRef.current && mapRef.current._leaflet_map) {
        mapRef.current._leaflet_map.remove(); 
        mapRef.current._leaflet_map = null;
      }
    };
  }, [coordinates, zoom, id]);
  return <div id={id} ref={mapRef} style={{ height: '400px', width: '100%' }}></div>;
};
export default MapComponent;