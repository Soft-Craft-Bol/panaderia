import React from 'react';
import './Button.css';
import usePermissions from '../../hooks/usePermissions';

export const Button = ({ 
  variant = 'primary', 
  type = 'button', 
  className = '', 
  disabled = false,
  requiredPermissions = [], 
  hiddenWithoutPermission = true,
  children, 
  ...props 
}) => {
  const { hasPermission } = usePermissions();
  const buttonClass = `button button-${variant} ${className}`.trim();

  if (requiredPermissions.length > 0 && !hasPermission(requiredPermissions)) {
    return hiddenWithoutPermission ? null : (
      <button 
        className={`${buttonClass} button-disabled`} 
        type={type} 
        disabled={true}
        {...props}
      >
        {children}
      </button>
    );
  }

  return (
    <button 
      className={buttonClass} 
      type={type} 
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};