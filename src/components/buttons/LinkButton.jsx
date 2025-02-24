import React from 'react';
import { Link } from 'react-router-dom';
import './LinkButton.css';

const LinkButton = ({ to, children, onClick, className, ...props }) => {
  return (
    <Link to={to} className={`link-button ${className}`} onClick={onClick} {...props}>
      {children}
    </Link>
  );
};

export default LinkButton;