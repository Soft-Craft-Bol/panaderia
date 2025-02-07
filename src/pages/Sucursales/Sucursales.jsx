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
                <tbody>
                    <tr>
                        <td>Villa Armonia</td>
                        <td>Zona Sud</td>
                        <td>Beto</td>
                        <td>
                            <button className="btn-general">
                                Ver detalles
                            </button>
                        </td>
                    </tr>

                    <tr>
                        <td>Villa Armonia</td>
                        <td>Zona Sud</td>
                        <td>Beto</td>
                        <td>
                            <button className="btn-general">
                                Ver detalles
                            </button>
                        </td>
                    </tr>
                </tbody>
                    
            </table>
        </div>
        </div>
    );
}
export default Sucursales;