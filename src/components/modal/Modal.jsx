import React, { memo } from 'react';
import { Button } from '../buttons/Button';
import { IoCloseSharp } from '../../hooks/icons';
import './Modal.css';

const Modal = memo(({ isOpen, onClose, children, theme = 'light' }) => {
  if (!isOpen) return null;

  return (
    <div className={`modal-overlay ${theme}`}>
      <div className={`modal-content ${theme}`}>
        <Button 
          variant="secondary" 
          theme={theme} 
          onClick={onClose} 
          className="close-btn"
        > 
          <IoCloseSharp/>
        </Button>
        {children}
      </div>
    </div>
  );
});

export default Modal;