import React, { useState } from "react";
import './ModalConfirm.css';

const ModalConfirm = ({ showModal, handleCloseModal, confirmarAccion }) => {
    return (
        <div className="confirm-modal">
            {showModal && (
                <div className="modalConf">
                    <div className="modalConf-content">
                        <h2>¿Estás seguro de realizar esta acción?</h2>
                        <div className="modalConf-buttons">
                            <button onClick={confirmarAccion}>Si</button>
                            <button onClick={handleCloseModal}>Cancelar</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ModalConfirm;