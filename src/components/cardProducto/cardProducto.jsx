import React, { useState } from 'react';
import { FaEdit, FaShoppingCart } from 'react-icons/fa';
import { MdDelete } from 'react-icons/md';
import ImagesApp from '../../assets/ImagesApp';
import './cardProducto.css';
import { useNavigate } from 'react-router-dom';
import { Button } from '../buttons/Button';
import { addCantidadItem } from '../../service/api';

const CardProducto = ({ product, dataLabels, onEliminar, onEdit, onAdd, tipoUsuario = 'interno', onReservar }) => {
  const [isImageExpanded, setIsImageExpanded] = useState(false);
  const navigate = useNavigate();

  const handleOpenModal = () => {
    setIsImageExpanded(true);
  };

  const handleCloseModal = () => {
    setIsImageExpanded(false);
  };

  const handleEdit = () => {
    navigate(onEdit);
  };

  const sumarCantidad = async () => {
    try {
      const nuevaCantidad = product.cantidad + 1;
      await addCantidadItem(product.id, { cantidad: nuevaCantidad });
      alert("Cantidad actualizada exitosamente");
    } catch (error) {
      console.error("Error al actualizar cantidad:", error);
      alert("Hubo un error al actualizar la cantidad.");
    }
  };

  const handleCardClick = () => {
    if (onAdd) onAdd(product);
  };

  
  return (
    <div className="cardP">
      <div className="cabecera-card">
        <h2 title={product.descripcion}>{product.descripcion}</h2>
        <button style={{ fontSize: "100%" }} onClick={handleCardClick}>
          <strong>+ </strong>
        </button>
      </div>
      
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
      <p><strong>{dataLabels.data1}</strong> {product.cantidad}</p>
      <p><strong>{dataLabels.data2}</strong> {product.precioUnitario} Bs</p>
      {tipoUsuario === 'interno' && (
        <>
          <p><strong>{dataLabels.data3}</strong> {product.cantidad}</p>
        </>
      )}
      <div className="cardFooter">
        {tipoUsuario === 'interno' ? (
          <>
            <button className="btn-edit" onClick={handleEdit}>
              <FaEdit /> Editar
            </button>
            <button className="btn-cancel" onClick={onEliminar} style={{ width: "45%" }}>
              <MdDelete /> Eliminar
            </button>
          </>
        ) : (
          <Button
            variant="primary"
            type="button" 
            style={{ marginTop: '20px', alignSelf: 'center' }}
            onClick={onReservar} 
          >
            <FaShoppingCart /> Agregar al carrito
          </Button>
        )}
      </div>
    </div>
  );
};

export default CardProducto;