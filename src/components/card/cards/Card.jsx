import React, { useState } from 'react';
import './Card.css';
import { FaPencilAlt, FaSearch, FaPlus } from "react-icons/fa";
import { useNavigate } from 'react-router-dom';
import { getSucursales, sumarCantidadDeInsumo } from '../../../service/api';
const Card = ({ img, titulo, datos = {}, cantidad, onTitleHover, insumoId, insumoData }) => {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false); 
  const [sucursales, setSucursales] = useState([]); 
  const [selectedSucursal, setSelectedSucursal] = useState('');
  const [cantidadInput, setCantidadInput] = useState('');

  const handleEdit = () => {
    navigate(`/insumos/edit/${insumoId}`, { state: { insumoData } });
    console.log('Editing', insumoData);
  };

  const handleAddQuantity = async () => {
    try {
      const response = await getSucursales();
      setSucursales(response.data);
      setIsModalOpen(true);
    } catch (error) {
      console.error('Error al obtener las sucursales:', error);
    }
  };
  const handleSubmit = async () => {
    if (!selectedSucursal || !cantidadInput) {
      alert('Por favor, selecciona una sucursal e ingresa una cantidad.');
      return;
    }

    try {
      await sumarCantidadDeInsumo(selectedSucursal, insumoId, cantidadInput);
      alert('Cantidad agregada exitosamente.');
      setIsModalOpen(false); 
    } catch (error) {
      console.error('Error al agregar la cantidad:', error);
      alert('Hubo un error al agregar la cantidad.');
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
          <FaPencilAlt className='icon' onClick={handleEdit}/>
          <FaPlus className='icon' onClick={handleAddQuantity} />
        </div>
      </div>
      <div className='right-info'>
        <p className="card-cantidad">{cantidad || 30}</p>
        <span className='p-label'>Ud.</span>
      </div>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Agregar cantidad</h3>
            <div className="modal-content">
              <label>Sucursal:</label>
              <select
                value={selectedSucursal}
                onChange={(e) => setSelectedSucursal(e.target.value)}
              >
                <option value="">Selecciona una sucursal</option>
                {sucursales.map((sucursal) => (
                  <option key={sucursal.id} value={sucursal.id}>
                    {sucursal.nombre}
                  </option>
                ))}
              </select>

              <label>Cantidad:</label>
              <input
                type="number"
                value={cantidadInput}
                onChange={(e) => setCantidadInput(e.target.value)}
                placeholder="Ingresa la cantidad"
              />
            </div>
            <div className="modal-actions">
              <button onClick={handleSubmit}>Agregar</button>
              <button onClick={() => setIsModalOpen(false)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Card;