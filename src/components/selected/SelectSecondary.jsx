import React from 'react';
import { useField } from 'formik';
import './SelectSecondary.css'; 

function SelectSecondary({ label, children, error, ...props }) {
  const [field, meta] = useField(props);
  
  return (
    <div className="input-component">
      <label htmlFor={props.id || props.name}>
        {label}
        {props.required && <span className="required">*</span>}
      </label>
      <div className="input-wrapper">
        <select 
          className="text-input" 
          {...field} 
          {...props}
          value={field.value || ''}
        >
          {children}
        </select>
      </div>
      {meta.touched && meta.error ? (
        <div className="error-message">{meta.error}</div>
      ) : null}
    </div>
  );
}

export default SelectSecondary;