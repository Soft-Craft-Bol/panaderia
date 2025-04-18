import React, { useState } from "react";
import { useField } from "formik";
import "./InputText.css";
import { FaEye, FaEyeSlash } from "react-icons/fa"; 

function InputText({ label, required, type = "text", ...props }) {
  const [field, meta] = useField(props);
  const [showPassword, setShowPassword] = useState(false);

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  // Eliminamos el prop 'formik' antes de pasarlo al input
  const inputProps = { ...props };
  delete inputProps.formik;

  return (
    <div className="input-component">
      <label htmlFor={props.id || props.name}>
        {label}
        {required && <span className="required">*</span>}
      </label>
      <div className="input-wrapper">
        <input
          className="text-input"
          {...field}
          {...inputProps}  // Usamos inputProps en lugar de props directamente
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
      {meta.touched && meta.error ? (
        <div className="error-message">{meta.error}</div>
      ) : null}
    </div>
  );
}

export default InputText;