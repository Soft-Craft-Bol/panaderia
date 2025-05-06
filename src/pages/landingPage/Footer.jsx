import React from 'react';
import { Link } from 'react-router-dom';
import { FaFacebookF, FaInstagram, FaWhatsapp } from 'react-icons/fa';
import inpasedLogo from '../../assets/img/inpased.png';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="main-footer">
      <div className="footer-content">
        <div className="footer-logo">
          <img src={inpasedLogo} alt="Inpased" />
          <p>Panadería artesanal desde 1985</p>
        </div>

        <div className="footer1-links">
          <h3>Enlaces</h3>
          <ul className='ul-footer'>
            <li><Link to="/">Inicio</Link></li>
            <li><Link to="/productos">Productos</Link></li>
            <li><Link to="/nosotros">Nosotros</Link></li>
            <li><Link to="/contacto">Contacto</Link></li>
          </ul>
        </div>

        <div className="footer-contact">
          <h3>Contacto</h3>
          <p>info@inpased.com</p>
          <p>+591 12345678</p>
          <div className="social-icons">
            <a href="#"><FaFacebookF /></a>
            <a href="#"><FaInstagram /></a>
            <a href="#"><FaWhatsapp /></a>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} Inpased. Todos los derechos reservados.</p>
        <p>Desarrollado por <a href="https://www.softcraftbol.com/" target="_blank" rel="noopener noreferrer">SoftCraft</a></p>
      </div>
    </footer>
  );
};

export default Footer;
