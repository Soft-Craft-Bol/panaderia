import React, { useState, useEffect } from 'react';
import { getUsers } from '../../service/api';
import './Horarios.css';
import ItemHorario from "../../components/horarioItem/itemHorario";

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

    const handleAddPanadero = () => {
        if (newPanadero.trim() === "") return;
        setHorarios([...horarios, newPanadero]);
        handleCloseModal();
    };

    const handleCloseModal = () => {
        setShowModal(false);
    };

    const handleOpenModal = () => {
        setShowModal(true);
    };

    return (
        <div className="horarios-contenedor">
            <h1>Asignación de horarios</h1>
            <button className="btn-general" onClick={handleOpenModal}>
                (+) Agregar nuevo
            </button>
            <table>
                <thead>
                    <tr>
                        <th>Nombre del Panadero</th>
                        <th>Hora entrada</th>
                        <th>Hora Salida</th>
                        <th>Días con este horario</th>
                    </tr>
                </thead>
                {horarios.map((nombre, index) => (
                        <ItemHorario key={index} nombre={nombre} />
                ))}
            </table>
            
            {/* Modal */}
            {showModal && (
                <div className="modalHorario">
                    <div className="modalHorario-content">
                        <h2>Seleccione el nombre del panadero</h2>
                        <select 
                            value={newPanadero} 
                            onChange={(e) => setNewPanadero(e.target.value)}
                        >
                            <option value="" disabled>Seleccione un panadero</option>
                            {users.map(user => (
                                user.roles.includes('PANADERO') && (
                                    <option key={user.id} value={user.fullName}>
                                        {user.fullName}
                                    </option>
                                )
                            ))}
                        </select>
                        <div className="modalHorario-buttons">
                            <button onClick={handleAddPanadero}>OK</button>
                            <button onClick={handleCloseModal}>Cancelar</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Horarios;