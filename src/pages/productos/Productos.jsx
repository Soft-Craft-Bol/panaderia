import React from "react";
import './Productos.css';
import CardProducto, { } from '../../components/cardProducto/cardProducto'
const Productos = () => {
    return(
        <div className="productos-contenedor">
            <h1>Productos en stock</h1>
            <button className="productos-btnAgregar">
               (+) &emsp; Agregar nuevo
            </button>
            <div className="cardsProducto-contenedor">
                <CardProducto
                nomProducto="Pan en molde"
                foto= "https://imag.bonviveur.com/pan-de-trigo-rustico-foto-principal.jpg"/>
                <CardProducto
                nomProducto="Puta me costo harto"
                foto= "https://pic-bstarstatic.akamaized.net/ugc/12ab90beed69859203c989428ff7db9a9f9b7d7a.jpg"/>
            </div>
        </div>
    )
}

export default Productos;