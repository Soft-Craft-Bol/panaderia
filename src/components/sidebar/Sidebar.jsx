import { useState } from 'react';
import { FaHome, FaUsers, FaBookMedical, FaToolbox, FaCalendarWeek, FaMoneyCheckAlt, MdPlace } from "../../hooks/icons";
import ImagesApp from '../../assets/ImagesApp';
import SidebarItem from '../sidebarItem/SidebarItem';
import './Sidebar.css';

const menuItems = [
    { title: 'Inicio', icon: FaHome, route: '/home' },
    { title: 'Usuarios', icon: FaUsers, route: '/users' },
    { title: 'Facturación', icon: FaBookMedical, route: '/facturacion' },
    { title: 'Horarios', icon: FaCalendarWeek, route: '/horario' },
    { title: 'Contaduría', icon: FaToolbox, route: '/contaduria' },
    { title: 'Caja', icon: FaMoneyCheckAlt, route: '/caja' },
    { title: 'Productos', route: '/productos'},
    { title: 'Sucursales', icon: MdPlace, route: '/sucursales' },
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