import React from "react";
import './ModalConfirm.css';

const ModalConfirm = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  confirmText = "Confirm", 
  cancelText = "Cancel",
  danger = false
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay-conf" onClick={onClose}>
      <div className="modal-conf" onClick={(e) => e.stopPropagation()}>
        <div className="modal-conf-content">
          {title && <h2 className="modal-conf-title">{title}</h2>}
          {message && <p className="modal-conf-message">{message}</p>}
          <div className="modal-conf-buttons">
            <button 
              className={`modal-conf-button ${danger ? "modal-conf-button-danger" : "modal-conf-button-primary"}`}
              onClick={onConfirm}
            >
              {confirmText}
            </button>
            <button 
              className="modal-conf-button modal-conf-button-cancel"
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