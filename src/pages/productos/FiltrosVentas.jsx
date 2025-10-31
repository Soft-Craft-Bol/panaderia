import React from 'react';
import SelectSecondary from '../../components/selected/SelectSecondary';
import SearchInput from '../../components/search/SearchInput';
import './FiltrosVentas.css';

const FiltrosVentas = ({
    searchTerm,
    setSearchTerm,
    sortField,
    setSortField,
    categoriasOptions,
    categoriaIds,
    setCategoriaIds,
    conDescuento,
    setConDescuento,
    sinStock,
    setSinStock,
}) => {

    const handleCategoryChange = (catValue) => {
        if (catValue === null) {
            setCategoriaIds([]);
            return;
        }
        if (categoriaIds.includes(catValue)) {
            setCategoriaIds(categoriaIds.filter(id => id !== catValue));
        } else {
            setCategoriaIds([...categoriaIds, catValue]);
        }
    };

    return (
        <div className="ventas-header">
            <div className="search-box">
                <SearchInput
                    placeholder="Buscar producto..."
                    onSearch={setSearchTerm}
                    debounceTime={400}
                    initialValue={searchTerm}
                />
                <div className="filters-container">
                    <div className="filters-group">
                        <SelectSecondary
                            name="sortField"
                            label="Ordenar por"
                            formikCompatible={false}
                            value={sortField}
                            onChange={(e) => setSortField(e.target.value)}
                        >
                            <option value="descripcion,asc">Nombre (A-Z)</option>
                            <option value="descripcion,desc">Nombre (Z-A)</option>
                            <option value="cantidadDisponible,desc">Mayor stock</option>
                            <option value="cantidadDisponible,asc">Menor stock</option>
                            <option value="precioUnitario,desc">Precio ↑</option>
                            <option value="precioUnitario,asc">Precio ↓</option>
                        </SelectSecondary>

                        <div className="category-tabs">
                            {categoriasOptions.map(cat => (
                                <button
                                    key={cat.value}
                                    className={`category-tab ${categoriaIds.includes(cat.value) ? 'active' : ''}`}
                                    onClick={() => handleCategoryChange(cat.value)}
                                >
                                    {cat.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="filters-group">
                        <div className="checkbox-filters">
                            <label className="filter-checkbox">
                                <input
                                    type="checkbox"
                                    checked={conDescuento === true}
                                    onChange={() => setConDescuento(conDescuento === true ? null : true)}
                                />
                                Con descuento
                            </label>

                            <label className="filter-checkbox">
                                <input
                                    type="checkbox"
                                    checked={sinStock}
                                    onChange={() => setSinStock(!sinStock)}
                                />
                                Sin stock
                            </label>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FiltrosVentas;