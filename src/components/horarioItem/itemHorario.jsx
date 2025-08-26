import { useState, useEffect, useCallback } from "react";
import './itemHorario.css';
import { createHoario } from "../../service/api";
import { Toaster, toast } from "sonner";
import { useUsers } from "../../hooks/useUsers";

const ItemHorario = ({ onClose, onSuccess }) => {
    const [checkedDays, setCheckedDays] = useState([false, false, false, false, false, false, false]);
    const [entrada, setEntrada] = useState('');
    const [salida, setSalida] = useState('');
    const [fechaEntrada, setFechaEntrada] = useState(new Date().toISOString().split('T')[0]);
    const [fechaSalida, setFechaSalida] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const diasSemana = ['Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado', 'Domingo'];
    const [selectedUser, setSelectedUser] = useState(null);
    
    // Usamos el hook useUsers con filtros opcionales
    const { 
      users, 
      filteredUsers, 
      isLoading: loadingUsers 
    } = useUsers(0, 100, 'firstName');
    
    // Filtramos los usuarios por roles específicos
    const panaderos = filteredUsers(['PANADERO', 'MAESTRO', 'VENDEDOR']);

    const hourOptions = Array.from({ length: 24 }, (_, i) => {
        const hour = i.toString().padStart(2, '0') + ":00:00";
        return { value: hour, label: hour.slice(0, -3) };
    });

    const handleCheckboxChange = (index) => {
        const newCheckedDays = [...checkedDays];
        newCheckedDays[index] = !newCheckedDays[index];
        setCheckedDays(newCheckedDays);
    };

    const handleNextDay = () => {
        const nextDay = new Date(fechaEntrada);
        nextDay.setDate(nextDay.getDate() + 1);
        setFechaSalida(nextDay.toISOString().split('T')[0]);
    };

    const handleUserChange = (e) => {
        const userId = parseInt(e.target.value);
        const user = panaderos.find(u => u.id === userId);
        setSelectedUser(user || null);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        const diasSeleccionados = checkedDays
            .map((checked, index) => checked ? diasSemana[index] : null)
            .filter(dia => dia !== null);

        if (diasSeleccionados.length === 0) {
            alert('Por favor seleccione al menos un día de la semana');
            return;
        }

        if (!selectedUser) {
            alert('Por favor seleccione un panadero');
            return;
        }

        if (!entrada || !salida) {
            alert('Por favor seleccione los horarios de entrada y salida');
            return;
        }

        if (!fechaSalida) {
            alert('Por favor seleccione la fecha de salida');
            return;
        }

        const horarioData = {
            panadero: selectedUser.fullName,
            idPanadero: selectedUser.id,
            horaEntrada: entrada,
            horaSalida: salida,
            fechaEntrada: fechaEntrada,
            fechaSalida: fechaSalida,
            dias: diasSeleccionados
        };

        try {
            setIsSubmitting(true);
            await createHoario(horarioData);
            toast.success('Horario creado correctamente');

            // Resetear el formulario
            setCheckedDays([false, false, false, false, false, false, false]);
            setEntrada('');
            setSalida('');
            setFechaEntrada(new Date().toISOString().split('T')[0]);
            setFechaSalida('');
            setSelectedUser(null);
            
            if (onSuccess) onSuccess();
            onClose();
        } catch (error) {
            console.error('Error al crear horario:', error);
            toast.error('Error al crear el horario: ' + (error.response?.data?.message || error.message));
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="item-horario">
            <Toaster richColors position="top-right" />
            <h4>Seleccione el horario de panadero</h4>
            <div>
                {loadingUsers ? (
                    <p>Cargando panaderos...</p>
                ) : (
                    <select
                        value={selectedUser ? selectedUser.id : ''}
                        onChange={handleUserChange}
                        aria-label="Seleccione un panadero"
                    >
                        <option value="">Seleccione un panadero</option>
                        {panaderos.map(user => (
                            <option key={user.id} value={user.id}>
                                {user.fullName}
                            </option>
                        ))}
                    </select>
                )}
                <select
                    value={entrada}
                    onChange={(e) => setEntrada(e.target.value)}
                    aria-label="Seleccione horario de ingreso"
                >
                    <option value="">Seleccione horario de ingreso</option>
                    {hourOptions.map(({value, label}) => (
                        <option key={value} value={value}>{label}</option>
                    ))}
                </select>
            </div>
            <div>
                <input
                    type="date"
                    value={fechaSalida}
                    onChange={(e) => setFechaSalida(e.target.value)}
                    aria-label="Seleccione fecha de salida"
                />
                <button
                    onClick={handleNextDay}
                    aria-label="Cambiar fecha de salida a mañana"
                    type="button"
                >⏭️</button>
                <select
                    value={salida}
                    onChange={(e) => setSalida(e.target.value)}
                    aria-label="Seleccione horario de salida"
                >
                    <option value="">Seleccione horario de ingreso</option>
                    {hourOptions.map(({value, label}) => (
                        <option key={value} value={value}>{label}</option>
                    ))}
                </select>
            </div>
            <div>
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
            </div>
            <div>
                <button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="submit-button"
                    type="button"
                >
                    {isSubmitting ? 'Guardando...' : 'Guardar Horario'}
                </button>
            </div>
        </div>
    );
}

export default ItemHorario;