import React, { useState } from "react";
import './Productos.css';
import CardProducto from '../../components/cardProducto/cardProducto';
import ModalConfirm from '../../components/modalConfirm/ModalConfirm';

const Productos = () => {
    // Estado que almacena los productos
    const [productos, setProductos] = useState([
        { id: 1, nomProducto: "Pan en molde", foto: "https://imag.bonviveur.com/pan-de-trigo-rustico-foto-principal.jpg" },
        { id: 2, nomProducto: "Joder me costo", foto: "https://media.tenor.com/ItvR-h4N1REAAAAe/paimon-cry.png" }
    ]);

    const [showModal, setShowModal] = useState(false);
    const [productoAEliminar, setProductoAEliminar] = useState(null);

    const handleOpenModal = (producto) => {
        setProductoAEliminar(producto);
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setProductoAEliminar(null);
    };

    const confirmarAccion = () => {
        if (productoAEliminar) {
            setProductos(prevProductos => prevProductos.filter(p => p.id !== productoAEliminar.id));
        }
        setShowModal(false);
        setProductoAEliminar(null);
    };

    return (
        <div className="productos-contenedor">
            <h1>Productos en stock</h1>
            <button className="productos-btnAgregar">
                (+) &emsp; Agregar nuevo
            </button>
            <div className="cardsProducto-contenedor">
                {productos.map((product) => (
                    <CardProducto
                        key={product.id}
                        product={product}
                        onEliminar={() => handleOpenModal(product)}
                    />
                ))}
            </div>
            <ModalConfirm 
                showModal={showModal}
                handleCloseModal={handleCloseModal}
                confirmarAccion={confirmarAccion}
            />
        </div>
    );
};

export default Productos;
