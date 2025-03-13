import React, { useState } from 'react';
import './Card.css';
import { FaPencilAlt, FaPlus, FaMinus } from "react-icons/fa";
import { useNavigate } from 'react-router-dom';
import { sumarCantidadDeInsumo, restarCantidadDeInsumo } from '../../../service/api';

const Card = ({ img, titulo, datos = {}, cantidad, onTitleHover, insumoId, insumoData, sucursalId, fetchSucursalesConInsumos }) => {
  const navigate = useNavigate();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false); 
  const [isSubtractModalOpen, setIsSubtractModalOpen] = useState(false); 
  const [cantidadInput, setCantidadInput] = useState(''); 

  const handleEdit = () => {
    navigate(`/insumos/edit/${insumoId}`, { state: { insumoData } });
    console.log('Editing', insumoData);
  };

  const handleAddQuantity = () => {
    setIsAddModalOpen(true); 
  };

  const handleSubstractQuantity = () => {
    setIsSubtractModalOpen(true); 
  };

  const handleAddSubmit = async () => {
    if (!cantidadInput) {
      alert('Por favor, ingresa una cantidad.');
      return;
    }

    try {
      await sumarCantidadDeInsumo(sucursalId, insumoId, cantidadInput);
      alert('Cantidad agregada exitosamente.');
      setIsAddModalOpen(false);
      localStorage.removeItem('insumos');
      fetchSucursalesConInsumos(); 
    } catch (error) {
      console.error('Error al agregar la cantidad:', error);
      alert('Hubo un error al agregar la cantidad.');
    }
  };

  const handleSubtractSubmit = async () => {
    if (!cantidadInput) {
      alert('Por favor, ingresa una cantidad.');
      return;
    }

    try {
      await restarCantidadDeInsumo(sucursalId, insumoId, cantidadInput); 
      alert('Cantidad restada exitosamente.');
      setIsSubtractModalOpen(false);
      localStorage.removeItem('insumos');
      fetchSucursalesConInsumos(); 
    } catch (error) {
      console.error('Error al restar la cantidad:', error);
      alert('Hubo un error al restar la cantidad.');
    }
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
          <FaPencilAlt className='icon' onClick={handleEdit} />
          <FaPlus className='icon' onClick={handleAddQuantity} />
          <FaMinus className='icon' onClick={handleSubstractQuantity} />
        </div>
      </div>
      <div className='right-info'>
        <p className="card-cantidad">{cantidad || 30}</p>
        <span className='p-label'>Ud.</span>
      </div>
      {isAddModalOpen && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Agregar cantidad</h3>
            <div className="modal-content">
              <label>Cantidad:</label>
              <input
                type="number"
                value={cantidadInput}
                onChange={(e) => setCantidadInput(e.target.value)}
                placeholder="Ingresa la cantidad"
              />
            </div>
            <div className="modal-actions">
              <button onClick={handleAddSubmit}>Agregar</button>
              <button onClick={() => setIsAddModalOpen(false)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
      {isSubtractModalOpen && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Restar cantidad</h3>
            <div className="modal-content">
              <label>Cantidad:</label>
              <input
                type="number"
                value={cantidadInput}
                onChange={(e) => setCantidadInput(e.target.value)}
                placeholder="Ingresa la cantidad"
              />
            </div>
            <div className="modal-actions">
              <button onClick={handleSubtractSubmit}>Restar</button>
              <button onClick={() => setIsSubtractModalOpen(false)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Card;