import React, { useEffect, useState } from 'react';
import { getSucursales,deleteSucursal } from '../../service/api';
import CardSucursal from '../../components/cardProducto/cardSucursal';
import ModalConfirm from '../../components/modalConfirm/ModalConfirm';
import './Sucursales.css';
import { toast } from "sonner";
import { useNavigate } from "react-router";

const Sucursales = () => {
    const [sucursales, setSucursales] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [sucursalAEliminar, setsucursalAEliminar] = useState(null);

    const navigate = useNavigate();
    useEffect(() => {
        const fetchSucursales = async () => {
            try {
                const response = await getSucursales();
                setSucursales(response.data);
            } catch (error) {
                console.error('Error fetching sucursales:', error);
            }
        };

        fetchSucursales();
    }, []);

    const handleOpenModal = (sucursal) => {
        setsucursalAEliminar(sucursal);
        setShowModal(true);
      };
    const handleCloseModal = () => {
        setShowModal(false);
        setsucursalAEliminar(null);
    };
    const confirmarAccion = async () => {
        if (sucursalAEliminar) {
          try {
            await deleteSucursal(sucursalAEliminar.id);
            setSucursales(prevSucursal => prevSucursal.filter(p => p.id !== sucursalAEliminar.id));
            toast.success("Sucursal eliminada correctamente");
          } catch (error) {
            console.error("Error al eliminar la sucursal:", error);
            toast.error("Error al eliminar la sucursal");
          }
        }
    
        setShowModal(false);
        setsucursalAEliminar(null);
      };

    const dataLabels = {
        data1: 'Departamento:',
        data2: 'Municipio:',
        data3: 'Dirección:',
        data4: 'Teléfono:',
        data5: 'Empresa:'
    };
    console.log(sucursales)
    return (
        <div>
            <h1>Sucursales</h1>
            <button className='btn-general' onClick={() => navigate("/sucursales/addSucursal")}>
                Registrar nueva Sucursal
            </button>
            <div className="sucursales-list">
                {sucursales.map(sucursal => (
                    <CardSucursal 
                        key={sucursal.id} 
                        dataLabels={dataLabels} 
                        product={sucursal} 
                        onEliminar={() => handleOpenModal(sucursal)}
                        onEditar={`/editSucursal/${sucursal.id}`}
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

export default Sucursales;