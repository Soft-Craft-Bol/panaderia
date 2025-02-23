import React, { useState } from "react";
import "./SearchAndFilters.css";

const SearchAndFilters = ({ columns, onSearch, onFilter }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({});

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    onSearch(value); // Pasar el término de búsqueda al componente padre
  };

  const handleFilterChange = (column, value) => {
    const newFilters = { ...filters, [column.accessor]: value };
    setFilters(newFilters);
    onFilter(newFilters); // Pasar los filtros al componente padre
  };

  return (
    <div className="search-and-filters">
      {/* Campo de búsqueda global */}
      <div className="search-container">
        <input
          type="text"
          placeholder="Buscar en todas las columnas..."
          value={searchTerm}
          onChange={handleSearchChange}
        />
      </div>

      {/* Selectores de filtro solo para columnas con filterOptions */}
      <div className="filters-container">
        {columns
          .filter((column) => column.filterOptions) // Solo columnas con filterOptions
          .map((column) => (
            <div key={`${column.header}-${column.accessor}`} className="filter">
              <label>{column.header}</label>
              <select
                onChange={(e) => handleFilterChange(column, e.target.value)}
              >
                <option value="">Todos</option>
                {column.filterOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          ))}
      </div>
    </div>
  );
};

export default SearchAndFilters;