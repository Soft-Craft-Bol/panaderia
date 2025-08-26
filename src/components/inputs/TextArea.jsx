import { useField } from "formik";
import "./TextArea.css";

const TextArea = ({ label, required, rows = 3, ...props }) => {
  const [field, meta] = useField(props);

  return (
    <div className="textarea-component">
      <label htmlFor={props.id || props.name}>
        {label}
        {required && <span className="required">*</span>}
      </label>
      <textarea
        className="text-area"
        {...field}
        {...props}
        rows={rows}
      />
      {meta.touched && meta.error ? (
        <div className="error-message">{meta.error}</div>
      ) : null}
    </div>
  );
};

export default TextArea;
