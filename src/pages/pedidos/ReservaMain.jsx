import React, { useState } from 'react';
import { Tabs, Tab } from '../../components/tabs/Tabs';
import { FaUsers, FaStar, FaEnvelope } from 'react-icons/fa';
import ReservasTable from './ReservasTable';
import ReservasDetalleTable from './ReservasDetalleTable';

const ReservaMain = () => {
  const [activeTab, setActiveTab] = useState('todas');

  return (
    <main className="main-client">
      <h1>Reservas</h1>
      <div className="main-cont-client">
        <Tabs activeTab={activeTab} onChange={setActiveTab}>
          <Tab label="Todas las Reservas" value="todas" icon={FaUsers}>
            
            <ReservasDetalleTable />
          </Tab>
          <Tab label="Reservas pendientes" value="pendientes" icon={FaStar}>
            <ReservasTable />
          </Tab>
        </Tabs>
      </div>
    </main>
  );
};

export default ReservaMain;
