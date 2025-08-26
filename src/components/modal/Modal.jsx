import React from "react";
import PropTypes from "prop-types";
import "./Modal.css";

const Modal = ({ 
  isOpen, 
  onClose, 
  children, 
  closeOnOverlayClick = true,
  title,
  size = 'md' // Nueva prop para tamaños
}) => {
  if (!isOpen) return null;

  const handleOverlayClick = (e) => {
    if (closeOnOverlayClick && e.target.classList.contains("modal-overlay")) {
      onClose();
    }
  };

  // Clases CSS basadas en el tamaño
  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-2xl',
    lg: 'max-w-4xl',
    xl: 'max-w-6xl'
  };

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className={`modal-container ${sizeClasses[size]}`}>
        <div className="modal-header">
          {title && <h2 className="modal-title">{title}</h2>}
          <button className="modal-close" onClick={onClose}>
            &times;
          </button>
        </div>
        <div className="modal-content-wrapper">
          {children}
        </div>
      </div>
    </div>
  );
};

Modal.propTypes = {
  isOpen: PropTypes.bool.isRequired, 
  children: PropTypes.node.isRequired,
  onClose: PropTypes.func.isRequired,
  closeOnOverlayClick: PropTypes.bool,
  title: PropTypes.string, // Nueva prop para el título
  size: PropTypes.oneOf(['sm', 'md', 'lg', 'xl']) // Nueva prop para tamaños
};

Modal.defaultProps = {
  closeOnOverlayClick: true,
  size: 'md'
};

export default Modal;