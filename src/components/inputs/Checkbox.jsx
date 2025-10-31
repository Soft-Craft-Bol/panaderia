import React from 'react';
import './Checkbox.css';

const Checkbox = ({ name, label, checked, onChange, className = '' }) => {
  const handleChange = (e) => {
    onChange(e);
  };

  return (
    <label className={`checkbox-container ${className}`}>
      <input
        type="checkbox"
        name={name}
        checked={checked}
        onChange={handleChange}
        className="checkbox-input"
      />
      <span className="checkbox-checkmark"></span>
      {label && <span className="checkbox-label">{label}</span>}
    </label>
  );
};

export default Checkbox;