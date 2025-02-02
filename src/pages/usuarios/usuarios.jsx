import React from "react";
import { FaUsers, FaEdit } from "react-icons/fa";
import '../Sucursales/Sucursales.css';

const Usuarios = () => {
    return (
        <div className="contenedor-sucursales">
        <h1> Gestión de Usuarios </h1>
        <div className="table">
            <table className="table-header">
                <thead>
                    <tr>
                        <th>Nombre</th>
                        <th>Correo</th>
                        <th>Tipo de Usuario</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>Beto castillo</td>
                        <td>correo@example.com</td>
                        <td>Administrador</td>
                        <td>
                            <button className="detalles-sucursal">
                                <FaEdit/> Editar
                            </button>
                        </td>
                    </tr>
                    
                </tbody>
                    
            </table>
        </div>
        </div>
    );
}
export default Usuarios;