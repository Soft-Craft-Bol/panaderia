import React, { lazy, Suspense, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useTheme } from "../../hooks/useTheme";
import { signOut, getUser } from "../../utils/authFunctions";
import "./Sid.css";
import { FaShoppingCart } from "react-icons/fa";

// Carga perezosa de los íconos
const IoIosArrowBack = lazy(() => import("react-icons/io").then(mod => ({ default: mod.IoIosArrowBack })));
const MdNavigateNext = lazy(() => import("react-icons/md").then(mod => ({ default: mod.MdNavigateNext })));
const FaHome = lazy(() => import("react-icons/fa").then(mod => ({ default: mod.FaHome })));
const PiChalkboardTeacher = lazy(() => import("react-icons/pi").then(mod => ({ default: mod.PiChalkboardTeacher })));
const FaUser = lazy(() => import("react-icons/fa").then(mod => ({ default: mod.FaUser })));
const GiSlicedBread = lazy(() => import("react-icons/gi").then(mod => ({ default: mod.GiSlicedBread })));
const AiOutlineGroup = lazy(() => import("react-icons/ai").then(mod => ({ default: mod.AiOutlineGroup })));
const GrAnalytics = lazy(() => import("react-icons/gr").then(mod => ({ default: mod.GrAnalytics })));
const MdLocationPin = lazy(() => import("react-icons/md").then(mod => ({ default: mod.MdLocationPin })));
const FaUserCheck = lazy(() => import("react-icons/fa6").then(mod => ({ default: mod.FaUserCheck })));
const TbLogout = lazy(() => import("react-icons/tb").then(mod => ({ default: mod.TbLogout })));
const RiTruckFill = lazy(() => import("react-icons/ri").then(mod => ({ default: mod.RiTruckFill })));
const AiOutlineShopping  = lazy(() => import("react-icons/ai").then(mod => ({ default: mod.AiOutlineShopping})));

const SidebarHeader = ({ onToggle, isOpen }) => {
  const currentUser = useMemo(() => getUser(), []);
  
  const userPhoto = currentUser?.photo || "https://res.cloudinary.com/dzizafv5s/image/upload/v1740519413/ga7kshmedsl7hmudb5k2.jpg";
  return (
    <header className="sidebar-header">
      <div className="text logo">
        <img className='logo-perfil' src={userPhoto} alt="Perfil"
        style={{minHeight:"70px", minWidth:"70px"}} />
        <span className="name">{currentUser?.roles.includes('ROLE_ADMIN') ? 'Administrador' : 'Usuario'}</span>
        <span className="profe">{currentUser?.username || 'Usuario'}</span>
      </div>
      <Suspense fallback={<span>...</span>}>
        {isOpen ? <IoIosArrowBack className="toggle" onClick={onToggle} /> : <MdNavigateNext className="toggle reverse" onClick={onToggle} />}
      </Suspense>
    </header>
  );
};

const SidebarLink = ({ to, icon, text, hasPermission }) => {
  if (!hasPermission) return null;
  return (
    <li className="nav-link">
      <Link to={to}>
        <Suspense fallback={<span>...</span>}>
          <i className="icon">{icon}</i>
        </Suspense>
        <span className="text nav-text">{text}</span>
      </Link>
    </li>
  );
};

const SidebarLogout = () => (
  <li>
    <Link to="/" onClick={signOut}>
      <Suspense fallback={<span>...</span>}>
        <i className="icon"><TbLogout /></i>
      </Suspense>
      <span className="text nav-text">Cerrar sesión</span>
    </Link>
  </li>
);

export const Sidebar = ({ isOpen, toggleSidebar }) => {

  const [isMobile, setIsMobile] = useState(false);
  const currentUser = useMemo(() => getUser(), []);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const hasAnyRole = (...roles) => roles.some((role) => currentUser?.roles.includes(role));

  return (
    <nav className={`sidebar ${isOpen ? 'open' : 'close'} ${isMobile ? 'mobile' : ''}`}>
      <div className="menu-bar">
        <SidebarHeader onToggle={toggleSidebar} isOpen={isOpen} />
        <div className="menu">
          <ul className="menu-links">

            <SidebarLink to="/home" icon={<FaHome />} text="Dashboard" />
            <SidebarLink to="/users" icon={<PiChalkboardTeacher />} text="Usuarios" />
            <SidebarLink to="/productos" icon={<GiSlicedBread />} text="Productos" />
            <SidebarLink to="/ventas" icon={<AiOutlineGroup />} text="Facturación" />
            <SidebarLink to="/despachos" icon={<RiTruckFill />} text="Despachos" />
            <SidebarLink to="/insumos" icon={<GiSlicedBread />} text="Insumos" />
            <SidebarLink to="/gastos" icon={<GrAnalytics />} text="Gestion de gastos" />
            <SidebarLink to="/sucursales" icon={<MdLocationPin />} text="Sucursales" />
            <SidebarLink to="/clientes" icon={<FaUserCheck />} text="Clientes" />

            <SidebarLink to="/home" icon={<FaHome />} text="Dashboard" hasPermission={hasAnyRole("ROLE_ADMIN", "ROLE_USER", "ROLE_SECRETARIA", "ROLE_VENDEDOR")} />
            <SidebarLink to="/users" icon={<PiChalkboardTeacher />} text="Usuarios" hasPermission={hasAnyRole("ROLE_ADMIN", "ROLE_SECRETARIA")} />
            <SidebarLink to="/productos" icon={<GiSlicedBread />} text="Stock" hasPermission={hasAnyRole("ROLE_ADMIN", "ROLE_PANADERO", "ROLE_VENDEDOR")} />
            <SidebarLink to="/ventas" icon={<AiOutlineGroup />} text="Facturación" hasPermission={hasAnyRole("ROLE_ADMIN", "ROLE_VENDEDOR")} />
            <SidebarLink to="/despachos" icon={<RiTruckFill />} text="Despachos" hasPermission={hasAnyRole("ROLE_ADMIN", "ROLE_VENDEDOR")} />
            <SidebarLink to="/gastos" icon={<GrAnalytics />} text="Gestion de gastos" hasPermission={hasAnyRole("ROLE_ADMIN", "ROLE_SECRETARIA")} />
            <SidebarLink to="/sucursales" icon={<MdLocationPin />} text="Sucursales" hasPermission={hasAnyRole("ROLE_ADMIN", "ROLE_SECRETARIA")} />
            <SidebarLink to="/clientes" icon={<FaUserCheck />} text="Clientes" hasPermission={hasAnyRole("ROLE_ADMIN", "ROLE_VENDEDOR")} />
            <SidebarLink to="/reservas" icon={<AiOutlineShopping/>} text="Reservas" hasPermission={hasAnyRole("ROLE_ADMIN", "ROLE_VENDEDOR")} />
            <SidebarLink to="/productos-externos" icon={<GiSlicedBread />} text="Productos" hasPermission={hasAnyRole("ROLE_ADMIN", "ROLE_PANADERO", "ROLE_CLIENTE", )} />
            <SidebarLink to="/carrito" icon={<FaShoppingCart />} text="Carrito" hasPermission={hasAnyRole("ROLE_ADMIN", "ROLE_VENDEDOR", "ROLE_CLIENTE")} />
            <SidebarLink to="/insumos" icon={<GiSlicedBread />} text="Insumos" hasPermission={hasAnyRole("ROLE_ADMIN", "ROLE_SECRETARIA")} />
            <SidebarLink to="/recetas" icon={<GiSlicedBread />} text="Recetas" hasPermission={hasAnyRole("ROLE_ADMIN", "ROLE_SECRETARIA")} />
            
          </ul>
        </div>
        <div className="bottom-content" style={{marginTop: "20px"}}>
          <SidebarLogout />
        </div>
      </div>
      
    </nav>
  );
};