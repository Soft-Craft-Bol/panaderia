import { useState, useRef, useEffect } from 'react';
import { FiChevronDown } from 'react-icons/fi';
import './SelectorInsumosPaginado.css';

const SelectorInsumosGenericosPaginado = ({ 
  insumosGenericos = [], 
  value, 
  onChange, 
  onLoadMore, 
  hasNextPage, 
  isFetchingNextPage, 
  isLoading,
  placeholder = "Seleccione un insumo genérico",
  onSearch
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedInsumoData, setSelectedInsumoData] = useState(null);
  const dropdownRef = useRef(null);
  const listRef = useRef(null);
  const searchInputRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

useEffect(() => {
  if (value && Array.isArray(insumosGenericos)) {
    const selected = insumosGenericos.find(insumo => insumo.id === value);
    setSelectedInsumoData(selected || null);
  } else {
    setSelectedInsumoData(null);
  }
}, [value, insumosGenericos]);


  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    const isNearBottom = scrollTop + clientHeight >= scrollHeight - 50;

    if (isNearBottom && hasNextPage && !isFetchingNextPage) {
      onLoadMore();
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (onSearch) {
        onSearch(searchTerm);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, onSearch]);

  const handleSelect = (insumo) => {
    setSelectedInsumoData(insumo);
    onChange(insumo);
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleOpenDropdown = () => {
    setIsOpen(!isOpen);
    if (!isOpen && searchTerm) {
      setSearchTerm('');
      if (onSearch) {
        onSearch('');
      }
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const displayValue = selectedInsumoData ? selectedInsumoData.nombre : placeholder;

  return (
    <div className="selector-insumos-container" ref={dropdownRef}>
      <div 
        className={`selector-trigger ${isOpen ? 'open' : ''}`}
        onClick={handleOpenDropdown}
      >
        <span className="selector-value">
          {displayValue}
        </span>
        <FiChevronDown 
          className={`selector-icon ${isOpen ? 'rotated' : ''}`}
          size={20} 
        />
      </div>

      {isOpen && (
        <div className="selector-dropdown">
          <div className="search-container">
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Buscar insumo genérico..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="search-input"
              onClick={(e) => e.stopPropagation()}
            />
          </div>

          <div 
            className="selector-list" 
            ref={listRef}
            onScroll={handleScroll}
          >
            {isLoading && insumosGenericos.length === 0 ? (
              <div className="loading-item">Cargando insumos genéricos...</div>
            ) : (
              <>
                {insumosGenericos.length === 0 ? (
                  <div className="no-results">No se encontraron insumos genéricos</div>
                ) : (
                  <>
                    {insumosGenericos.map((insumo) => (
                      <div
                        key={insumo.id}
                        className={`selector-item ${value === insumo.id ? 'selected' : ''}`}
                        onClick={() => handleSelect(insumo)}
                      >
                        <div className="insumo-info">
                          <span className="insumo-nombre">{insumo.nombre}</span>
                          <div className="insumo-details">
                            <span className="insumo-codigo">Código: {insumo.codigo}</span>
                            {insumo.descripcion && (
                              <span className="insumo-descripcion">{insumo.descripcion}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {isFetchingNextPage && (
                      <div className="loading-more">Cargando más insumos...</div>
                    )}
                    
                    {!hasNextPage && insumosGenericos.length > 0 && (
                      <div className="end-of-list">No hay más insumos genéricos</div>
                    )}
                  </>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SelectorInsumosGenericosPaginado;