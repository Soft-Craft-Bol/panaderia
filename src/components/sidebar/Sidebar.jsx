import { useState } from 'react';
import { useNavigate } from "react-router-dom";
import './Sidebar.css'
import { FaHome, FaUsers, FaBookMedical, FaCalendarAlt, FaToolbox, FaMoneyCheckAlt, FaUserMd } from "react-icons/fa";
import ImagesApp from '../../assets/ImagesApp'

const Sidebar = () => {
    const [selected, setSelected] = useState('Inicio');
    const navigate = useNavigate();

    const handleSelection = (section) => {
        setSelected(section);
        if (section === 'Inicio') {
            navigate('/');
        }
        if (section === 'Sucursales') {
            navigate('/sucursales');
        }
        if(section === 'Usuarios'){
            navigate('/users');
        }
        if(section === 'Facturacion'){
            navigate('/facturacion');
        }
        if(section === 'PuntoDeVenta'){
            navigate('/punto-de-venta');
        }
        if(section === 'Contaduria'){
            navigate('/contaduria');
        }
        if(section === 'Caja'){
            navigate('/caja');
        }
        
    };          
    return (
        <nav className='sidebar-container'>
            <img src={ImagesApp.sidebarImg} alt="" />
            <div>
                <div className={selected === 'Inicio' ? 'active' : ''} onClick={() => handleSelection('Inicio')}>
                    <FaHome className="icon" />
                    <h4 className={selected === 'Inicio' ? 'active-text' : ''}>Inicio</h4>
                </div>
                <div className={selected === 'Sucursales' ? 'active' : ''} onClick={() => handleSelection('Sucursales')}>
                    <FaHome className="icon" />
                    <h4 className={selected === 'Sucursales' ? 'active-text' : ''}>Sucursales</h4>
                </div>
                <div className={selected === 'Usuarios' ? 'active' : ''} onClick={() => handleSelection('Usuarios')}>
                    <FaUsers className="icon" />
                    <h4 className={selected === 'Usuarios' ? 'active-text' : ''}>Usuarios</h4>
                </div>
                <div className={selected === 'Facturacion' ? 'active' : ''} onClick={() => handleSelection('Facturacion')}>
                    <FaBookMedical className="icon" />
                    <h4 className={selected === 'Facturacion' ? 'active-text' : ''}>Facturacion</h4>

                </div>
                <div className={selected === 'PuntoDeVenta' ? 'active' : ''} onClick={() => handleSelection('PuntoDeVenta')}>
                    <FaCalendarAlt className="icon" />
                    <h4 className={selected === 'PuntoDeVenta' ? 'active-text' : ''}>Punto de venta</h4>
                </div>
                <div className={selected === 'Contaduria' ? 'active' : ''} onClick={() => handleSelection('Contaduria')}>
                    <FaToolbox className="icon" />
                    <h4 className={selected === 'Contaduria' ? 'active-text' : ''}>Contaduria</h4>
                </div>
                <div className={selected === 'Caja' ? 'active' : ''} onClick={() => handleSelection('Caja')}>
                    <FaMoneyCheckAlt className="icon" />
                    <h4 className={selected === 'Caja' ? 'active-text' : ''}>Caja</h4>
                </div>
            </div>
        </nav>
    );
}

export default Sidebar;