import React from 'react';
import './Button.css';

const ButtonPrimary = ({ variant = 'primary', type = 'button', children, ...props }) => {
  const buttonClass = `button button-${variant}`;
  
  return (
    <button className={buttonClass} type={type} {...props}>
      {children}
    </button>
  );
}; 
export default ButtonPrimary;
 