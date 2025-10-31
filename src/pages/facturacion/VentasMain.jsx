import React, { useState } from 'react';
import { Tabs, Tab } from '../../components/tabs/Tabs'; 
import { FaShoppingCart, FaFileInvoiceDollar, FaFileAlt } from 'react-icons/fa';
import './VentasMain.css';
import ListVentas from './ListVentas';
import VentasConFacturaPanel from './VentasConFacturaPanel';
import VentasSinFacturaPanel from './VentasSinFacturaPanel';
import ExploradorArchivos from '../archivos/ExploradorArchivos';
import VentasPorFacturar from './VentasPorFacturar';

const VentasMain = () => {
  const [activeTab, setActiveTab] = useState('hoy');

  return (
    <div className="ventas-main-container">
      <div className="ventas-header">
        <h1>📊 Gestión de Ventas</h1>
        
        <Tabs activeTab={activeTab} onChange={setActiveTab}>
          <Tab 
            label={
              <span className="tab-label">
                <FaShoppingCart className="tab-icon" /> Ventas del Día
              </span>
            } 
            value="hoy"
          >
            <ListVentas />
          </Tab>

          <Tab 
            label={
              <span className="tab-label">
                <FaFileInvoiceDollar className="tab-icon" /> Ventas Facturadas
              </span>
            } 
            value="factura"
          >
            <VentasConFacturaPanel />
          </Tab>

          <Tab 
            label={
              <span className="tab-label">
                <FaFileAlt className="tab-icon" /> Ventas sin Factura
              </span>
            } 
            value="sin-factura"
          >
            <VentasSinFacturaPanel />
          </Tab>
          <Tab 
            label={
              <span className="tab-label">
                <FaFileAlt className="tab-icon" /> Archivos de Facturacion
              </span>
            } 
            value="archivos"
          >
            <ExploradorArchivos />
          </Tab>
          <Tab 
            label={
              <span className="tab-label">
                <FaFileAlt className="tab-icon" /> Ventas por Facturar
              </span>
            } 
            value="por-facturar"
          >
            <VentasPorFacturar />
          </Tab>
        </Tabs>
      </div>
    </div>
  );
};

export default VentasMain;