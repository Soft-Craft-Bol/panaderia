import React from "react";
import './Sucursales.css';

const Sucursales = () => {
    return (
        <div className="contenedor-sucursales">
        <h1> Sucursales </h1>
        <div className="table">
            <table className="table-header">
                <thead>
                    <tr>
                        <th>Nombre</th>
                        <th>Dirección</th>
                        <th>Responsable</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
            </table>
        </div>
        </div>
    );
}
export default Sucursales;