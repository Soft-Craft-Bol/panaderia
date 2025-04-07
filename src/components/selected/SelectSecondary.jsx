import React from 'react';
import { useField } from 'formik';

function SelectSecondary({ label, children, error, ...props }) {
  return (
    <div className="input-component">
      <label htmlFor={props.id || props.name}>
        {label}
        {props.required && <span className="required">*</span>}
      </label>
      <div className="input-wrapper">
        <select className="text-input" {...props}>
          {children}
        </select>
      </div>
      {error && <div className="error-message">{error}</div>}
    </div>
  );
}

export default SelectSecondary;