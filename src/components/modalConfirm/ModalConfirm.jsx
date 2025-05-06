import React from "react";
import './ModalConfirm.css';

const ModalConfirm = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  confirmText = "Confirmar", 
  cancelText = "Cancelar",
  danger = false
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modalConf">
        <div className="modalConf-content">
          <h2>{title}</h2>
          <p>{message}</p>
          <div className="modalConf-buttons">
            <button 
              className={danger ? "btn-danger" : "btn-confirm"}
              onClick={onConfirm}
            >
              {confirmText}
            </button>
            <button 
              className="btn-cancel"
              onClick={onClose}
            >
              {cancelText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ModalConfirm;