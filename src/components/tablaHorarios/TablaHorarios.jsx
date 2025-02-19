import React, { useEffect, useState } from 'react'
import './TablaHorarios.css'
import { getHorario } from '../../service/api';

const TablaHorarios = () => {
    const [horarios,setHorarios] = useState([]);
    const [loading,setLoading] = useState(true);
    const [error,setError] = useState(null);

    useEffect( () => {
        const fetchHorarios = async () => {
            try{
                const response = await getHorario();
                setHorarios(response.data)
                setLoading(false);
            }catch(err){
                setError('Error al cargar usuarios');
                setLoading(false);
            }
        }
        fetchHorarios();
    }, []);

    if (loading) {
        return (
          <div className="loading-container">
            <p>Cargando horarios...</p>
          </div>
        );
    }

    if(error){
        return(
            <div className='error-message'>
                <p>{error}</p>
            </div>
        )
    }

    const formDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          });
    }

    return (
        <div className="horarios-container">
          <h2 className="horarios-title">Horarios de Panaderos</h2>
          <div className="table-container">
            <table className="horarios-table">
              <thead>
                <tr>
                  <th>Panadero</th>
                  <th>Hora Entrada</th>
                  <th>Hora Salida</th>
                  <th>Fecha Inicio</th>
                  <th>Fecha Fin</th>
                  <th>Días</th>
                </tr>
              </thead>
              <tbody>
                {horarios.map((horario) => (
                  <tr key={horario.id}>
                    <td>{horario.panadero}</td>
                    <td>{horario.horaEntrada.slice(0, 5)}</td>
                    <td>{horario.horaSalida.slice(0, 5)}</td>
                    <td>{formatDate(horario.fechaEntrada)}</td>
                    <td>{formatDate(horario.fechaSalida)}</td>
                    <td>
                      <div className="dias-container">
                        {horario.dias.map((dia, index) => (
                          <span key={index} className="dia-badge">
                            {dia}
                          </span>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {horarios.length === 0 && (
            <p className="no-data-message">No hay horarios registrados</p>
          )}
        </div>
      );
    };


export default TablaHorarios