import React from 'react';
import './Card.css';
import { FaPencilAlt, FaSearch, FaPlus } from "react-icons/fa";
import { useNavigate } from 'react-router-dom';

const Card = ({ img, titulo, datos = {}, cantidad, onTitleHover, insumoId, insumoData }) => {
  const navigate = useNavigate();

  const handleEdit = () => {
    navigate(`/insumos/edit/${insumoId}`, { state: { insumoData } });
    console.log('Editing', insumoData);
  };

  const handleAddQuantity = () => {
    console.log('Adding quantity');
  };

  return (
    <div className="card-cd">
      <div className='left'>
        <img src={img} alt={titulo} className="card-image" />
      </div>
      <div className="info">
        <h3 
          className="card-title" 
          onMouseEnter={onTitleHover} 
          onMouseLeave={onTitleHover}
        >
          {titulo}
        </h3>
        {Object.entries(datos).map(([key, value]) => (
          <p key={key} className="card-dato">
            <span className='title'>{key}:</span> {value}
          </p>
        ))}
        <div className='icons-cont'>
          <FaPencilAlt className='icon' onClick={handleEdit}/>
          <FaPlus className='icon' onClick={handleAddQuantity}/>
        </div>
      </div>
      <div className='right-info'>
        <p className="card-cantidad">{cantidad || 30}</p>
        <span className='p-label'>Ud.</span>
      </div>
    </div>
  );
};

export default Card;