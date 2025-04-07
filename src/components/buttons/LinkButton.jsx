import React from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../../hooks/useTheme'; // Asume que tienes un hook de tema
import './LinkButton.css';

const LinkButton = ({ 
  to, 
  children, 
  onClick, 
  className = '', 
  variant = 'primary',
  ...props 
}) => {
  const { theme } = useTheme();
  
  return (
    <Link
      to={to}
      className={`link-button ${variant} ${className} ${theme}`}
      onClick={onClick}
      {...props}
    >
      {children}
    </Link>
  );
};

export default React.memo(LinkButton);