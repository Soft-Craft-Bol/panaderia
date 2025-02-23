import { useField } from "formik";
import "./InputText.css";

function InputFacturacion({ label, required, type = "text", formik, ...props }) {
  const [field, meta] = formik ? useField(props) : [{}, {}];

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
          {...props}
          type={type}
        />
      </div>
      {meta.touched && meta.error ? (
        <div className="error-message">{meta.error}</div>
      ) : null}
    </div>
  );
}

export default InputFacturacion;