import React, { useState } from 'react';
import { FaEdit } from 'react-icons/fa';
import { MdDelete } from 'react-icons/md';
import ImagesApp from '../../assets/ImagesApp';
import './cardProducto.css';


const CardProducto = ({ product, dataLabels, onEliminar }) => {
  const [isImageExpanded, setIsImageExpanded] = useState(false);

  const handleOpenModal = () => {
    setIsImageExpanded(true);
  };

  const handleCloseModal = () => {
    setIsImageExpanded(false);
  };

  return (
    <div className="cardP">
      <h2 title={product.descripcion}>{product.descripcion}</h2>
      <img src={product.imagen} alt={product.descripcion} onClick={handleOpenModal} />
      {isImageExpanded && (
        <div className="image-modal" onClick={handleCloseModal}>
          <div className="modal-content">
            <img
              src={product.imagen?.startsWith('http') ? product.imagen : ImagesApp.defaultImage}
              alt={product.descripcion || 'Imagen no disponible'}
            />
          </div>
        </div>
      )}
      <p><strong>{dataLabels.data1}</strong> {product.unidadMedida}</p>
      <p><strong>{dataLabels.data2}</strong> {product.precioUnitario} Bs</p>
      <p><strong>{dataLabels.data3}</strong> {product.codigoProductoSin}</p>
      <div className="cardFooter">
        <button className="btn-edit">
          <FaEdit /> Editar
        </button>
        <button className="btn-cancel" onClick={onEliminar} style={{ width: "45%" }}>
          <MdDelete /> Eliminar
        </button>
      </div>
    </div>
  );
};

export default CardProducto;