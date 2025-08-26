import React, { lazy, Suspense, useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { getUser } from "../../utils/authFunctions";
import "./Sid.css";

const IoIosArrowBack = lazy(() => import("react-icons/io").then(mod => ({ default: mod.IoIosArrowBack })));
const MdNavigateNext = lazy(() => import("react-icons/md").then(mod => ({ default: mod.MdNavigateNext })));
const FaHome = lazy(() => import("react-icons/fa6").then(mod => ({ default: mod.FaHouse })));
const PiChalkboardTeacher = lazy(() => import("react-icons/pi").then(mod => ({ default: mod.PiUsersThree })));
const GiSlicedBread = lazy(() => import("react-icons/gi").then(mod => ({ default: mod.GiSlicedBread })));
const AiOutlineGroup = lazy(() => import("react-icons/ai").then(mod => ({ default: mod.AiOutlineShoppingCart })));
const GrAnalytics = lazy(() => import("react-icons/gr").then(mod => ({ default: mod.GrLineChart })));
const MdLocationPin = lazy(() => import("react-icons/md").then(mod => ({ default: mod.MdStore })));
const FaUserCheck = lazy(() => import("react-icons/fa6").then(mod => ({ default: mod.FaUsers })));
const RiTruckFill = lazy(() => import("react-icons/ri").then(mod => ({ default: mod.RiTruckLine })));
const AiOutlineShopping = lazy(() => import("react-icons/ai").then(mod => ({ default: mod.AiOutlineCalendar })));
const FiSettings = lazy(() => import("react-icons/fi").then(mod => ({ default: mod.FiSettings })));
const BsGraphUp = lazy(() => import("react-icons/bs").then(mod => ({ default: mod.BsGraphUp })));

const SidebarHeader = ({ onToggle, isOpen }) => {
  const currentUser = useMemo(() => getUser(), []);
  
  const userPhoto = currentUser?.photo || "https://res.cloudinary.com/dzizafv5s/image/upload/v1740519413/ga7kshmedsl7hmudb5k2.jpg";
  
  return (
    <header className="sidebar-header">
      <div className="user-profile">
        <img className='user-avatar' src={userPhoto} alt="Perfil" />
        {isOpen && (
          <div className="user-info">
            <span className="user-role">{currentUser?.roles.includes('ROLE_ADMIN') ? 'Administrador' : 'Usuario'}</span>
            <span className="user-name">{currentUser?.username || 'Usuario'}</span>
          </div>
        )}
      </div>
      <Suspense fallback={<span>...</span>}>
        <button className="sidebar-toggle" onClick={onToggle}>
          {isOpen ? <IoIosArrowBack /> : <MdNavigateNext />}
        </button>
      </Suspense>
    </header>
  );
};

const SidebarLink = ({ to, icon, text, hasPermission }) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  
  if (!hasPermission) return null;
  
  return (
    <li className={`nav-item ${isActive ? 'active' : ''}`}>
      <Link to={to} className="nav-link">
        <Suspense fallback={<span className="icon-placeholder"></span>}>
          <span className="nav-icon">{icon}</span>
        </Suspense>
        <span className="nav-text">{text}</span>
        {isActive && <span className="active-indicator"></span>}
      </Link>
    </li>
  );
};

const routePermissions = {
  "/home": ["READ"],
  "/users": ["GESTION_USUARIOS"],
  "/productos": ["GESTION_PRODUCTOS", "VER_INVENTARIO"],
  "/clientes": ["GESTION_CLIENTES"],
  "/sucursales": ["GESTION_SUCURSALES"],
  "/productos-ventas": ["CREAR_VENTAS"],
  "/ventas": ["GESTION_VENTAS"],
  "/despachos": ["GESTION_INGRESOS_SALIDAS"],
  "/reservas": ["RESERVAS"],
  "/gastos": ["VER_REPORTES"],
  "/reportes": ["VER_REPORTES"],
  "/event-manager": ["ROLE_ADMIN"],
  "/configuraciones": ["ROLE_ADMIN"]
};

export const Sidebar = ({ isOpen, toggleSidebar }) => {
  const [isMobile, setIsMobile] = useState(false);
  const currentUser = useMemo(() => getUser(), []);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
      if (window.innerWidth <= 768 && isOpen) {
        toggleSidebar();
      }
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isOpen, toggleSidebar]);

  const hasPermission = (route) => {
    const requiredPermissions = routePermissions[route];
    if (!requiredPermissions) return false;
    
    if (currentUser?.roles.includes("ROLE_ADMIN")) return true;
    
    return requiredPermissions.some(permission => 
      currentUser?.permissions?.includes(permission) || 
      currentUser?.roles?.includes(permission)
    );
  };

  return (
    <nav className={`sidebar ${isOpen ? 'open' : 'close'} ${isMobile ? 'mobile' : ''}`}>
      <div className="sidebar-container">
        <SidebarHeader onToggle={toggleSidebar} isOpen={isOpen} />
        
        <div className="sidebar-menu">
          <ul className="nav-list">
            <li className="nav-group-title">Principal</li>
            <SidebarLink 
              to="/home" 
              icon={<FaHome />} 
              text="Panel de Control" 
              hasPermission={hasPermission("/home")} 
            />
            
            {/* Grupo Gestión */}
            <li className="nav-group-title">Gestión</li>
            <SidebarLink 
              to="/users" 
              icon={<PiChalkboardTeacher />} 
              text="Gestión de Usuarios" 
              hasPermission={hasPermission("/users")} 
            />
            <SidebarLink 
              to="/productos" 
              icon={<GiSlicedBread />} 
              text="Gestión de Inventario" 
              hasPermission={hasPermission("/productos")} 
            />
            <SidebarLink 
              to="/clientes" 
              icon={<FaUserCheck />} 
              text="Gestión de Clientes" 
              hasPermission={hasPermission("/clientes")} 
            />
            <SidebarLink 
              to="/sucursales" 
              icon={<MdLocationPin />} 
              text="Gestión de Sucursales" 
              hasPermission={hasPermission("/sucursales")} 
            />
            
            {/* Grupo Operaciones */}
            <li className="nav-group-title">Operaciones</li>
            <SidebarLink 
              to="/productos-ventas" 
              icon={<GiSlicedBread />} 
              text="Punto de Venta" 
              hasPermission={hasPermission("/productos-ventas")} 
            />
            <SidebarLink 
              to="/ventas" 
              icon={<AiOutlineGroup />} 
              text="Gestión de Ventas" 
              hasPermission={hasPermission("/ventas")} 
            />
            <SidebarLink 
              to="/despachos" 
              icon={<RiTruckFill />} 
              text="Logística y Despachos" 
              hasPermission={hasPermission("/despachos")} 
            />
            <SidebarLink 
              to="/reservas" 
              icon={<AiOutlineShopping />} 
              text="Gestión de Reservas" 
              hasPermission={hasPermission("/reservas")} 
            />
            <SidebarLink 
              to="/event-manager" 
              icon={<AiOutlineShopping />} 
              text="Gestión de Eventos" 
              hasPermission={hasPermission("/event-manager")} 
            />
            
            <li className="nav-group-title">Finanzas</li>
            <SidebarLink 
              to="/gastos" 
              icon={<GrAnalytics />} 
              text="Control de Gastos" 
              hasPermission={hasPermission("/gastos")} 
            />
            <SidebarLink 
              to="/reportes" 
              icon={<BsGraphUp />} 
              text="Reportes Financieros" 
              hasPermission={hasPermission("/reportes")} 
            />
            
            <li className="nav-group-title">Configuración</li>
            <SidebarLink 
              to="/configuraciones" 
              icon={<FiSettings />} 
              text="Configuración del Sistema" 
              hasPermission={hasPermission("/configuraciones")} 
            />
          </ul>
        </div>
        
        <div className="sidebar-footer">
          <div className="app-version">v2.1.0</div>
        </div>
      </div>
    </nav>
  );
};