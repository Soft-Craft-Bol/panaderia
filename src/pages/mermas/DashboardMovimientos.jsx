import React, { useState } from 'react';
import { Tabs, Tab } from '../../components/tabs/Tabs';
import { Button } from '../../components/buttons/Button';
import ProduccionTable from '../production/ProduccionTable';
import MovimientosTable from './MovimientosTable';
import Modal from '../../components/modal/Modal';
import MermaForm from './MermaForm';
import ProduccionForm from '../production/ProduccionForm';
import BackButton from '../../components/buttons/BackButton';
import { FaIndustry, FaExchangeAlt } from 'react-icons/fa';
import './DashboardMovimientos.css';
import MovimientoInsumosForm from '../movimientoInsumos/MovimientoInsumosForm';

const DashboardMovimientos = () => {
  const [activeTab, setActiveTab] = useState('produccion');
  const [modalOpen, setModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState(null);

  const openModal = (type) => {
    if (type === 'produccion') {
      setModalContent(<ProduccionForm onClose={() => setModalOpen(false)} />);
    } else if (type === 'merma') {
      setModalContent(<MermaForm onClose={() => setModalOpen(false)} />);
    } else if (type === 'otros') {
      setModalContent(<MovimientoInsumosForm onClose={() => setModalOpen(false)} />);
    }
    setModalOpen(true);
  };

  return (
    <div className="dashboard-container">
      <BackButton position="left" to="/productos" />

      <div className="produccion-header">
        <h1>📊 Gestión de Movimientos</h1>
        <div className="dashboard-actions">
          <Button onClick={() => openModal('produccion')} className="btn-general">
            Registrar Producción
          </Button>
          <Button onClick={() => openModal('merma')} className="btn-general">
            Registrar Merma / Donación
          </Button>
          <Button onClick={() => openModal('otros')} className="btn-general">
            Registrar otros Movimientos
          </Button>
        </div>

        <Tabs activeTab={activeTab} onChange={setActiveTab}>
          <Tab label={<><FaIndustry style={{ marginRight: 5 }} />Producción</>} value="produccion">
            <ProduccionTable />
          </Tab>
          <Tab label={<><FaExchangeAlt style={{ marginRight: 5 }} />Mermas / Donaciones</>} value="movimientos">
            <MovimientosTable />
          </Tab>
        </Tabs>
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)}>
        {modalContent}
      </Modal>
    </div>
  );
};

export default DashboardMovimientos;
