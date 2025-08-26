import React, { useState, useEffect } from 'react';
import { FiSearch, FiX } from 'react-icons/fi';
import './SearchInput.css'; 

const SearchInput = ({
  placeholder = "Buscar...",
  onSearch,
  debounceTime = 400,
  initialValue = "",
  className = ""
}) => {
  const [searchTerm, setSearchTerm] = useState(initialValue);
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    const handler = setTimeout(() => {
      if (searchTerm !== initialValue) {
        onSearch(searchTerm);
      }
      setIsTyping(false);
    }, debounceTime);

    return () => clearTimeout(handler);
  }, [searchTerm, debounceTime, onSearch, initialValue]);

  const handleChange = (e) => {
    setSearchTerm(e.target.value);
    setIsTyping(true);
  };

  const clearSearch = () => {
    setSearchTerm("");
    onSearch("");
  };

  return (
    <div className={`search-container ${className}`}>
      <div className="search-input-wrapper">
        <FiSearch className="search-icon" />
        <input
          type="text"
          value={searchTerm}
          onChange={handleChange}
          placeholder={placeholder}
          className="search-input"
        />
        {searchTerm && (
          <button
            type="button"
            onClick={clearSearch}
            className="clear-search-button"
            aria-label="Limpiar búsqueda"
          >
            <FiX />
          </button>
        )}
      </div>
    </div>
  );
};

export default SearchInput;