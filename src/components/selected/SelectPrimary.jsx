import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useField } from 'formik';
import './SelectPrimary.css';

function SelectPrimary({ label, required, onChange, ...props }) {
  const [field, meta, helpers] = useField(props);
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const selectRef = useRef(null);
  const options = React.Children.toArray(props.children);

  // Memoizar el cálculo de opciones filtradas
  const filteredOptions = useCallback(() => {
    if (!searchQuery) return options;
    
    const query = searchQuery.toLowerCase();
    return options.filter(option => {
      if (!option.props || !option.props.children) return false;
      const optionText = String(option.props.children);
      return optionText.toLowerCase().includes(query);
    });
  }, [searchQuery, options]);

  const handleKeyDown = (e) => {
    if (['Tab', 'Enter', 'ArrowUp', 'ArrowDown', 'Escape'].includes(e.key)) {
      return;
    }
    
    if (!isOpen) setIsOpen(true);
    
    if (e.key === 'Backspace') {
      setSearchQuery(prev => prev.slice(0, -1));
    } else if (e.key.length === 1) { 
      setSearchQuery(prev => prev + e.key);
    }
  };

  const handleBlur = useCallback((e) => {
    setTimeout(() => {
      if (selectRef.current && !selectRef.current.contains(document.activeElement)) {
        setIsOpen(false);
        setSearchQuery('');
        field.onBlur(e);
      }
    }, 200);
  }, [field]);

  const handleOptionClick = useCallback((value) => {
    helpers.setValue(value);
    if (onChange) {
      const syntheticEvent = {
        target: {
          name: field.name,
          value: value
        }
      };
      onChange(syntheticEvent);
    }
    setSearchQuery('');
    setIsOpen(false);
  }, [field.name, helpers, onChange]);

  // Valor mostrado en el input
  const displayValue = field.value 
    ? options.find(opt => opt.props.value === field.value)?.props.children || '' 
    : '';

  return (
    <div className="select-component" ref={selectRef}>
      <label htmlFor={props.id || props.name}>
        {label}
        {required && <span className="required">*</span>}
      </label>
      
      <div className="select-container">
        <input
          type="text"
          className="select-search"
          placeholder="Buscar..."
          value={displayValue}
          onFocus={() => setIsOpen(true)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          readOnly
        />
        
        {isOpen && (
          <div className="options-dropdown">
            {searchQuery && <div className="search-info">Buscando: {searchQuery}</div>}
            
            {filteredOptions().length > 0 ? (
              filteredOptions().map((option, idx) => (
                <div 
                  key={option.props.value || idx}
                  className={`option-item ${field.value === option.props.value ? 'selected' : ''}`}
                  onMouseDown={() => handleOptionClick(option.props.value)}
                >
                  {option.props.children}
                </div>
              ))
            ) : (
              <div className="no-results">No se encontraron coincidencias</div>
            )}
          </div>
        )}
        <select
          {...field}
          {...props}
          className="hidden-select"
          style={{ display: 'none' }}
        />
      </div>
      
      {meta.touched && meta.error ? (
        <div className="error-message">{meta.error}</div>
      ) : null}
    </div>
  );
}

export default React.memo(SelectPrimary);