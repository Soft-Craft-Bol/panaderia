import React, { useState } from 'react';
import './MovimientoInsumosForm.css';
import SelectorInsumosSucursalPaginado from '../../components/selected/SelectorInsumosSucursalPaginado';
import { useInsumosNoMateriaPrima } from '../../hooks/useInsumosNoMateriaPrima';
import ButtonPrimary from '../../components/buttons/ButtonPrimary';
import CustomDatePicker from '../../components/inputs/DatePicker';
import { getUser } from '../../utils/authFunctions';

const MovimientoInsumosForm = ({ onSubmit, onCancel }) => {
    const currentUser = getUser();
    const sucursalId = currentUser?.sucursal[0]?.id || null;
    
    const [movimiento, setMovimiento] = useState({
        fecha: new Date(),
        tipo: 'ENTRADA', // Solo entrada ahora
        observaciones: '',
        items: []
    });

    const [selectedInsumo, setSelectedInsumo] = useState(null);
    const [cantidad, setCantidad] = useState(1);
    const [esGasto, setEsGasto] = useState(false); // Nuevo estado para materiales de limpieza

    const {
        insumos,
        loadMore,
        hasNextPage,
        isFetchingNextPage,
        searchTerm,
        setSearchTerm,
    } = useInsumosNoMateriaPrima(sucursalId);

    const handleAddItem = () => {
        if (!selectedInsumo || cantidad <= 0) return;

        const tipoInsumo = selectedInsumo.tipo;
        const newItem = {
            insumoId: selectedInsumo.insumoId,
            nombre: selectedInsumo.nombre,
            cantidad: esGasto ? -Math.abs(cantidad) : Math.abs(cantidad), // Negativo si es gasto
            unidadMedida: selectedInsumo.unidadMedida,
            tipo: tipoInsumo,
            esGasto: esGasto,
            afectaStock: tipoInsumo !== 'MATERIAL_LIMPIEZA' // Materiales limpieza no afectan stock
        };

        setMovimiento(prev => ({
            ...prev,
            items: [...prev.items, newItem]
        }));

        setSelectedInsumo(null);
        setCantidad(1);
        setEsGasto(false);
    };

    const handleRemoveItem = (index) => {
        setMovimiento(prev => ({
            ...prev,
            items: prev.items.filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit({
            ...movimiento,
            fecha: movimiento.fecha.toISOString().split('T')[0],
            sucursalId: sucursalId
        });
    };

    return (
        <form className="movimiento-insumos-form" onSubmit={handleSubmit}>
            <div className="form-header">
                <h2>Registro de Insumos Panadería</h2>
                <p>Gestión de productos terminados y materiales</p>
            </div>

            <div className="form-row">
                <div className="form-group">
                    <label>Fecha</label>
                    <CustomDatePicker
                        selected={movimiento.fecha}
                        onChange={(date) => setMovimiento(prev => ({ ...prev, fecha: date }))}
                    />
                </div>
            </div>

            <div className="form-group">
                <label>Observaciones</label>
                <textarea
                    value={movimiento.observaciones}
                    onChange={(e) => setMovimiento(prev => ({ ...prev, observaciones: e.target.value }))}
                    placeholder="Ej: Compra a proveedor X, gasto en limpieza mensual..."
                />
            </div>

            <div className="items-section">
                <h3>Registro de Insumos</h3>
                
                <div className="item-selector">
                    <div className="selector-container">
                        <SelectorInsumosSucursalPaginado
                            insumos={insumos}
                            value={selectedInsumo?.insumoId || null}
                            onChange={setSelectedInsumo}
                            onLoadMore={loadMore}
                            hasNextPage={hasNextPage}
                            isFetchingNextPage={isFetchingNextPage}
                            isLoading={false}
                            placeholder="Buscar insumo..."
                            onSearch={setSearchTerm}
                            disabled={!sucursalId}
                        />
                    </div>

                    <div className="cantidad-input">
                        <label>Cantidad</label>
                        <input
                            type="number"
                            min="0.01"
                            step="0.01"
                            value={cantidad}
                            onChange={(e) => setCantidad(parseFloat(e.target.value) || 0)}
                        />
                    </div>

                    {selectedInsumo?.tipo === 'MATERIAL_LIMPIEZA' && (
                        <div className="gasto-checkbox">
                            <label>
                                <input
                                    type="checkbox"
                                    checked={esGasto}
                                    onChange={(e) => setEsGasto(e.target.checked)}
                                />
                                ¿Es gasto?
                            </label>
                        </div>
                    )}

                    <button
                        type="button"
                        className="btn-add"
                        onClick={handleAddItem}
                        disabled={!selectedInsumo}
                    >
                        {selectedInsumo?.tipo === 'MATERIAL_LIMPIEZA' && esGasto ? 'Registrar Gasto' : 'Agregar'}
                    </button>
                </div>

                <div className="items-list">
                    {movimiento.items.length === 0 ? (
                        <p className="no-items">No hay insumos agregados</p>
                    ) : (
                        <table>
                            <thead>
                                <tr>
                                    <th>Insumo</th>
                                    <th>Cantidad</th>
                                    <th>Tipo</th>
                                    <th>Acción</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {movimiento.items.map((item, index) => (
                                    <tr key={index}>
                                        <td>
                                            {item.nombre} 
                                            {item.tipo === 'PRODUCTO_TERMINADO' && <span className="badge product">Producto</span>}
                                            {item.tipo === 'MATERIAL_LIMPIEZA' && <span className="badge limpieza">Limpieza</span>}
                                            {item.tipo === 'EMPAQUES' && <span className="badge empaque">Empaque</span>}
                                        </td>
                                        <td className={item.esGasto ? 'gasto' : ''}>
                                            {item.esGasto ? '-' : ''}{item.cantidad} {item.unidadMedida?.abreviatura || 'un'}
                                        </td>
                                        <td>
                                            {item.tipo === 'PRODUCTO_TERMINADO' ? 'Stock' : 
                                             item.tipo === 'MATERIAL_LIMPIEZA' ? 'Gasto' : 'Uso'}
                                        </td>
                                        <td>
                                            {item.esGasto ? 'Gasto registrado' : 
                                             item.cantidad > 0 ? 'Entrada almacén' : 'Salida almacén'}
                                        </td>
                                        <td>
                                            <button
                                                type="button"
                                                className="btn-remove"
                                                onClick={() => handleRemoveItem(index)}
                                            >
                                                Eliminar
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            <div className="form-actions">
                <ButtonPrimary type="button" variant="secondary" onClick={onCancel}>
                    Cancelar
                </ButtonPrimary>
                <ButtonPrimary type="submit" disabled={movimiento.items.length === 0}>
                    Registrar Movimiento
                </ButtonPrimary>
            </div>
        </form>
    );
};

export default MovimientoInsumosForm;