import { useState, useEffect } from 'react';
import { getCajaById } from '../../service/api';
import ResumenProductos from './ResumenProductos';
import Modal from '../../components/modal/Modal';
import './CajaDetailsModal.css';

const CajaDetail = ({ cajaId, isOpen, onClose }) => {
  const [cajaData, setCajaData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('resumen');

  useEffect(() => {
    const fetchCajaDetails = async () => {
      if (!isOpen || !cajaId) return;
      try {
        setLoading(true);
        const response = await getCajaById(cajaId);
        setCajaData(response.data);
      } catch (error) {
        console.error('Error al obtener detalles de la caja:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCajaDetails();
  }, [cajaId, isOpen]);

  const handleClose = () => {
    setActiveTab('resumen');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={cajaData ? `Detalles de Caja - ${cajaData.nombre}` : 'Detalles de Caja'}
      size="xl"
      closeOnOverlayClick={true}
    >
      <div className="caja-detail-content">
        {loading ? (
          <div className="caja-details-loading">
            Cargando detalles de la caja...
          </div>
        ) : !cajaData ? (
          <div className="caja-details-error">
            No se pudieron cargar los datos de la caja
          </div>
        ) : (
          <>
            {/* Información básica */}
            <div className="caja-info-section">
              <h3>Información General</h3>
              <div className="caja-info-grid">
                <div className="caja-info-item">
                  <label>Estado:</label>
                  <span className={`estado-badge estado-${cajaData.estado.toLowerCase()}`}>
                    {cajaData.estado}
                  </span>
                </div>
                <div className="caja-info-item">
                  <label>Turno:</label>
                  <span>{cajaData.turno}</span>
                </div>
                <div className="caja-info-item">
                  <label>Monto Inicial:</label>
                  <span>Bs. {cajaData.montoInicial}</span>
                </div>
                <div className="caja-info-item">
                  <label>Sucursal:</label>
                  <span>{cajaData.sucursal}</span>
                </div>
                <div className="caja-info-item">
                  <label>Usuario Apertura:</label>
                  <span>{cajaData.usuarioApertura}</span>
                </div>
                <div className="caja-info-item">
                  <label>Fecha Apertura:</label>
                  <span>{new Date(cajaData.fechaApertura).toLocaleString()}</span>
                </div>
                {cajaData.fechaCierre && (
                  <>
                    <div className="caja-info-item">
                      <label>Usuario Cierre:</label>
                      <span>{cajaData.usuarioCierre}</span>
                    </div>
                    <div className="caja-info-item">
                      <label>Fecha Cierre:</label>
                      <span>{new Date(cajaData.fechaCierre).toLocaleString()}</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Tabs para navegación */}
            <div className="caja-details-tabs">
              <button 
                className={`caja-tab ${activeTab === 'resumen' ? 'caja-tab-active' : ''}`}
                onClick={() => setActiveTab('resumen')}
              >
                Resumen Productos
              </button>
              <button 
                className={`caja-tab ${activeTab === 'cierre' ? 'caja-tab-active' : ''}`}
                onClick={() => setActiveTab('cierre')}
              >
                Cierre de Caja
              </button>
              <button 
                className={`caja-tab ${activeTab === 'stock' ? 'caja-tab-active' : ''}`}
                onClick={() => setActiveTab('stock')}
              >
                Stock
              </button>
            </div>

            {/* Contenido de los tabs */}
            <div className="caja-tab-content">
              {activeTab === 'resumen' && (
                <ResumenProductos cajaId={cajaId} />
              )}

              {activeTab === 'cierre' && cajaData.cierre && (
                <div className="cierre-section">
                  <h3>Detalles del Cierre</h3>
                  <div className="cierre-grid">
                    <div className="cierre-item">
                      <label>Efectivo Contado:</label>
                      <span>Bs. {cajaData.cierre.efectivoContado}</span>
                    </div>
                    <div className="cierre-item">
                      <label>Tarjeta Contado:</label>
                      <span>Bs. {cajaData.cierre.tarjetaContado}</span>
                    </div>
                    <div className="cierre-item">
                      <label>QR Contado:</label>
                      <span>Bs. {cajaData.cierre.qrContado}</span>
                    </div>
                    <div className="cierre-item">
                      <label>Total Ventas:</label>
                      <span>Bs. {cajaData.cierre.totalVentas}</span>
                    </div>
                    <div className="cierre-item">
                      <label>Total Gastos:</label>
                      <span>Bs. {cajaData.cierre.totalGastos}</span>
                    </div>
                    <div className="cierre-item">
                      <label>Diferencia:</label>
                      <span className={`diferencia-badge ${cajaData.cierre.diferencia >= 0 ? 'diferencia-positiva' : 'diferencia-negativa'}`}>
                        Bs. {cajaData.cierre.diferencia}
                      </span>
                    </div>
                  </div>
                  
                  {cajaData.cierre.observaciones && (
                    <div className="cierre-observaciones">
                      <label>Observaciones:</label>
                      <p>{cajaData.cierre.observaciones}</p>
                    </div>
                  )}

                  {/* Detalles de métodos de pago */}
                  {cajaData.cierre.detalles && cajaData.cierre.detalles.length > 0 && (
                    <div className="metodos-pago-section">
                      <h4>Métodos de Pago</h4>
                      <div className="metodos-pago-grid">
                        {cajaData.cierre.detalles.map((detalle, index) => (
                          <div key={index} className="metodo-pago-item">
                            <span className="metodo-nombre">{detalle.metodoPago}</span>
                            <span className="metodo-monto">Bs. {detalle.montoSinFactura}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'stock' && (
                <div className="stock-section">
                  <div className="stock-comparison">
                    <div className="stock-inicial">
                      <h4>Stock Inicial</h4>
                      {cajaData.productos && cajaData.productos.map(producto => (
                        <div key={producto.id} className="stock-item">
                          <span className="producto-nombre">{producto.descripcion}</span>
                          <span className="stock-cantidad">{producto.cantidadDisponible} unidades</span>
                        </div>
                      ))}
                    </div>
                    
                    <div className="stock-final">
                      <h4>Stock Final</h4>
                      {cajaData.stock_final && cajaData.stock_final.map(stock => (
                        <div key={stock.id} className="stock-item">
                          <span className="producto-nombre">{stock.descripcion}</span>
                          <span className="stock-cantidad">{stock.cantidadDisponible} unidades</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </Modal>
  );
};

export default CajaDetail;