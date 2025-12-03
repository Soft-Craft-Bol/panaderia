import React from "react";
import { useField } from "formik";
import "./TextArea.css";

const TextArea = ({ label, required, formik = true, rows = 3, ...props }) => {
  let field = {};
  let meta = {};

  if (formik) {
    [field, meta] = useField(props);
  }

  return (
    <div className="textarea-component">
      <label htmlFor={props.id || props.name}>
        {label}
        {required && <span className="required">*</span>}
      </label>

      <textarea
        className="text-area"
        {...(formik ? field : {})}
        {...props}
        rows={rows}
      />

      {formik && meta.touched && meta.error ? (
        <div className="error-message">{meta.error}</div>
      ) : null}
    </div>
  );
};

export default TextArea;
