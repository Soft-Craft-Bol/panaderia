import React, {useState} from "react";
import './cardProducto.css'
import { FaEdit } from "react-icons/fa";
import '../../pages/facturacion/Facturacion.css'
import { MdDelete } from "react-icons/md";
import ModalConfirm from '../modalConfirm/ModalConfirm';

const CardProducto = (product) => {
    const [showModal, setShowModal] = useState(false); // Estado para mostrar/ocultar el modal

    const handleOpenModal = () => {
        setShowModal(true); // Abre el modal
    };

    const handleCloseModal = () => {
        setShowModal(false); // Cierra el modal
    };

    const confirmarAccion = () => {
        console.log('Acción confirmada: eliminar el elemento');
        setShowModal(false); 
        // lógica para eliminar la card
    };
    
    return (
        <div className="cardP">
             <h2>{product.nomProducto}</h2>
             <img src= {product.foto} alt="No hay foto"></img>
             <p><strong>Tipo:</strong> Integral</p>
             <p><strong>PrecioProducto:</strong> 1 Bs</p>
             <p><strong>PrecioVenta:</strong> 1.50 Bs</p>
             <div className="cardFooter">
             <button className="btn-emitir" >
                <FaEdit/> Editar
             </button>
             <button className="btn-limpiar" onClick={handleOpenModal}>
                <MdDelete /> Eliminar
            </button>

            {/* Modal de confirmación */}
            <ModalConfirm 
                showModal={showModal} 
                handleCloseModal={handleCloseModal} 
                confirmarAccion={confirmarAccion} 
            />
             </div>
        </div>
       
    )
}
export default CardProducto;