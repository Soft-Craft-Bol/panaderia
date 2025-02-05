import React from "react";
import './Productos.css'
const Productos = () => {
    return(
        <div className="productos-contenedor">
            <h1>Productos en stock</h1>
            <button className="productos-btnAgregar">
               (+) &emsp; Agregar nuevo
            </button>
            <div className="cardsProducto-contenedor">
                
            </div>
        </div>
    )
}

export default Productos;