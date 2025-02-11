import React from "react";
import './cardProducto.css'
import { FaEdit } from "react-icons/fa";
import { MdDelete } from "react-icons/md";

const CardProducto = ({ dataLabels ,product, onEliminar }) => {
    return (
        <div className="cardP">
            <h2 title={product.descripcion}>{product.descripcion}</h2>
            <img src={product.imagen} alt={product.descripcion} />
            <p><strong>{dataLabels.data1}</strong> {product.unidadMedida}</p>
            <p><strong>{dataLabels.data2}</strong> {product.precioUnitario} Bs</p>
            <p><strong>{dataLabels.data3}</strong> {product.codigoProductoSin}</p>
            <div className="cardFooter">
                <button className="btn-edit">
                    <FaEdit /> Editar
                </button>
                <button className="btn-cancel" onClick={onEliminar} style={{width:"45%"}}>
                    <MdDelete /> Eliminar
                </button>
            </div>
        </div>
    )
}
export default CardProducto;