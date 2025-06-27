import React from 'react';
import { useField } from 'formik';
import './SelectSecondary.css'; 

function SelectSecondary({ label, children, error, ...props }) {
  // Intenta usar useField solo si estamos dentro de un Formik
  let field = {};
  let meta = {};
  
  try {
    // Esto lanzará un error si no estamos dentro de Formik
    [field, meta] = useField(props);
  } catch (e) {
    // Si no estamos en Formik, usamos props directamente
    field = {
      value: props.value,
      onChange: props.onChange,
      onBlur: props.onBlur,
      name: props.name
    };
    meta = {
      touched: false,
      error: error || null
    };
  }
  
  return (
    <div className="input-component">
      {label && (
        <label htmlFor={props.id || props.name}>
          {label}
          {props.required && <span className="required">*</span>}
        </label>
      )}
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