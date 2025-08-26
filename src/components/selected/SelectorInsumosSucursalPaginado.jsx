import { useState, useRef, useEffect } from 'react';
import { FiChevronDown } from 'react-icons/fi';
import './SelectorInsumosPaginado.css';

const SelectorInsumosSucursalPaginado = ({ 
  insumos = [], 
  value, 
  onChange, 
  onLoadMore, 
  hasNextPage, 
  isFetchingNextPage, 
  isLoading,
  placeholder = "Seleccione un insumo",
  onSearch,
  disabled
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);
  const listRef = useRef(null);
  const searchInputRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm('');
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
    onChange(insumo);
    setIsOpen(false);
    setSearchTerm('');
  };

  const selectedInsumo = insumos.find(i => i.insumoId === value);

  return (
    <div className="selector-insumos-container" ref={dropdownRef}>
      <div 
        className={`selector-trigger ${isOpen ? 'open' : ''} ${disabled ? 'disabled' : ''}`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        <span className="selector-value">
          {selectedInsumo ? `${selectedInsumo.nombre} (${selectedInsumo.cantidad} ${selectedInsumo.unidades})` : placeholder}
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
              placeholder="Buscar insumo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
              onClick={(e) => e.stopPropagation()}
            />
          </div>

          <div 
            className="selector-list" 
            ref={listRef}
            onScroll={handleScroll}
          >
            {isLoading && insumos.length === 0 ? (
              <div className="loading-item">Cargando insumos...</div>
            ) : (
              <>
                {insumos.length === 0 ? (
                  <div className="no-results">No se encontraron insumos</div>
                ) : (
                  <>
                    {insumos.map((insumo, index) => (
                      <div
                        key={index}
                        className={`selector-item ${value === insumo.insumoId ? 'selected' : ''}`}
                        onClick={() => handleSelect(insumo)}
                      >
                        <div className="insumo-info">
                          <div className="insumo-header">
                            <span className="insumo-nombre">{insumo.nombre}</span>
                            <span className="insumo-stock">
                              {insumo.cantidad} {insumo.unidades}
                              {insumo.stockMinimo && (
                                <span className="insumo-minimo"> (Mín: {insumo.stockMinimo})</span>
                              )}
                            </span>
                          </div>
                          <div className="insumo-details">
                            <span className="insumo-tipo">{insumo.tipo}</span>
                            {insumo.fechaVencimiento && (
                              <span className="insumo-vencimiento">
                                Vence: {new Date(insumo.fechaVencimiento).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {isFetchingNextPage && (
                      <div className="loading-more">Cargando más insumos...</div>
                    )}
                    
                    {!hasNextPage && insumos.length > 0 && (
                      <div className="end-of-list">No hay más insumos</div>
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

export default SelectorInsumosSucursalPaginado;