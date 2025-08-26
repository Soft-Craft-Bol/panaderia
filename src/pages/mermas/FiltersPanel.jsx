import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getSucursales } from '../../service/api';
import ButtonPrimary from '../../components/buttons/ButtonPrimary';
import SelectSecondary from '../../components/selected/SelectSecondary';
import './FiltersPanel.css';

const FiltersPanel = ({ filters, onFilterChange, onResetFilters }) => {
  const { data: sucursales } = useQuery({
    queryKey: ['sucursales'],
    queryFn: () => getSucursales().then(res => res.data)
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    onFilterChange({ [name]: value || '' });
  };

  const formatDateForInput = (date) => {
    if (!date) return '';
    if (typeof date === 'string') return date;
    return date.toISOString().split('T')[0];
  };

  return (
    <div className="filters-panel">
      <div className="filter-group">
        <SelectSecondary
          label="Tipo"
          name="tipo"
          value={filters.tipo || ''}
          onChange={handleInputChange}
          formikCompatible={false}
        >
          <option value="">Todos los tipos</option>
          <option value="MERMA">Merma</option>
          <option value="DONACION">Donación</option>
        </SelectSecondary>
      </div>

      <div className="filter-group">
        <label>Motivo</label>
        <input
          type="text"
          name="motivo"
          value={filters.motivo || ''}
          onChange={handleInputChange}
          placeholder="Buscar por motivo"
          className="native-date-input"
        />
      </div>

      <div className="filter-group">
        <label>Fecha desde</label>
        <input
          type="date"
          name="fechaInicio"
          value={formatDateForInput(filters.fechaInicio)}
          onChange={handleInputChange}
          max={filters.fechaFin ? formatDateForInput(filters.fechaFin) : undefined}
          className="native-date-input"
        />
      </div>

      <div className="filter-group">
        <label>Fecha hasta</label>
        <input
          type="date"
          name="fechaFin"
          value={formatDateForInput(filters.fechaFin)}
          onChange={handleInputChange}
          min={filters.fechaInicio ? formatDateForInput(filters.fechaInicio) : undefined}
          className="native-date-input"
        />
      </div>

      <div className="filter-actions">
        <ButtonPrimary variant="secondary" onClick={onResetFilters}>
          Limpiar Filtros
        </ButtonPrimary>
      </div>
    </div>
  );
};

export default FiltersPanel;
