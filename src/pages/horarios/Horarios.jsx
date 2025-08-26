import React, { useState } from 'react';
import './Horarios.css';
import ItemHorario from "../../components/horarioItem/itemHorario";
import TablaHorarios from '../../components/tablaHorarios/TablaHorarios';
import Modal from '../../components/modal/Modal';
import BackButton from '../../components/buttons/BackButton';
import { Button } from '../../components/buttons/Button';

const Horarios = () => {
    const [showModal, setShowModal] = useState(false);
    const [refreshTable, setRefreshTable] = useState(false);

    const handleCloseModal = () => {
        setShowModal(false);
    };

    const handleOpenModal = () => {
        setShowModal(true);
    };

    const handleRefreshTable = () => {
        setRefreshTable(prev => !prev); 
    };

    return (
        <div className="horarios-contenedor">
            <div>
                <BackButton to={"/users"} position='lefth' className='pos'/>

                <h1>Asignación de horarios</h1>
                <Button onClick={handleOpenModal}>
                    (+) Agregar nuevo
                </Button>
            </div>
            <div>
                <TablaHorarios refreshTrigger={refreshTable} />
            </div>
            <Modal isOpen={showModal} onClose={handleCloseModal}>
                <ItemHorario 
                    onClose={handleCloseModal}
                    onSuccess={handleRefreshTable} // Pasamos la función de callback
                />
            </Modal>
        </div>
    );
};

export default Horarios;