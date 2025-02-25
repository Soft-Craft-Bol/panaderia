import React, { useState } from 'react';
import { FaEdit, FaShoppingCart } from 'react-icons/fa';
import { MdDelete } from 'react-icons/md';
import ImagesApp from '../../assets/ImagesApp';
import './cardProducto.css';
import { useNavigate } from 'react-router-dom';
import { Button } from '../buttons/Button';

const CardProducto = ({ product, dataLabels, onEliminar, onEdit, onAdd, tipoUsuario = 'interno', onReservar, descripcionProducto }) => {
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

  const handleCardClick = () => {
    if (onAdd) onAdd(product);
  };

  const cantidadTotal = Array.isArray(product.sucursales)
    ? product.sucursales.reduce((total, sucursal) => total + sucursal.cantidad, 0)
    : 0;

  const sucursalesDisponibles = Array.isArray(product.sucursales)
    ? product.sucursales.map(sucursal => `<span class="math-inline">\{sucursal\.nombre\}\(</span>{sucursal.cantidad})`).join(', ')
    : '';

  return (
    <div className="cardP">
      <img src={product.imagen} alt={product.descripcion} onClick={handleOpenModal} />
      <div className='data-cont'>
        <div className="cabecera-card">
          <h2 title={product.descripcion}>{product.descripcion}</h2>
          <button style={{ fontSize: "100%" }} onClick={handleCardClick}>
            <strong>+ </strong>
          </button>
        </div>

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
        <p><strong>{dataLabels.data1}</strong> {cantidadTotal}</p>
        <p><strong>{dataLabels.data2}</strong> {product.precioUnitario} Bs</p>
        {tipoUsuario === 'interno' && (
          <>
            <p className='desc-larga'><strong>{dataLabels.data3}</strong> {descripcionProducto}</p>
            <p><strong>Cant. Sucursales:</strong> {sucursalesDisponibles}</p>
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
      
    </div>
  );
};

export default CardProducto;