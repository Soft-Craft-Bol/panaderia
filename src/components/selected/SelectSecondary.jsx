import React from 'react';
import { useField } from 'formik';
import './SelectSecondary.css';

function SelectSecondary({ label, children, formikCompatible = true, ...props }) {
  let field = {
    value: props.value,
    onChange: props.onChange,
    onBlur: props.onBlur,
    name: props.name
  };
  
  let meta = {
    touched: false,
    error: props.error || null
  };

  if (formikCompatible) {
    try {
      const [formikField, formikMeta] = useField(props);
      field = formikField;
      meta = formikMeta;
    } catch (e) {
      console.debug('SelectSecondary no está dentro de Formik, usando props normales');
    }
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
          onChange={(e) => {
            field.onChange && field.onChange(e);
            props.onChange && props.onChange(e);
          }}
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