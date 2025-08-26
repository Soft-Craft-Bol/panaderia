import React, { useState } from 'react';
import { Tabs, Tab } from '../../components/tabs/Tabs';
import { FaUsers, FaStar, FaEnvelope } from 'react-icons/fa';
import ListClient from '../users/ListClient';
import './Clientes.css';
import TopClientsTable from './TopClients';
import ContactosTable from './ContactoTable';

const Clientes = () => {
  const [activeTab, setActiveTab] = useState('todos');

  return (
    <main className="main-client">
      <h1>Clientes</h1>
      <div className="main-cont-client">
        <Tabs activeTab={activeTab} onChange={setActiveTab}>
          <Tab label="Todos los Clientes" value="todos" icon={FaUsers}>
            <ListClient />
          </Tab>
          <Tab label="Clientes Frecuentes" value="frecuentes" icon={FaStar}>
            <TopClientsTable />
          </Tab>
          <Tab label="Contactos" value="contactos" icon={FaEnvelope}>
            <ContactosTable />
          </Tab>
        </Tabs>
      </div>
    </main>
  );
};

export default Clientes;
