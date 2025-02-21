import React, { useState, useEffect } from 'react';
import { getUsers } from '../../service/api';
import './Horarios.css';
import ItemHorario from "../../components/horarioItem/itemHorario";
import TablaHorarios from '../../components/tablaHorarios/TablaHorarios';
import Modal from '../../components/modal/Modal';
const Horarios = () => {
    const [showModal, setShowModal] = useState(false);
    const [newPanadero, setNewPanadero] = useState('');
    const [users, setUsers] = useState([]);
    const [horarios, setHorarios] = useState([]);

        useEffect(() => {
            const fetchUsers = async () => {
                try {
                    const response = await getUsers();
                    const usersWithFullName = response.data.map(user => ({
                        ...user,
                        fullName: `${user.firstName} ${user.lastName}`
                    }));
                    setUsers(usersWithFullName);
                } catch (error) {
                    console.error('Error fetching users:', error);
                }
            };

            fetchUsers();
        }, []);
    const handleCloseModal = () => {
        setShowModal(false);
    };

    const handleOpenModal = () => {
        setShowModal(true);
    };

    return (
        <div className="horarios-contenedor">
            <div>
                <h1>Asignación de horarios</h1>
                <button className="btn-general" onClick={handleOpenModal}>
                    (+) Agregar nuevo
                </button>
            </div>
            <div>
                <TablaHorarios />
            </div>
            <Modal isOpen={showModal} onClose={handleCloseModal}>
                <ItemHorario onClose={handleCloseModal} />
            </Modal>
        </div>
    );
};

export default Horarios;