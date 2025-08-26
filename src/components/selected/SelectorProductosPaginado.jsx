import { useState, useRef, useEffect } from 'react';
import { FiChevronDown } from 'react-icons/fi';
import './SelectorInsumosPaginado.css'; 

const SelectorProductosPaginado = ({ 
  productos = [], 
  value, 
  onChange, 
  onLoadMore, 
  hasNextPage, 
  isFetchingNextPage, 
  isLoading,
  placeholder = "Seleccione un producto",
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

  const handleSelect = (producto) => {
    onChange(producto);
    setIsOpen(false);
    setSearchTerm('');
  };

  const selectedProducto = productos.find(p => p.id === value);

  return (
    <div className="selector-productos-container" ref={dropdownRef}>
      <div 
        className={`selector-trigger ${isOpen ? 'open' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="selector-value">
          {selectedProducto ? `${selectedProducto.codigo} - ${selectedProducto.descripcion}` : placeholder}
        </span>
        <FiChevronDown 
          className={`selector-icon ${isOpen ? 'rotated' : ''}`}
          size={20} 
        />
      </div>

      {isOpen && (
        <div className="selector-dropdown1">
          <div className="search-container">
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Buscar producto..."
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
            {isLoading && productos.length === 0 ? (
              <div className="loading-item">Cargando productos...</div>
            ) : (
              <>
                {productos.length === 0 ? (
                  <div className="no-results">No se encontraron productos</div>
                ) : (
                  <>
                    {productos.map((producto) => (
                      <div
                        key={producto.id}
                        className={`selector-item ${value === producto.id ? 'selected' : ''}`}
                        onClick={() => handleSelect(producto)}
                      >
                        <div className="producto-info">
                          <div className="producto-header">
                            <span className="producto-codigo">{producto.codigo}</span>
                            <span className="producto-stock">Stock: {producto.cantidadDisponible}</span>
                          </div>
                          <span className="producto-descripcion">{producto.descripcion}</span>
                          <div className="producto-details">
                            <span className="producto-precio">Bs. {producto.precioUnitario}</span>
                            {producto.tieneDescuento && (
                              <span className="producto-descuento">(Descuento)</span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {isFetchingNextPage && (
                      <div className="loading-more">Cargando más productos...</div>
                    )}
                    
                    {!hasNextPage && productos.length > 0 && (
                      <div className="end-of-list">No hay más productos</div>
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

export default SelectorProductosPaginado;