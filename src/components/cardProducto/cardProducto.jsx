import React from "react";
import './cardProducto.css'
import { FaEdit } from "react-icons/fa";
import { MdDelete } from "react-icons/md";

const CardProducto = ({product, onEliminar}) => {
    return (
        <div className="cardP">
             <h2>{product.nomProducto}</h2>
             <img src= {product.foto} alt="No hay foto"></img>
             <p><strong>Tipo:</strong> Integral</p>
             <p><strong>PrecioProducto:</strong> 1 Bs</p>
             <p><strong>PrecioVenta:</strong> 1.50 Bs</p>
             <div className="cardFooter">
             <button className="btn-edit" >
                <FaEdit/> Editar
             </button>
             <button className="btn-cancel" onClick={onEliminar}>
                <MdDelete /> Eliminar
            </button>
             </div>
        </div>
       
    )
}
export default CardProducto;