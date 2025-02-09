import React from "react";
import './cardProducto.css'
import { FaEdit } from "react-icons/fa";
import { MdDelete } from "react-icons/md";

const CardProducto = ({ product, onEliminar }) => {
    return (
        <div className="cardP">
            <h2>{product.descripcion}</h2>
            <img src={product.imagen} alt={product.descripcion} />
            <p><strong>Unidad de medida:</strong> {product.unidadMedida}</p>
            <p><strong>Precio unitario:</strong> {product.precioUnitario} Bs</p>
            <p><strong>Codigo Producto SIN:</strong> {product.codigoProductoSin}</p>
            <div className="cardFooter">
                <button className="btn-edit">
                    <FaEdit /> Editar
                </button>
                <button className="btn-cancel" onClick={onEliminar}>
                    <MdDelete /> Eliminar
                </button>
            </div>
        </div>
    )
}

export default CardProducto;