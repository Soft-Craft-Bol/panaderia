import React from 'react';
import { useQuery } from '@tanstack/react-query';
import SearchInput from './SearchInput';
import './FiltersPanel.css';
import { Button } from '../buttons/Button';
import CustomDatePicker from '../inputs/DatePicker';
import SelectSecondary from '../selected/SelectSecondary';

const FiltersPanel = ({
  filtersConfig,
  filters,
  onFilterChange,
  onResetFilters,
  queryConfigs = {},
  layout = 'auto' // 'auto', 'grid', 'flex-column', 'compact'
}) => {
  // Manejar cambios en inputs regulares
 const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      onFilterChange({ [name]: checked });
    } else {
      onFilterChange({ [name]: value === '' ? null : value });
    }
  };

  // Manejar cambios en selects
  const handleSelectChange = (name, value) => {
    onFilterChange({ [name]: value || null });
  };

  // Manejar cambios en fechas
  const handleDateChange = (date, name) => {
    const formattedDate = date ? date.toISOString().split('T')[0] : null;
    onFilterChange({ [name]: formattedDate });
  };

  // Manejar cambios en búsquedas
  const handleSearchChange = (term, name) => {
    onFilterChange({ [name]: term || null });
  };

  // Manejar cambios en rangos
  const handleRangeChange = (value, name) => {
    onFilterChange({ [name]: value });
  };

  // Cargar datos para selects que necesitan información de API
  const loadQueryData = (queryKey, queryFn) => {
    return useQuery({
      queryKey: [queryKey],
      queryFn: queryFn,
      enabled: !!queryFn
    });
  };

  // Agrupar filtros por tipo para mejor layout
  const searchFilters = filtersConfig.filter(filter => filter.type === 'search');
  const selectFilters = filtersConfig.filter(filter => filter.type === 'select');
  const otherFilters = filtersConfig.filter(filter => 
    !['search', 'select'].includes(filter.type)
  );

  const renderFilter = (filter) => {
    const { type, name, label, options, placeholder, config = {} } = filter;
    
    switch (type) {
      case 'search':
        return (
          <div className="filter-group search-group" key={name}>
            {label && <label className="filter-label">{label}</label>}
            <SearchInput
              placeholder={placeholder || "Buscar..."}
              initialValue={filters[name] || ''}
              onSearch={(term) => handleSearchChange(term, name)}
              debounceTime={config.debounceTime || 400}
              className="filter-search-input"
            />
          </div>
        );
      
      case 'select':
        let selectOptions = [];
        
        // Si tiene opciones directas
        if (config.options) {
          selectOptions = config.options;
        }
        // Si tiene configuración de query, cargar datos
        else if (config.queryKey && config.queryFn) {
          const { data } = loadQueryData(config.queryKey, config.queryFn);
          selectOptions = data || [];
        }
        
        // Si hay un onChange personalizado en la configuración, usarlo
        const handleSelectChange = config.onChange 
          ? (e) => {
              const value = e.target.value === '' ? null : e.target.value;
              config.onChange(value);
            }
          : handleInputChange;
        
        return (
          <div className="filter-group select-group" key={name}>
            {label && <label className="filter-label">{label}</label>}
            <div className="select-with-button">
              <SelectSecondary
                name={name}
                value={filters[name] || ''}
                onChange={handleSelectChange}
                formikCompatible={false}
              >
                <option value="">{placeholder || `Todos los ${label?.toLowerCase() || 'items'}`}</option>
                {selectOptions.map(option => (
                  <option 
                    key={option[config.valueKey || 'id']} 
                    value={option[config.valueKey || 'id']}
                  >
                    {option[config.labelKey || 'nombre']}
                  </option>
                ))}
              </SelectSecondary>
          
              {config.showAddButton && (
                <Button 
                  variant="secondary" 
                  onClick={() => config.onAddButtonClick()}
                  className="filter-add-button"
                  size="small"
                >
                  + Nueva
                </Button>
              )}
            </div>
          </div>
        );
      
      case 'date':
        return (
          <div className="filter-group date-group" key={name}>
            <CustomDatePicker
              label={label}
              selected={filters[name] ? new Date(filters[name]) : null}
              onChange={(date) => handleDateChange(date, name)}
              placeholderText={placeholder || `Seleccione ${label.toLowerCase()}`}
              {...config}
            />
          </div>
        );
      
      case 'checkbox':
        return (
          <div className="filter-group checkbox-group" key={name}>
            <Checkbox
              name={name}
              label={label}
              checked={filters[name] || false}
              onChange={handleInputChange}
              className="filter-checkbox"
            />
          </div>
        );
      
      case 'range':
        return (
          <div className="filter-group range-group" key={name}>
            {label && <label className="filter-label">{label}</label>}
            <RangeSlider
              min={config.min || 0}
              max={config.max || 100}
              value={filters[name] || config.defaultValue || 0}
              onChange={(value) => handleRangeChange(value, name)}
              className="filter-range"
              {...config}
            />
            {config.showValues && (
              <div className="range-values">
                <span>{config.min || 0}</span>
                <span>{filters[name] || config.defaultValue || 0}</span>
                <span>{config.max || 100}</span>
              </div>
            )}
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className={`filters-panel filters-layout-${layout}`}>
      {/* Búsquedas primero */}
      {searchFilters.length > 0 && (
        <div className="filters-row search-filters-row">
          {searchFilters.map(filter => renderFilter(filter))}
        </div>
      )}
      
      {/* Selects y otros filtros */}
      {(selectFilters.length > 0 || otherFilters.length > 0) && (
        <div className="filters-row main-filters-row">
          {selectFilters.map(filter => renderFilter(filter))}
          {otherFilters.map(filter => renderFilter(filter))}
        </div>
      )}
      
      {/* Acciones */}
      {onResetFilters && (
        <div className="filters-row actions-row">
          <div className="filter-actions">
            <Button 
              variant="secondary" 
              onClick={onResetFilters}
              className="reset-filters-button"
              size="small"
            >
              Limpiar Filtros
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FiltersPanel;