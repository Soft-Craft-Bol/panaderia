import { useState, useEffect } from "react";
import './itemHorario.css';
import { createHoario, getUsers } from "../../service/api";

const ItemHorario = ({ onClose }) => {
    const [checkedDays, setCheckedDays] = useState([false, false, false, false, false, false, false]);
    const [entrada, setEntrada] = useState('');
    const [salida, setSalida] = useState('');
    const [fechaEntrada, setFechaEntrada] = useState(new Date().toISOString().split('T')[0]);
    const [fechaSalida, setFechaSalida] = useState('');  
    const [isSubmitting, setIsSubmitting] = useState(false);
    const diasSemana = ['Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado', 'Domingo'];
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await getUsers();
                // Filtramos solo los usuarios que son panaderos
                const panaderos = response.data.filter(user => 
                    user.roles.includes('PANADERO')
                ).map(user => ({
                    ...user,
                    fullName: `${user.firstName} ${user.lastName}`
                }));
                setUsers(panaderos);
                console.log('Panaderos cargados:', panaderos); // Para debugging
            } catch (error) {
                console.error('Error al obtener usuarios:', error);
                alert('Error al cargar los panaderos');
            }
        };

        fetchUsers();
    }, []);

    const handleCheckboxChange = (index) => {
        const newCheckedDays = [...checkedDays];
        newCheckedDays[index] = !newCheckedDays[index];
        setCheckedDays(newCheckedDays);
    };

    const generateHourOptions = () => {
        const hours = [];
        for (let i = 0; i < 24; i++) {
            const hour = i.toString().padStart(2, '0') + ":00:00";
            hours.push(<option key={hour} value={hour}>{hour.slice(0, -3)}</option>);
        }
        return hours;
    };

    const handleNextDay = () => {
        const nextDay = new Date(fechaEntrada);
        nextDay.setDate(nextDay.getDate() + 1);
        setFechaSalida(nextDay.toISOString().split('T')[0]);
    };

    const handleUserChange = (e) => {
        const userId = parseInt(e.target.value);
        const user = users.find(u => u.id === userId);
        console.log('Usuario seleccionado:', user); // Para debugging
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
            const response = await createHoario(horarioData);
            console.log('Respuesta del servidor:', response);
            alert('Horario creado exitosamente');
            
            // Resetear el formulario
            setCheckedDays([false, false, false, false, false, false, false]);
            setEntrada('');
            setSalida('');
            setFechaSalida('');
            setSelectedUser(null);
            onClose();
        } catch (error) {
            console.error('Error al crear horario:', error);
            alert('Error al crear el horario: ' + (error.response?.data?.message || error.message));
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="item-horario">
            <h4>Seleccione el horario de panadero</h4>
            <div>
                <select 
                    value={selectedUser ? selectedUser.id : ''} 
                    onChange={handleUserChange}
                    aria-label="Seleccione un panadero"
                >
                    <option value="">Seleccione un panadero</option>
                    {users.map(user => (
                        <option key={user.id} value={user.id}>
                            {user.fullName}
                        </option>
                    ))}
                </select>
                <select 
                    value={entrada} 
                    onChange={(e) => setEntrada(e.target.value)} 
                    aria-label="Seleccione horario de ingreso"
                >
                    <option value="">Seleccione horario de ingreso</option>
                    {generateHourOptions()}
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
                    <option value="">Seleccione horario de salida</option>
                    {generateHourOptions()}
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