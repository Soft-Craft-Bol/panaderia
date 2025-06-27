import React from 'react';
import './Alert.css';

const Alert = ({ type = 'info', title, children, onClose }) => {
  return (
    <div className={`alert alert-${type}`}>
      <div className="alert-header">
        <h4>{title}</h4>
        {onClose && (
          <button className="alert-close" onClick={onClose}>
            &times;
          </button>
        )}
      </div>
      <div className="alert-content">
        {children}
      </div>
    </div>
  );
};

export default Alert;