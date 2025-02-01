import { useState } from 'react';
import { FaHome, FaUsers, FaBookMedical, FaCalendarAlt, FaToolbox, FaMoneyCheckAlt } from "react-icons/fa";
import ImagesApp from '../../assets/ImagesApp';
import SidebarItem from '../sidebarItem/SidebarItem';
import './Sidebar.css';

const menuItems = [
    { title: 'Inicio', icon: FaHome, route: '/' },
    { title: 'Sucursales', icon: FaHome, route: '/sucursales' },
    { title: 'Usuarios', icon: FaUsers, route: '/users' },
    { title: 'Facturación', icon: FaBookMedical, route: '/facturacion' },
    { title: 'Punto de Venta', icon: FaCalendarAlt, route: '/punto-de-venta' },
    { title: 'Contaduría', icon: FaToolbox, route: '/contaduria' },
    { title: 'Caja', icon: FaMoneyCheckAlt, route: '/caja' }
];

const Sidebar = () => {
    const [selected, setSelected] = useState('Inicio');

    return (
        <nav className='sidebar-container'>
            <img src={ImagesApp.sidebarImg} alt="Sidebar Logo" />
            <div className="sidebar-menu">
                {menuItems.map(item => (
                    <SidebarItem 
                        key={item.title} 
                        {...item} 
                        selected={selected} 
                        onSelect={setSelected} 
                    />
                ))}
            </div>
        </nav>
    );
};

export default Sidebar;