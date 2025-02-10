import React from 'react';
import { Link } from 'react-router-dom';
import './LinkButton.css';

const LinkButton = ({ to, children, className, ...props }) => {
  return (
    <Link to={to} className={`link-button ${className}`} {...props}>
      {children}
    </Link>
  );
};

export default LinkButton;