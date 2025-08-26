import React from 'react';
import './ToggleSwitch.css';

const ToggleSwitch = ({ label, checked = false, onChange, disabled = false }) => {
  // Asegurar que checked siempre tenga un valor booleano
  const isChecked = Boolean(checked);
  
  const handleChange = (event) => {
    if (onChange) {
      onChange(event.target.checked);
    }
  };

  return (
    <div className="toggle-switch-container">
      {label && <span className="toggle-label">{label}</span>}
      <label className="toggle-switch">
        <input
          type="checkbox"
          checked={isChecked}
          onChange={handleChange}
          disabled={disabled}
        />
        <span className="slider round"></span>
      </label>
    </div>
  );
};

export default ToggleSwitch;