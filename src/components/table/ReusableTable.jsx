import React, { useState, useMemo, useEffect } from "react";
import PropTypes from "prop-types";
import "./ReusableTable.css";

const ReusableTable = ({
  columns,
  data,
  loading,
  manualPagination = true, // Siempre true para backend
  manualFilters = true, // Nuevo prop para filtros backend
  manualSortBy = true, // Nuevo prop para ordenación backend
  pageCount = 0,
  currentPage = 1,
  pageSize = 10,
  totalItems = 0,
  onPageChange,
  onPageSizeChange,
  onFilterChange, // Para cambios de filtros
  onSortChange, // Para cambios de ordenación
  onGlobalSearch, // Para búsqueda global
  showGlobalSearch = true,
  showColumnVisibility = true,
  showPagination = true,
  initialFilters = {},
  storageKey = "tableHiddenColumns",
}) => {


  const loadHiddenColumns = () => {
    try {
      const saved = localStorage.getItem(storageKey);
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error("Error loading hidden columns from localStorage:", error);
      return [];
    }
  };


  const [searchTerm, setSearchTerm] = useState("");
  const [isColumnMenuOpen, setIsColumnMenuOpen] = useState(false);
  const [localFilters, setLocalFilters] = useState(initialFilters);
  const [hiddenColumns, setHiddenColumns] = useState(loadHiddenColumns());

  // Función para manejar búsqueda global
  const handleGlobalSearch = (term) => {
    setSearchTerm(term);
    onGlobalSearch(term);
  };

  const handleFilterChange = (columnId, value) => {
    const newFilters = {
      ...localFilters,
      [columnId]: value === "all" ? null : value
    };
    setLocalFilters(newFilters);
    onFilterChange(newFilters);
  };

  // Función para manejar ordenación
  const handleSort = (columnId) => {
    const isCurrent = localFilters.sortBy === columnId;
    const direction = isCurrent && localFilters.sortDirection === "asc" ? "desc" : "asc";

    const newFilters = {
      ...localFilters,
      sortBy: columnId,
      sortDirection: direction
    };

    setLocalFilters(newFilters);
    onSortChange(newFilters);
  };

  useEffect(() => {
  // Cargar columnas ocultas al montar el componente
  const savedHiddenColumns = loadHiddenColumns();
  if (savedHiddenColumns.length > 0) {
    setHiddenColumns(savedHiddenColumns);
  }
}, []);

useEffect(() => {
  // Guardar columnas ocultas cuando cambian
  try {
    localStorage.setItem(storageKey, JSON.stringify(hiddenColumns));
  } catch (error) {
    console.error("Error saving hidden columns to localStorage:", error);
  }
}, [hiddenColumns, storageKey]);

  // Función para alternar la visibilidad de columnas
  const toggleColumnVisibility = (columnAccessor) => {
    setHiddenColumns(prev =>
      prev.includes(columnAccessor)
        ? prev.filter(col => col !== columnAccessor)
        : [...prev, columnAccessor]
    );
  };

  // Renderizar controles de filtro
  const renderFilterControl = (column) => {
    if (!column.filterable) return null;

    if (column.filterType === "select") {
      return (
        <select
          value={localFilters[column.accessor] || "all"}
          onChange={(e) => handleFilterChange(column.accessor, e.target.value)}
          className="column-filter-select"
        >
          <option value="all">Todos</option>
          {column.filterOptions?.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      );
    }

    return (
      <input
        type="text"
        placeholder={`Filtrar ${column.Header}`}
        value={localFilters[column.accessor] || ""}
        onChange={(e) => handleFilterChange(column.accessor, e.target.value)}
        className="column-filter-input"
      />
    );
  };

  // Resetear todos los filtros
  const resetFilters = () => {
    setSearchTerm("");
    setLocalFilters({});
    onGlobalSearch("");
    onFilterChange({});
  };

  return (
    <div className="reusable-table-container">
      <div className="table-controls">
        {showGlobalSearch && (
          <div className="search-control">
            <input
              type="text"
              placeholder="Buscar en toda la tabla..."
              value={searchTerm}
              onChange={(e) => handleGlobalSearch(e.target.value)}
              className="search-input"
            />
            <button
              className="reset-filters-btn"
              onClick={resetFilters}
              disabled={!searchTerm && Object.keys(localFilters).length === 0}
            >
              Limpiar filtros
            </button>
          </div>
        )}

        <div className="right-controls">
          {showColumnVisibility && (
            <>
              {isColumnMenuOpen && (
                <div
                  className="modal-overlay"
                  onClick={() => setIsColumnMenuOpen(false)}
                />
              )}
              <div className="column-visibility-control">
                <button
                  className="column-toggle-btn"
                  onClick={() => setIsColumnMenuOpen(!isColumnMenuOpen)}>
                  Columnas{" "}
                  <span
                    className={`dropdown-arrow ${isColumnMenuOpen ? "open" : ""
                      }`}>
                    ▼
                  </span>
                </button>
                {isColumnMenuOpen && (
                  <div className="column-visibility-menu">
                    {columns.map((column) => (
                      <div
                        key={column.accessor}
                        className="column-visibility-item">
                        <label>
                          {column.Header}
                          <input
                            type="checkbox"
                            checked={!hiddenColumns.includes(column.accessor)}
                            onChange={() => toggleColumnVisibility(column.accessor)}
                          />
                          <span className="slider"></span>
                        </label>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      <div className="table-responsive">
        <table className="reusable-table">
          <thead>
            <tr>
              {columns.map((column) => {
                if (hiddenColumns.includes(column.accessor)) return null;

                return (
                  <th key={column.accessor}>
                    <div className="header-content">
                      <div className="header-title">
                        <span
                          onClick={() => column.sortable && handleSort(column.accessor)}
                          className={column.sortable ? "sortable" : ""}
                        >
                          {column.Header}
                          {localFilters.sortBy === column.accessor && (
                            <span className="sort-icon">
                              {localFilters.sortDirection === "asc" ? "↑" : "↓"}
                            </span>
                          )}
                        </span>
                      </div>
                      {column.filterable && renderFilterControl(column)}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={columns.length} className="loading-data">
                  Cargando datos...
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="no-data">
                  No se encontraron registros
                </td>
              </tr>
            ) : (
              data.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {columns.map((column) => {
                    if (hiddenColumns.includes(column.accessor)) return null;

                    return (
                      <td key={`${rowIndex}-${column.accessor}`}>
                        {column.Cell
                          ? column.Cell({ value: row[column.accessor], row })
                          : row[column.accessor]}
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showPagination && (
        <div className="pagination-container">
          <div className="page-size-control">
            Filas por página:
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
            >
              {[10, 25, 50, 100].map(size => (
                <option key={size} value={size}>{size}</option>
              ))}
            </select>
            Total: {totalItems} registros
          </div>

          <div className="pagination">
            <button
              onClick={() => onPageChange(1)}
              disabled={currentPage === 1}
            >
              « Primera
            </button>
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              ‹ Anterior
            </button>

            <span className="page-info">
              Página {currentPage} de {pageCount}
            </span>

            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage >= pageCount}
            >
              Siguiente ›
            </button>
            <button
              onClick={() => onPageChange(pageCount)}
              disabled={currentPage >= pageCount}
            >
              Última »
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

ReusableTable.propTypes = {
  columns: PropTypes.arrayOf(
    PropTypes.shape({
      Header: PropTypes.string.isRequired,
      accessor: PropTypes.string.isRequired,
      sortable: PropTypes.bool,
      filterable: PropTypes.bool,
      filterType: PropTypes.oneOf(["text", "select"]),
      filterOptions: PropTypes.arrayOf(
        PropTypes.shape({
          value: PropTypes.string.isRequired,
          label: PropTypes.string.isRequired,
        })
      ),
      Cell: PropTypes.func,
    })
  ).isRequired,
  data: PropTypes.array.isRequired,
  loading: PropTypes.bool,
  manualPagination: PropTypes.bool,
  manualFilters: PropTypes.bool,
  manualSortBy: PropTypes.bool,
  pageCount: PropTypes.number,
  currentPage: PropTypes.number,
  pageSize: PropTypes.number,
  totalItems: PropTypes.number,
  onPageChange: PropTypes.func.isRequired,
  onPageSizeChange: PropTypes.func.isRequired,
  onFilterChange: PropTypes.func.isRequired,
  onSortChange: PropTypes.func.isRequired,
  onGlobalSearch: PropTypes.func.isRequired,
  showGlobalSearch: PropTypes.bool,
  showColumnVisibility: PropTypes.bool,
  showPagination: PropTypes.bool,
  initialFilters: PropTypes.object,
  storageKey: PropTypes.string, // Nueva prop para la clave de localStorage
};

ReusableTable.defaultProps = {
  loading: false,
  manualPagination: true,
  manualFilters: true,
  manualSortBy: true,
  pageCount: 0,
  currentPage: 1,
  pageSize: 10,
  totalItems: 0,
  showGlobalSearch: true,
  showColumnVisibility: true,
  showPagination: true,
  initialFilters: {},
  storageKey: "tableHiddenColumns",
};

export default ReusableTable;