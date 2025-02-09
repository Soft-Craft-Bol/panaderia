import React, { useState } from "react";
import "./Horarios.css";
import ItemHorario from "../../components/horarioItem/itemHorario";

const Horarios = () => {
    const [showModal, setShowModal] = useState(false); // Estado para mostrar/ocultar el modal
    const [newPanadero, setNewPanadero] = useState(""); // Estado para el nuevo nombre del panadero
    const [horarios, setHorarios] = useState([]); // Lista de panaderos

    const handleOpenModal = () => {
        setShowModal(true);
    };
    const handleCloseModal = () => {
        setShowModal(false);
        setNewPanadero("");
    };

    const handleAddPanadero = () => {
        if (newPanadero.trim() === "") return; // No agregar si el campo está vacío
        setHorarios([...horarios, newPanadero]);
        handleCloseModal();
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
                        <h2>Ingrese el nombre del panadero</h2>
                        <input 
                            type="text" 
                            value={newPanadero} 
                            onChange={(e) => setNewPanadero(e.target.value)} 
                            placeholder="Ej. Juan Pérez"
                        />
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
