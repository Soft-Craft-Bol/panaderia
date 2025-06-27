import { GoogleMap, LoadScript, Marker, InfoWindow } from '@react-google-maps/api';
import { useState } from 'react';


const MapComponent = ({ coordinates, direccion, zoom = 20, img }) => {
  const containerStyle = {
    width: '100%',
    height: '400px',
    borderRadius: '16px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
    overflow: 'hidden'
  };

  const [showInfo, setShowInfo] = useState(true);

  return (
    <LoadScript googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={{ lat: coordinates[0], lng: coordinates[1] }}
        zoom={zoom}
      >
        <Marker
          position={{ lat: coordinates[0], lng: coordinates[1] }}
          onClick={() => setShowInfo(true)}
        />

        {showInfo && (
          <InfoWindow
            position={{ lat: coordinates[0], lng: coordinates[1] }}
            onCloseClick={() => setShowInfo(false)}
          >
            <div
              style={{
                maxWidth: '160px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                padding: '0',
                fontFamily: 'Arial, sans-serif',
                color: '#333',
              }}
            >
              <img
                src={img}
                alt={direccion}
                style={{
                  width: '160px',
                  height: '80px',
                  objectFit: 'cover',
                  borderRadius: '5px',
                  marginBottom: '2px',
                  boxShadow: '0 2px 6px rgba(0, 0, 0, 0.2)',
                }}
              />
              <div style={{ textAlign: 'center' }}>
                <strong style={{ fontSize: '15px', display: 'block', marginBottom: '4px' }}>Dirección</strong>
                <span style={{ fontSize: '13px' }}>{direccion}</span>
              </div>
            </div>
          </InfoWindow>
        )}


      </GoogleMap>
    </LoadScript>
  );
};

export default MapComponent;
