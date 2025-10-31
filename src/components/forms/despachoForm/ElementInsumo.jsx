import React from "react";
import SelectorInsumosSucursalPaginado from "../../selected/SelectorInsumosSucursalPaginado";
import { useInsumorSucursalInf } from "../../../hooks/useInsumorSucursalInf";

const ElementInsumo = ({ index, item, onUpdate, onRemove, isDefault, sucursalId }) => {
    const {
        insumos,
        loadMore,
        hasNextPage,
        isFetchingNextPage,
        searchTerm,
        setSearchTerm,
        isFetching,
        refetch
    } = useInsumorSucursalInf(sucursalId, true);
    console.log("SucursalId en ElementInsumo:", insumos);

    const handleInsumoChange = (insumo) => {
        if (insumo) {
            onUpdate(index, 'insumoId', insumo.insumoId);
            // Si ya hay una cantidad, mantenerla, sino poner 1
            if (!item.cantidad) {
                onUpdate(index, 'cantidad', 1);
            }
        }
    };

    const handleCantidadChange = (e) => {
        const value = parseFloat(e.target.value);
        onUpdate(index, 'cantidad', isNaN(value) ? "" : value);
    };

    return (
        <div className="element-insumo">
            <div className="selector-container">
                <SelectorInsumosSucursalPaginado
                    insumos={insumos}
                    value={item.insumoId}
                    onChange={handleInsumoChange}
                    onLoadMore={loadMore}
                    hasNextPage={hasNextPage}
                    isFetchingNextPage={isFetchingNextPage}
                    isLoading={isFetching}
                    placeholder="Buscar insumo..."
                    onSearch={setSearchTerm}
                    disabled={!sucursalId}
                />
            </div>

            <input
                type="number"
                step="any"
                min="0.01"
                className="despacho-input-number"
                placeholder="Cantidad"
                value={item.cantidad || ""}
                onChange={handleCantidadChange}
            />

            {!isDefault && (
                <button
                    type="button"
                    className="btn-cancel"
                    onClick={() => onRemove(index)}
                >
                    X
                </button>
            )}
        </div>
    );
};

export default ElementInsumo;