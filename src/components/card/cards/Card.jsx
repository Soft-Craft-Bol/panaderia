import React, { useState } from 'react';
import './Card.css';
import { FaPencilAlt, FaPlus, FaMinus, FaEye } from "react-icons/fa";
import { useNavigate } from 'react-router-dom';
import { createSucursalInsumo, restarCantidadDeInsumo } from '../../../service/api'; // Importamos ambos endpoints
import { toast } from 'sonner';
import Modal from '../../modal/Modal';

const Card = ({ img, titulo, datos = {}, cantidad, insumoId, sucursalId, fetchSucursalesConInsumos, insumoData }) => {
  const navigate = useNavigate();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false); 
  const [isSubtractModalOpen, setIsSubtractModalOpen] = useState(false); 
  const [formData, setFormData] = useState({
    cantidad: '',
    stockMinimo: '',
    fechaIngreso: '',
    fechaVencimiento: '',
    ultimaAdquisicion: ''
  });
  const [cantidadARestar, setCantidadARestar] = useState(''); // Estado para la resta
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  // Función para editar insumo
  const handleEdit = (e) => {
    e.stopPropagation();
    navigate(`/insumos/edit/${insumoId}`);
  };

  // Función para abrir modal de suma (nuevo formulario completo)
  const handleAddQuantity = (e) => {
    e.stopPropagation();
    setIsAddModalOpen(true); 
  };

  // Función para abrir modal de resta (solo cantidad)
  const handleSubstractQuantity = (e) => {
    e.stopPropagation();
    setIsSubtractModalOpen(true); 
  };

  // Función para ver detalles
  const handleViewDetails = (e) => {
    e.stopPropagation();
    setShowDetailsModal(true);
  };

  // Cerrar modal de detalles
  const closeDetailsModal = () => {
    setShowDetailsModal(false);
  };

  // Manejar cambios en el formulario de suma
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Función para enviar datos al endpoint de creación (suma)
  const handleAddSubmit = async () => {
    if (!formData.cantidad || formData.cantidad <= 0) {
      toast.error('Por favor, ingresa una cantidad válida.');
      return;
    }

    if (!formData.fechaIngreso) {
      toast.error('La fecha de ingreso es requerida.');
      return;
    }

    try {
      const dataToSend = {
        cantidad: parseInt(formData.cantidad),
        stockMinimo: formData.stockMinimo ? parseInt(formData.stockMinimo) : 0,
        fechaIngreso: formData.fechaIngreso,
        fechaVencimiento: formData.fechaVencimiento || null,
        ultimaAdquisicion: formData.ultimaAdquisicion || new Date().toISOString().split('T')[0]
      };

      await createSucursalInsumo(dataToSend, sucursalId, insumoId);
      toast.success('Insumo agregado exitosamente.');
      setIsAddModalOpen(false);
      fetchSucursalesConInsumos(); 
      setFormData({
        cantidad: '',
        stockMinimo: '',
        fechaIngreso: '',
        fechaVencimiento: '',
        ultimaAdquisicion: ''
      });
    } catch (error) {
      console.error('Error al agregar el insumo:', error);
      toast.error('Hubo un error al agregar el insumo.');
    }
  };

  // Función para enviar datos al endpoint de resta
  const handleSubtractSubmit = async () => {
    if (!cantidadARestar || cantidadARestar <= 0) {
      toast.error('Por favor, ingresa una cantidad válida.');
      return;
    }

    try {
      await restarCantidadDeInsumo(sucursalId, insumoId, cantidadARestar);
      toast.success('Cantidad restada exitosamente.');
      setIsSubtractModalOpen(false);
      fetchSucursalesConInsumos(); 
      setCantidadARestar('');
    } catch (error) {
      console.error('Error al restar la cantidad:', error);
      toast.error('Hubo un error al restar la cantidad.');
    }
  };

  return (
    <>
      <div className="card-cd">
        <div className='left'>
          <img src={img} alt={titulo} className="card-image" />
        </div>
        <div className="info">
          <h3 className="card-title">{titulo}</h3>
          {Object.entries(datos).map(([key, value]) => (
            <p key={key} className="card-dato">
              <span className='title'>{key}:</span> {value}
            </p>
          ))}
          <div className='icons-cont'>
            <FaEye className='icon' title='Ver detalles' onClick={handleViewDetails} />
            <FaPencilAlt className='icon' title='Editar insumo' onClick={handleEdit} />
            <FaPlus className='icon' title='Agregar más insumos' onClick={handleAddQuantity} />
            <FaMinus className='icon' title='Reducir insumo' onClick={handleSubstractQuantity} />
          </div>
        </div>
        <div className='right-info'>
          <p className="card-cantidad">{cantidad || 0}</p>
          <span className='p-label'>Ud.</span>
        </div>
      </div>

      {/* Modal de detalles (sin cambios) */}
      {showDetailsModal && insumoData && (
        <Modal isOpen={showDetailsModal} onClose={closeDetailsModal}>
          <div className="insumo-modal">
            {/* ... (contenido del modal de detalles) ... */}
          </div>
        </Modal>
      )}

      {/* Modal para SUMAR (nuevo formulario completo) */}
      {isAddModalOpen && (
        <div className="modal-overlay">
          <div className="modal" style={{ width: '500px' }}>
            <h3>Agregar insumo</h3>
            <div className="modal-content">
              <div className="form-group">
                <label>Cantidad:</label>
                <input
                  type="number"
                  name="cantidad"
                  value={formData.cantidad}
                  onChange={handleInputChange}
                  placeholder="Ingresa la cantidad"
                  min="1"
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Stock Mínimo:</label>
                <input
                  type="number"
                  name="stockMinimo"
                  value={formData.stockMinimo}
                  onChange={handleInputChange}
                  placeholder="Opcional"
                  min="0"
                />
              </div>
              
              <div className="form-group">
                <label>Fecha de Ingreso:</label>
                <input
                  type="date"
                  name="fechaIngreso"
                  value={formData.fechaIngreso}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Fecha de Vencimiento:</label>
                <input
                  type="date"
                  name="fechaVencimiento"
                  value={formData.fechaVencimiento}
                  onChange={handleInputChange}
                  placeholder="Opcional"
                />
              </div>
              
              <div className="form-group">
                <label>Última Adquisición:</label>
                <input
                  type="date"
                  name="ultimaAdquisicion"
                  value={formData.ultimaAdquisicion}
                  onChange={handleInputChange}
                  placeholder="Opcional"
                />
              </div>
            </div>
            <div className="modal-actions">
              <button className='btn-edit' onClick={handleAddSubmit}>Agregar</button>
              <button className='btn-cancel' onClick={() => setIsAddModalOpen(false)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal para RESTAR (solo cantidad) */}
      {isSubtractModalOpen && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Restar cantidad</h3>
            <div className="modal-content">
              <label>Cantidad:</label>
              <input
                type="number"
                value={cantidadARestar}
                onChange={(e) => setCantidadARestar(e.target.value)}
                placeholder="Ingresa la cantidad"
                min="1"
              />
            </div>
            <div className="modal-actions">
              <button className='btn-edit' onClick={handleSubtractSubmit}>Restar</button>
              <button className='btn-cancel' onClick={() => setIsSubtractModalOpen(false)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Card;