import React, { useState } from 'react';
import { Tabs, Tab } from '../../components/tabs/Tabs';
import DesapachoTable from './DesapachoTable';
import Despachos from './Despachos';
import { FaIndustry, FaProductHunt } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/buttons/Button';
import './Despachos.css';

const DespachoMain = () => {
  const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('productos');

    return (
        <main className="main-client">
            <h1>Logistica y despachos</h1>
            <div className="button-despachos">
                <Button variant="primary" onClick={() => navigate("/despachos/create")}>
                    Despacho de productos
                </Button>
                <Button variant="primary" onClick={() => navigate("/despachos/create-insumo")}>
                    Despacho de insumos
                </Button>
            </div>
            <div className="main-cont-client">
                <Tabs activeTab={activeTab} onChange={setActiveTab}>
                    <Tab label="Despachos de productos" value="productos" icon={FaProductHunt}>
                        <Despachos />
                    </Tab>
                    <Tab label="Despacho de Insumos" value="insumos" icon={FaIndustry}>
                        <DesapachoTable />
                    </Tab>
                </Tabs>
            </div>
        </main>
    );
};

export default DespachoMain;
