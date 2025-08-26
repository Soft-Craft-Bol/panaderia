import React, { useState } from "react";
import './cardProducto.css';
import { FaEdit } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import ImagesApp from '../../assets/ImagesApp';
import { useNavigate } from "react-router-dom";
import { Button } from "../buttons/Button";

const CardSucursal = ({ dataLabels, product, onEliminar, onEditar }) => {
  const [isImageExpanded, setIsImageExpanded] = useState(false);
  const navigate = useNavigate();
  const handleOpenModal = () => {
    setIsImageExpanded(true);
  };

  const handleCloseModal = () => {
    setIsImageExpanded(false);
  };

  const handleEdit = () => {
    navigate(onEditar);
  };

  return (
    <div className="cardP" style={{ width: "400px", height: "580px" }}>
      <img
        src={product.image}
        alt={product.nombre}
        style={{ height: "40%", cursor: "pointer" }}
        onClick={handleOpenModal}
      />
      <div className="data-cont">
        <div className="cabecera-card">
          <h2 title={product.nombre}>{product.nombre}</h2>
        </div>
        {isImageExpanded && (
          <div className="image-modal" onClick={handleCloseModal}>
            <div className="modal-content">
              <img
                src={product.image?.startsWith('http') ? product.image : ImagesApp.defaultImage}
                alt={product.descripcion || 'Imagen no disponible'}
              />
            </div>
          </div>
        )}

        <p><strong>{dataLabels.data1}</strong> {product.departamento}</p>
        <p><strong>{dataLabels.data2}</strong> {product.municipio}</p>
        <p><strong>{dataLabels.data3}</strong> {product.direccion}</p>
        <p><strong>{dataLabels.data4}</strong> {product.telefono}</p>
        <p><strong>{dataLabels.data5}</strong> {product.empresa.razonSocial}</p>
        <div className="cardFooter">
          <Button
            variant="info"
            type="button"
            onClick={handleEdit}
            style={{ width: '45%' }}
          >
            <FaEdit />
            Editar
          </Button>
          <Button
            variant="danger"
            type="button"
            onClick={onEliminar}
            style={{ width: '45%' }}
          >
            <MdDelete />
            Eliminar
          </Button>
        </div>
      </div>
    </div>
  );
};
export default CardSucursal;