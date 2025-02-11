import React from "react";
import './cardProducto.css'
import { FaEdit } from "react-icons/fa";
import { MdDelete } from "react-icons/md";

const CardSucursal = ({ dataLabels, product, onEliminar }) => {
    return (
        <div className="cardP">
            <h2 title={product.nombre}>{product.nombre}</h2>
            <img src={product.image} alt={product.nombre} />
            <p><strong>{dataLabels.data1}</strong> {product.departamento}</p>
            <p><strong>{dataLabels.data2}</strong> {product.municipio}</p>
            <p><strong>{dataLabels.data3}</strong> {product.direccion}</p>
            <p><strong>{dataLabels.data4}</strong> {product.telefono}</p>
            <p><strong>{dataLabels.data5}</strong> {product.empresa.razonSocial}</p>
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

export default CardSucursal;