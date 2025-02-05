import React from "react";
import './cardProducto.css'

const CardProducto = () => {
    return (
        <div className="cardP">
             <h2>Pan en molde - Integral</h2>
             <img src="https://imag.bonviveur.com/pan-de-trigo-rustico-foto-principal.jpg"></img>
             <p><strong>Tipo:</strong> Integral</p>
             <p><strong>PrecioProducto:</strong> 1 Bs</p>
             <p><strong>PrecioVenta:</strong> 1.50 Bs</p>
        </div>
       
    )
}
export default CardProducto;