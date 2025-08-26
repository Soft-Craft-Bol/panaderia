import React, { useState } from 'react';
import { FaEdit, FaShoppingCart, FaTags } from 'react-icons/fa';
import { MdDelete } from 'react-icons/md';
import ImagesApp from '../../assets/ImagesApp';
import './cardProducto.css';
import { useNavigate } from 'react-router-dom';
import { Button } from '../buttons/Button';
import { FaGift } from "react-icons/fa";
import ModalPromocion from '../../pages/productos/ModalPromocion';
import { setItemsPromocion, asignarCategoriaAItem, getCategorias } from '../../service/api';
import Modal from "../modal/Modal"; 
import { useQuery } from "@tanstack/react-query";
import { toast } from 'sonner';
import SelectSecondary from '../selected/SelectSecondary';

const CardProducto = ({ product, dataLabels, onEliminar, onEdit, onAdd, tipoUsuario = 'interno', onReservar, descripcionProducto, onCategoriaAsignada }) => {
  const [isImageExpanded, setIsImageExpanded] = useState(false);
  const [isPromoModalOpen, setIsPromoModalOpen] = useState(false);
  const [isCategoriaModalOpen, setIsCategoriaModalOpen] = useState(false);
  const [selectedCategoriaId, setSelectedCategoriaId] = useState("");
  const navigate = useNavigate();

  const { data: categorias = [] } = useQuery({
    queryKey: ['categorias-card'],
    queryFn: () => getCategorias().then(res => res.data)
  });

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

  const handleProductoDescuento = () => {
    setIsPromoModalOpen(true);
  };
  const handleApplyPromotion = async (descuento, sucursalId) => {
    try {
      const data = {
        item: {
          id: product.id
        },
        sucursal: {
          id: sucursalId
        },
        descuento: descuento
      };

      await setItemsPromocion(data);
      toast.success("Promoción aplicada correctamente");
      // Aquí puedes agregar una función para refrescar los datos si es necesario
    } catch (error) {
      console.error('Error al aplicar la promoción:', error);
      toast.error(error.response?.data?.message || "Error al aplicar la promoción");
    } finally {
      setIsPromoModalOpen(false);
    }
  };

  const handleAsignarCategoria = async () => {
    if (!selectedCategoriaId) {
      toast.error("Seleccione una categoría");
      return;
    }
    try {
      await asignarCategoriaAItem(product.id, selectedCategoriaId);
      toast.success("Categoría asignada correctamente");
      onCategoriaAsignada?.(); 
      setIsCategoriaModalOpen(false);
    } catch (error) {
      console.error(error);
      toast.error("Error al asignar categoría");
    }
  };

  const cantidadTotal = product.sucursales.reduce((total, sucursal) => total + sucursal.cantidad, 0);
  const sucursalesDisponibles = product.sucursales.map(sucursal => `${sucursal.nombre}(${sucursal.cantidad})`).join(', ');

  return (
    <div className="cardP">
      <img src={product.imagen} alt={product.descripcion} onClick={handleOpenModal} />
      <div className='data-cont'>
        <div className="cabecera-card">
          <h2 title={product.descripcion}>{product.descripcion}</h2>
          <div>
            <button style={{ fontSize: "100%" }} onClick={handleCardClick}>
              <strong>+ </strong>
            </button>
            <FaGift title='Marcar producto para promoción' className='icon' onClick={handleProductoDescuento} />
             <FaTags title="Asignar categoría" className="icon" onClick={() => setIsCategoriaModalOpen(true)} />
          </div>
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
        <p><strong>{dataLabels.data4}</strong> {product.categoria}</p>
        {tipoUsuario === 'interno' && (
          <>
            <p className='desc-larga'><strong>{dataLabels.data3}</strong> {descripcionProducto}</p>
            <p><strong>Cant. Sucursales:</strong> {sucursalesDisponibles}</p>
          </>
        )}
        <div className="cardFooter">
          {tipoUsuario === 'interno' ? (
            <>
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

      <Modal isOpen={isCategoriaModalOpen} onClose={() => setIsCategoriaModalOpen(false)}>
        <h2>Asignar categoría</h2>
        <SelectSecondary
          value={selectedCategoriaId}
          formikCompatible={false}
          onChange={(e) => setSelectedCategoriaId(e.target.value)}
        >
          <option value="">Seleccione una categoría</option>
          {categorias.map(cat => (
            <option key={cat.id} value={cat.id}>{cat.nombre}</option>
          ))}
        </SelectSecondary>
        <div className="botones-footer">
          <button className="btn-edit" onClick={handleAsignarCategoria}>Asignar</button>
          <button className="btn-cancel" onClick={() => setIsCategoriaModalOpen(false)}>Cancelar</button>
        </div>
      </Modal>
      {isPromoModalOpen && (
        <ModalPromocion
          product={product}
          onClose={() => setIsPromoModalOpen(false)}
          onConfirm={handleApplyPromotion}
        />
      )}
    </div>
  );
};

export default CardProducto;