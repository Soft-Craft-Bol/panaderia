import { useState, useRef, useEffect } from 'react';
import { FiChevronDown } from 'react-icons/fi';
import './SelectorInsumosPaginado.css'; // Reutiliza los mismos estilos

const SelectorRecetasPaginado = ({ 
  recetas = [], 
  value, 
  onChange, 
  onLoadMore, 
  hasNextPage, 
  isFetchingNextPage, 
  isLoading,
  placeholder = "Seleccione una receta",
  onSearch
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

  const handleSelect = (receta) => {
    onChange(receta);
    setIsOpen(false);
    setSearchTerm('');
  };

  const selectedReceta = recetas.find(receta => receta.id === value);

  return (
    <div className="selector-insumos-container" ref={dropdownRef}>
      <div 
        className={`selector-trigger ${isOpen ? 'open' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="selector-value">
          {selectedReceta ? `${selectedReceta.nombre} (${selectedReceta.cantidadUnidades} uds)` : placeholder}
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
              placeholder="Buscar receta..."
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
            {isLoading && recetas.length === 0 ? (
              <div className="loading-item">Cargando recetas...</div>
            ) : (
              <>
                {recetas.length === 0 ? (
                  <div className="no-results">No se encontraron recetas</div>
                ) : (
                  <>
                    {recetas.map((receta) => (
                      <div
                        key={receta.id}
                        className={`selector-item ${value === receta.id ? 'selected' : ''}`}
                        onClick={() => handleSelect(receta)}
                      >
                        <div className="insumo-info">
                          <span className="insumo-nombre">{receta.nombre}</span>
                          <div className="insumo-details">
                            <span className="insumo-tipo">
                              {receta.nombreProducto || `Producto ${receta.productoId}`}
                            </span>
                            <span className="insumo-unidad">
                              {receta.cantidadUnidades} unidades
                            </span>
                            <span className="insumo-stock">
                              {receta.insumos?.length || 0} insumos
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {isFetchingNextPage && (
                      <div className="loading-more">Cargando más recetas...</div>
                    )}
                    
                    {!hasNextPage && recetas.length > 0 && (
                      <div className="end-of-list">No hay más recetas</div>
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

export default SelectorRecetasPaginado;