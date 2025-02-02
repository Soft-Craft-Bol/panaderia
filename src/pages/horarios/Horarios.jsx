import React, { useState } from "react";
import "./Horarios.css";
import ItemHorario from "../../components/horarioItem/itemHorario";

const Horarios = () => {
    return(
        <div className="horarios-contenedor">
            
            <h1>Asignación de horarios</h1>
            <table>
                <thead>
                    <tr>
                        <th>Nombre del Panadero</th>
                        <th>Hora entrada</th>
                        <th>Hora Salida</th>
                        <th>Días con este horario</th>
                    </tr>
                </thead>
            <ItemHorario />
            </table>
        </div>
    )
}
export default Horarios;