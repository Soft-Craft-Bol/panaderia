import React from 'react';
import { useField } from 'formik';
import './SelectPrimary.css';

function SelectPrimary({ label, required, ...props }) {
  const [field, meta] = useField(props);
  return (
    <div className="select-component">
      <label htmlFor={props.id || props.name}>
        {label}
        {required && <span className="required">*</span>}
      </label>
      <select className="select-input" {...field} {...props} />
      {meta.touched && meta.error ? (
        <div className="error-message">{meta.error}</div>
      ) : null}
    </div>
  );
}

export default SelectPrimary;
