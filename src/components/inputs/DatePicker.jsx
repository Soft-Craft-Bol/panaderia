import 'react-datepicker/dist/react-datepicker.css';
import DatePicker from 'react-datepicker';
import { registerLocale } from 'react-datepicker';
import es from 'date-fns/locale/es';
import './DatePicker.css';

registerLocale('es', es);

const CustomDatePicker = ({
  label,
  selected,
  onChange,
  minDate,
  maxDate,
  placeholderText = 'Seleccione una fecha',
  isClearable = true,
  ...props
}) => {
  return (
    <div className="date-picker-container">
      {label && <label className="date-picker-label">{label}</label>}
      <DatePicker
        selected={selected}
        onChange={onChange}
        locale="es"
        dateFormat="dd/MM/yyyy"
        placeholderText={placeholderText}
        className="date-picker-input"
        minDate={minDate}
        maxDate={maxDate}
        isClearable={isClearable}
        clearButtonClassName="date-picker-clear"
        {...props}
      />
    </div>
  );
};

export default CustomDatePicker;