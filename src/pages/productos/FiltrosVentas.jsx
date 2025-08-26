import React from 'react';
import { FaCashRegister } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import SelectSecondary from '../../components/selected/SelectSecondary';
import SearchInput from '../../components/search/SearchInput';
import './FiltrosVentas.css';

const FiltrosVentas = ({
    searchTerm,
    setSearchTerm,
    sortField,
    setSortField,
    categoriasOptions,
    categoriaId,
    setCategoriaId,
    codigoProductoSin,
    setCodigoProductoSin,
    conDescuento,
    setConDescuento,
    sinStock,
    setSinStock,
    categories
}) => {
    const navigate = useNavigate();

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
                            <option value="cantidadDisponible,desc">Mayor stock</option>
                            <option value="cantidadDisponible,asc">Menor stock</option>
                            <option value="precioUnitario,desc">Precio ↑</option>
                            <option value="precioUnitario,asc">Precio ↓</option>
                            <option value="descripcion,asc">Nombre (A-Z)</option>
                            <option value="descripcion,desc">Nombre (Z-A)</option>
                        </SelectSecondary>

                        <div className="category-tabs">
                            {categoriasOptions.map(cat => (
                                <button
                                    key={cat.value || 'all'}
                                    className={`category-tab ${!categoriaId && !cat.value ? 'active' : ''} ${categoriaId === cat.value ? 'active' : ''
                                        }`}
                                    onClick={() => setCategoriaId(cat.value ? parseInt(cat.value) : null)}
                                >
                                    {cat.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="filters-group">
                        <SelectSecondary
                            name="codigoProductoSin"
                            label="Código de Producto"
                            value={codigoProductoSin}
                            formikCompatible={false}
                            onChange={(e) => setCodigoProductoSin(e.target.value)}
                        >
                            {categories.map(cat => (
                                <option key={cat.value} value={cat.value}>
                                    {cat.label}
                                </option>
                            ))}
                        </SelectSecondary>

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