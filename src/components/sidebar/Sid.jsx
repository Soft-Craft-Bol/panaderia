import { Link } from 'react-router-dom';
import { useMemo } from 'react';
import './Sid.css';
import { IoIosArrowBack, PiChalkboardTeacher, GrAnalytics, FaUser, MdNavigateNext, FaHome,
   FaUserGraduate, TbLogout, AiOutlineGroup, FaCalendarAlt, GiSlicedBread  } from '../../hooks/icons';
import { useTheme } from '../../hooks/useTheme';
import { signOut, getUser } from '../../utils/authFunctions';
import ImagenesApp from '../../assets/ImagesApp';
import { FaUserCheck } from 'react-icons/fa6';

const SidebarHeader = ({ onToggle, isOpen }) => {
  
  const currentUser = useMemo(() => getUser(), []);
  /* const isAdmin = useMemo(() => currentUser?.roles.includes("INVITED"), [currentUser]); */

  return (
    <header className="sidebar-header">
      <div className="text logo">
        <img className='logo-perfil' src={ImagenesApp.logo} alt="Perfil" />
        {/* <span className="name">{currentUser?.roles.includes('Administrador') ? 'Administrador' : 'Usuario'}</span> */}
        {/* <span className="profe">{currentUser?.username || 'Usuario'}</span> */}
      </div>
      {isOpen ? (
        <IoIosArrowBack className="toggle" onClick={onToggle} />
      ) : (
        <MdNavigateNext className="toggle reverse" onClick={onToggle} />
      )}
    </header>
  );
};

export default SidebarHeader;

const SidebarLink = ({ to, icon, text }) => (
  <li className="nav-link">
    <Link to={to}>
      <i className="icon">{icon}</i>
      <span className="text nav-text">{text}</span>
    </Link>
  </li>
);

export const SidebarSearch = () => (
  <li className="search-box">
    <i className="bx bx-search icon"></i>
    <input type="text" placeholder="Buscar..." />
  </li>
);

const SidebarLogout = () => (
  <li>
    <Link to="/" onClick={signOut}>
      <i className="icon"><TbLogout /></i>
      <span className="text nav-text">Cerrar sesión</span>
    </Link>
  </li>
);

const SidebarThemeToggle = ({ theme, toggleTheme }) => (
  <li className="mode">
    <div className="sun-moon">
      <i className={`icon moon ${theme === 'dark' ? 'active' : ''}`} />
      <i className={`icon sun ${theme === 'light' ? 'active' : ''}`} />
    </div>
    <span className="mode-text text">Modo Oscuro</span>
    <div className="toggle-switch" onClick={toggleTheme}>
      <span className={`switch ${theme === 'dark' ? 'active' : ''}`} />
    </div>
  </li>
);

export const Sidebar = ({ isOpen, toggleSidebar }) => {
  const { theme, toggleTheme } = useTheme();
  const currentUser = useMemo(() => getUser(), []);
  /* const isAdmin = useMemo(() => currentUser?.roles.includes("Administrador"), [currentUser]); */

  return (

    <nav className={`sidebar ${isOpen ? 'open' : 'close'}`}>
      <div className="menu-bar">
        <SidebarHeader onToggle={toggleSidebar} isOpen={isOpen} />
        <div className="menu">
          <ul className="menu-links">
          {/* {
              isAdmin && (
                
              )
            } */}<SidebarLink to="/registerUser" icon={<PiChalkboardTeacher />} text="Usuarios" />

            <SidebarLink to="/home" icon={<FaHome />} text="Dashboard" />
            <SidebarLink to="/horario" icon={<FaUser/>} text="Horarios" />
            <SidebarLink to="/productos" icon={<GiSlicedBread />} text="Productos" />
            <SidebarLink to="/facturacion" icon={<AiOutlineGroup />} text="Facturacion" />
            <SidebarLink to="/punto-de-venta" icon={<FaCalendarAlt />} text="Punto de venta" />
            <SidebarLink to="/contaduria" icon={<GrAnalytics />} text="Contaduria" />
            <SidebarLink to="/me-gustas" icon={<FaUserGraduate />} text="Reportes" />
            <SidebarLink to="/clientes/add" icon={<FaUserCheck />} text="Clientes" />
          </ul>
        </div>
        <div className="bottom-content">
          <SidebarLogout />
          <SidebarThemeToggle theme={theme} toggleTheme={toggleTheme} />
        </div>
      </div>
    </nav>
  );
};
