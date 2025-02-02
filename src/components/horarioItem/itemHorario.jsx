import { useState } from "react";
import './itemHorario.css';

const ItemHorario= () => {
    const [checkedDays, setCheckedDays] = useState([false, false, false, false, false, false, false]); // Array para los 7 días de la semana

  const handleCheckboxChange = (index) => {
    const newCheckedDays = [...checkedDays]; // Copia de los days
    newCheckedDays[index] = !newCheckedDays[index]; // Invierte el estado del checkbox correspondiente
    setCheckedDays(newCheckedDays); // Actualiza el estado
  };

    return (
        <tbody>
            <tr>
                <td>Torrico</td>
                <td>
                    <select>
                        <option selected value="0">Seleccione horario de ingreso</option>
                        <option value="1">08:00</option>
                        <option value="2">09:00</option>
                        <option value="3">10:00</option>
                    </select>
                </td>
                <td>
                    <select>
                        <option selected value="0">Seleccione horario de salida</option>
                        <option value="1">19:00</option>
                        <option value="2">20:00</option>
                        <option value="3">21:00</option>
                    </select>
                </td>
                <td>
          {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map((day, index) => (
              <label className="checkday-control">
                <input
                  type="checkbox"
                  name="checkbox-layout"
                  checked={checkedDays[index]}
                  onChange={() => handleCheckboxChange(index)}
                />
                {day}&emsp;
              </label>
          ))}
            </td>
            </tr>
        </tbody>
    );
}

export default ItemHorario;