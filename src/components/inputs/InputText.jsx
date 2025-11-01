import React, { useState } from "react";
import { useField } from "formik";
import "./InputText.css";
import { FaEye, FaEyeSlash } from "react-icons/fa";

function InputText({ label, required, type = "text", formik = true, ...props }) {
  const [showPassword, setShowPassword] = useState(false);

  let field = {};
  let meta = {};

  if (formik) {
    [field, meta] = useField(props);
  }

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="input-component">
      <label htmlFor={props.id || props.name}>
        {label}
        {required && <span className="required">*</span>}
      </label>
      <div className="input-wrapper">
        <input
          className="text-input"
          {...(formik ? field : {})}
          {...props}
          type={showPassword ? "text" : type}
        />
        {type === "password" && (
          <button
            type="button"
            className="toggle-password-btn"
            onClick={toggleShowPassword}
            aria-label="Toggle password visibility"
          >
            {showPassword ? <FaEye /> : <FaEyeSlash />}
          </button>
        )}
      </div>
      {formik && meta.touched && meta.error ? (
        <div className="error-message">{meta.error}</div>
      ) : null}
    </div>
  );
}

export default InputText;
 