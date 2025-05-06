import React, { useState, useEffect } from 'react';
import './Insumos.css';
import Card from '../../components/card/cards/Card';
import { getInactivos, activarInsumo, eliminarInsumo } from '../../service/api';
import Modal from '../../components/modal/Modal';
import { useNavigate } from 'react-router-dom';
import ModalConfirm from '../../components/modalConfirm/ModalConfirm';

const InsumosInactivos = () => {
  const [insumos, setInsumos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedInsumo, setSelectedInsumo] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [insumoToDelete, setInsumoToDelete] = useState(null);
  const navigate = useNavigate();

  const fetchInsumos = async () => {
    try {
      const response = await getInactivos();
      setInsumos(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching insumos:', error);
      setError(error);
      setLoading(false);
    }
  };

  const handleActivar = async (id) => {
    try {
      await activarInsumo(id);
      fetchInsumos();
      closeModal();
    } catch (error) {
      console.error('Error activando insumo:', error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await eliminarInsumo(id);
      fetchInsumos();
      setShowDeleteModal(false);
    } catch (error) {
      console.error('Error eliminando insumo:', error);
    }
  };

  const openModal = (insumo) => {
    setSelectedInsumo(insumo);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedInsumo(null);
  };

  const openDeleteModal = (insumo, e) => {
    e.stopPropagation();
    setInsumoToDelete(insumo);
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setInsumoToDelete(null);
  };

  useEffect(() => {
    fetchInsumos();
  }, []);

  if (loading) return <div className="loading">Cargando...</div>;
  if (error) return <div className="error">Error al cargar los insumos</div>;

  return (
    <main className='main-insumos'>
      <h1>Insumos Inactivos</h1>
      <div className="insumos-actions">
        <button className='btn-general' onClick={() => navigate('/insumos')}>
          Ver activos
        </button>
      </div>
      
      <div className="cards-container">
        {insumos.map((insumo) => (
          <div 
            key={insumo.id}
            className="card-wrapper"
            onClick={() => openModal(insumo)}
          >
            <Card
              img={insumo.imagen}
              titulo={insumo.nombre}
              datos={{
                Proveedor: insumo.proveedor,
                Marca: insumo.marca,
                Estado: 'Inactivo'
              }}
              cantidad={insumo.cantidad}
              insumoId={insumo.id}
              showDeleteButton={true}
              showActivateButton={true}
              onActivate={(e) => {
                e.stopPropagation();
                handleActivar(insumo.id);
              }}
              onDelete={(e) => {
                openDeleteModal(insumo, e);
              }}
            />
          </div>
        ))}
      </div>

      {showModal && selectedInsumo && (
        <Modal isOpen={showModal} onClose={closeModal}>
          <div className="insumo-modal">
            <div className="insumo-header">
              <h2>{selectedInsumo.nombre}</h2>
              <span className={`status-badge inactive`}>
                Inactivo
              </span>
            </div>
            
            <div className="insumo-image">
              <img 
                src={selectedInsumo.imagen} 
                alt={selectedInsumo.nombre} 
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/300?text=Sin+Imagen';
                }}
              />
            </div>
            
            <div className="insumo-details">
              <div className="detail-row">
                <span className="detail-label">Proveedor:</span>
                <span className="detail-value">{selectedInsumo.proveedor}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Marca:</span>
                <span className="detail-value">{selectedInsumo.marca}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Precio:</span>
                <span className="detail-value">Bs {selectedInsumo.precio.toFixed(2)}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Cantidad:</span>
                <span className="detail-value">
                  {selectedInsumo.cantidad} {selectedInsumo.unidades}
                </span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Stock mínimo:</span>
                <span className="detail-value">
                  {selectedInsumo.stockMinimo} {selectedInsumo.unidades}
                </span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Fecha ingreso:</span>
                <span className="detail-value">
                  {new Date(selectedInsumo.fechaIngreso).toLocaleDateString()}
                </span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Fecha vencimiento:</span>
                <span className="detail-value">
                  {new Date(selectedInsumo.fechaVencimiento).toLocaleDateString()}
                </span>
              </div>
              <div className="detail-row full-width">
                <span className="detail-label">Descripción:</span>
                <p className="detail-value description">{selectedInsumo.descripcion}</p>
              </div>
            </div>
            
            <div className="modal-actions">
              <button 
                className="btn-general"
                onClick={() => {
                  navigate(`/insumos/editar/${selectedInsumo.id}`);
                  closeModal();
                }}
              >
                Editar
              </button>
              <button 
                className="btn-general success"
                onClick={() => {
                  handleActivar(selectedInsumo.id);
                }}
              >
                Activar
              </button>
              <button 
                className="btn-general danger"
                onClick={(e) => {
                  e.stopPropagation();
                  openDeleteModal(selectedInsumo, e);
                  closeModal();
                }}
              >
                Eliminar
              </button>
              <button 
                className="btn-general secondary"
                onClick={closeModal}
              >
                Cerrar
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal de confirmación para eliminar */}
      {showDeleteModal && (
        <ModalConfirm
          isOpen={showDeleteModal}
          onClose={closeDeleteModal}
          onConfirm={() => handleDelete(insumoToDelete.id)}
          title="Confirmar eliminación"
          message={`¿Estás seguro que deseas eliminar permanentemente el insumo "${insumoToDelete.nombre}"? Esta acción no se puede deshacer.`}
          confirmText="Eliminar"
          cancelText="Cancelar"
          danger={true}
        />
      )}
    </main>
  );
};

export default InsumosInactivos;