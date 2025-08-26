import React, { useState } from 'react';
import { Tabs, Tab } from '../../components/tabs/Tabs'; 
import ListaRecetas from './ListaRecetas';
import RecetasTable from './RecetasTable';
import './RecetaMain.css';
import BackButton from '../../components/buttons/BackButton';

const RecetasMain = () => {
  const [activeTab, setActiveTab] = useState('productos');
  return (
    <div className="recetas-main-container">
    
      <BackButton position="lefth" to="/productos" />

      <div className="recetas-header">
        <h1>Gestión de Recetas</h1>
        
        <Tabs activeTab={activeTab} onChange={setActiveTab}>
          <Tab label="Por Productos" value="productos">
            <ListaRecetas />
          </Tab>
          <Tab label="Todas las Recetas" value="recetas">
            <RecetasTable />
          </Tab>
        </Tabs>
      </div>
    </div>
  );
};

export default RecetasMain;