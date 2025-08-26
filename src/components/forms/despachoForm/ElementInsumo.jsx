import React from "react";
import { useInsumorSucursalInf } from "../../../hooks/useInsumorSucursalInf";
import SelectorInsumosSucursalPaginado from "../../selected/SelectorInsumosSucursalPaginado";

const ElementInsumo = ({ index, onUpdate, onRemove, isDefault, sucursalId, selectedInsumo }) => {
    const {
        insumos,
        loadMore,
        hasNextPage,
        isFetchingNextPage,
        searchTerm,
        setSearchTerm,
    } = useInsumorSucursalInf(sucursalId);

    return (
        <div className="element-insumo">
            {selectedInsumo ? (
                <div className="insumo-seleccionado">
                    <strong>{selectedInsumo.nombre}</strong>
                    <span style={{ marginLeft: "8px" }}>
                        ({selectedInsumo.cantidad} {selectedInsumo.unidadMedida?.abreviatura || 'unidades'})
                    </span>
                </div>
            ) : (
                <div className="selector-container">
                    <SelectorInsumosSucursalPaginado
                        insumos={insumos}
                        value={null}
                        onChange={(insumo) => {
                            if (insumo) {
                                onUpdate(index, insumo.insumoId, 1, insumo);
                            }
                        }}
                        onLoadMore={loadMore}
                        hasNextPage={hasNextPage}
                        isFetchingNextPage={isFetchingNextPage}
                        isLoading={false}
                        placeholder="Buscar insumo..."
                        onSearch={setSearchTerm}
                        disabled={!sucursalId}
                    />
                </div>
            )}

            {selectedInsumo && (
                <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    className="despacho-input"
                    placeholder="Cantidad"
                    value={selectedInsumo.cantidad}
                    onChange={(e) => {
                        onUpdate(index, null, parseFloat(e.target.value));
                    }}
                />
            )}

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