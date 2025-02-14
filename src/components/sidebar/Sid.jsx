import React, { lazy, Suspense, useMemo } from "react";
import { Link } from "react-router-dom";
import { useTheme } from "../../hooks/useTheme";
import { signOut, getUser } from "../../utils/authFunctions";
import "./Sid.css";

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

const SidebarHeader = ({ onToggle, isOpen }) => {
  const currentUser = useMemo(() => getUser(), []);
  //console.log(currentUser)
  return (
    <header className="sidebar-header">
      <div className="text logo">
        <img className='logo-perfil' src={currentUser.photo} alt="Perfil" />
        <span className="name">{currentUser?.roles.includes('Administrador') ? 'Administrador' : 'Usuario'}</span>
        <span className="profe">{currentUser?.username || 'Usuario'}</span>
      </div>
      <Suspense fallback={<span>...</span>}>
        {isOpen ? <IoIosArrowBack className="toggle" onClick={onToggle} /> : <MdNavigateNext className="toggle reverse" onClick={onToggle} />}
      </Suspense>
    </header>
  );
};

const SidebarLink = ({ to, icon, text }) => (
  <li className="nav-link">
    <Link to={to}>
      <Suspense fallback={<span>...</span>}>
        <i className="icon">{icon}</i>
      </Suspense>
      <span className="text nav-text">{text}</span>
    </Link>
  </li>
);

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
  return (
    <nav className={`sidebar ${isOpen ? 'open' : 'close'}`}>
      <div className="menu-bar">
        <SidebarHeader onToggle={toggleSidebar} isOpen={isOpen} />
        <div className="menu">
          <ul className="menu-links">
            <SidebarLink to="/home" icon={<FaHome />} text="Dashboard" />
            <SidebarLink to="/users" icon={<PiChalkboardTeacher />} text="Usuarios" />
            <SidebarLink to="/productos" icon={<GiSlicedBread />} text="Productos" />
            <SidebarLink to="/ventas" icon={<AiOutlineGroup />} text="Facturación" />
            <SidebarLink to="/despachos" icon={<RiTruckFill />} text="Despachos" />
            <SidebarLink to="/contaduria" icon={<GrAnalytics />} text="Contaduría" />
            <SidebarLink to="/reportes" icon={<FaUserGraduate />} text="Reportes" />
            <SidebarLink to="/clientes" icon={<FaUserCheck />} text="Clientes" />
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
