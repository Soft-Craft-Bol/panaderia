import "./InputText.css";

function InputFacturacion({ label, required, type = "text", formik, ...props }) {
  // Usamos las props directamente en lugar de useField
  const { name } = props;
  const error = formik.touched[name] && formik.errors[name];

  return (
    <div className="input-component">
      <label htmlFor={props.id || props.name}>
        {label}
        {required && <span className="required">*</span>}
      </label>
      <div className="input-wrapper">
        <input
          className="text-input"
          name={name}
          type={type}
          value={formik.values[name]}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          {...props}
        />
      </div>
      {error && <div className="error-message">{error}</div>}
    </div>
  );
}

export default InputFacturacion;