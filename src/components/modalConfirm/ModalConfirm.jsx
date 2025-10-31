import React from "react";
import './ModalConfirm.css';
import { Button } from "../buttons/Button";

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
    <div className="modal-overlayConf" onClick={onClose}>
      <div className="modalConf" onClick={(e) => e.stopPropagation()}>
        <div className="modalConf-content">
          {title && <h2 className="modalConf-title">{title}</h2>}
          {message && <p className="modalConf-message">{message}</p>}
          <div className="modalConf-buttons">
            <Button
              variant="success"
              onClick={onConfirm}
            >
              {confirmText}
            </Button>
            <Button
              variant="danger"
              onClick={onClose}
            >
              {cancelText}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ModalConfirm;