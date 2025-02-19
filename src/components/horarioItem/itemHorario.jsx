import { useState } from "react";
import './itemHorario.css';

const ItemHorario = (props) => {
    const [checkedDays, setCheckedDays] = useState([false, false, false, false, false, false, false]);
    const [entrada, setEntrada] = useState('');
    const [salida, setSalida] = useState('');
    const [fechaEntrada, setFechaEntrada] = useState(new Date().toISOString().split('T')[0]);
    const [fechaSalida, setFechaSalida] = useState('');

    const handleCheckboxChange = (index) => {
        const newCheckedDays = [...checkedDays];
        newCheckedDays[index] = !newCheckedDays[index];
        setCheckedDays(newCheckedDays);
    };

    const generateHourOptions = () => {
        const hours = [];
        for (let i = 0; i < 24; i++) {
            const hour = i.toString().padStart(2, '0') + ":00";
            hours.push(<option key={hour} value={hour}>{hour}</option>);
        }
        return hours;
    };

    const handleNextDay = () => {
        const nextDay = new Date(fechaEntrada);
        nextDay.setDate(nextDay.getDate() + 1);
        setFechaSalida(nextDay.toISOString().split('T')[0]);
    };

    return (
        <tbody className="item-horario">
            <tr>
                <td>{props.nombre}</td>
                <td>
                    <input 
                        type="date" 
                        value={fechaEntrada} 
                        onChange={(e) => setFechaEntrada(e.target.value)} 
                        aria-label="Seleccione fecha de ingreso"
                    />
                    <select 
                        value={entrada} 
                        onChange={(e) => setEntrada(e.target.value)} 
                        aria-label="Seleccione horario de ingreso"
                    >
                        <option value="" disabled>Seleccione horario de ingreso</option>
                        {generateHourOptions()}
                    </select>
                </td>
                <td>
                    <input 
                        type="date" 
                        value={fechaSalida} 
                        onChange={(e) => setFechaSalida(e.target.value)} 
                        aria-label="Seleccione fecha de salida"
                    />
                    <button onClick={handleNextDay} aria-label="Cambiar fecha de salida a mañana">⏭️</button>
                    <select 
                        value={salida} 
                        onChange={(e) => setSalida(e.target.value)} 
                        aria-label="Seleccione horario de salida"
                    >
                        <option value="" disabled>Seleccione horario de salida</option>
                        {generateHourOptions()}
                    </select>
                </td>
                <td>
                    {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map((day, index) => (
                        <label key={index} className="checkday-control">
                            <input
                                type="checkbox"
                                name={`checkbox-${day}`}
                                checked={checkedDays[index]}
                                onChange={() => handleCheckboxChange(index)}
                                aria-label={`Seleccione ${day}`}
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