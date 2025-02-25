import React, { lazy, Suspense, useMemo } from "react";
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
const FaUserGraduate = lazy(() => import("react-icons/fa").then(mod => ({ default: mod.FaUserGraduate })));
const FaUserCheck = lazy(() => import("react-icons/fa6").then(mod => ({ default: mod.FaUserCheck })));
const TbLogout = lazy(() => import("react-icons/tb").then(mod => ({ default: mod.TbLogout })));
const RiTruckFill = lazy(() => import("react-icons/ri").then(mod => ({ default: mod.RiTruckFill })));
const FaCalendarWeek = lazy(() => import("react-icons/fa").then(mod => ({ default: mod.FaCalendarWeek })));

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
  const { theme, toggleTheme } = useTheme();
  const currentUser = useMemo(() => getUser(), []);

  const hasRole = (role) => currentUser?.roles.includes(role);
  const hasAnyRole = (...roles) => roles.some((role) => currentUser?.roles.includes(role));

  return (
    <nav className={`sidebar ${isOpen ? 'open' : 'close'}`}>
      <div className="menu-bar">
        <SidebarHeader onToggle={toggleSidebar} isOpen={isOpen} />
        <div className="menu">
          <ul className="menu-links">
            <SidebarLink to="/home" icon={<FaHome />} text="Dashboard" hasPermission={hasAnyRole("ROLE_ADMIN", "ROLE_USER", "ROLE_SECRETARIA", "ROLE_VENDEDOR")} />
            <SidebarLink to="/users" icon={<PiChalkboardTeacher />} text="Usuarios" hasPermission={hasAnyRole("ROLE_ADMIN", "ROLE_SECRETARIA")} />
            <SidebarLink to="/productos" icon={<GiSlicedBread />} text="Productos" hasPermission={hasAnyRole("ROLE_ADMIN", "ROLE_PANADERO", "ROLE_VENDEDOR")} />
            <SidebarLink to="/ventas" icon={<AiOutlineGroup />} text="Facturación" hasPermission={hasAnyRole("ROLE_ADMIN", "ROLE_VENDEDOR")} />
            <SidebarLink to="/despachos" icon={<RiTruckFill />} text="Despachos" hasPermission={hasAnyRole("ROLE_ADMIN", "ROLE_VENDEDOR")} />
            <SidebarLink to="/gastos" icon={<GrAnalytics />} text="Gestion de gastos" hasPermission={hasAnyRole("ROLE_ADMIN", "ROLE_SECRETARIA")} />
            <SidebarLink to="/sucursales" icon={<FaUserGraduate />} text="Sucursales" hasPermission={hasAnyRole("ROLE_ADMIN", "ROLE_SECRETARIA")} />
            <SidebarLink to="/clientes" icon={<FaUserCheck />} text="Clientes" hasPermission={hasAnyRole("ROLE_ADMIN", "ROLE_VENDEDOR")} />
            <SidebarLink to="/productos-externos" icon={<GiSlicedBread />} text="Productos" hasPermission={hasAnyRole("ROLE_ADMIN", "ROLE_PANADERO", "ROLE_CLIENTE", )} />
            <SidebarLink to="/carrito" icon={<FaShoppingCart />} text="Carrito" hasPermission={hasAnyRole("ROLE_ADMIN", "ROLE_VENDEDOR", "ROLE_CLIENTE")} />
          </ul>
        </div>
        <div className="bottom-content">
          <SidebarLogout />
          <li className="mode">
            <span className="mode-text text">Modo Oscuro</span>
            <div className="toggle-switch" onClick={toggleTheme}>
              <span className={`switch ${theme === 'dark' ? 'active' : ''}`} />
            </div>
          </li>
        </div>
      </div>
    </nav>
  );
};