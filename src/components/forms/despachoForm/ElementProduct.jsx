import React from "react";
import SelectorProductosPaginado from "../../selected/SelectorProductosPaginado";
import { useProductos } from "../../../hooks/useProductos";

const ElementProduct = ({ index, item, onUpdate, onRemove, isDefault, puntoVentaId }) => {
    const productosHook = puntoVentaId != null
        ? useProductos(puntoVentaId)
        : {
            productos: [],
            loadMore: () => { },
            hasNextPage: false,
            isFetching: false,
            searchTerm: "",
            setSearchTerm: () => { },
        };

    const {
        productos,
        loadMore: loadMoreProductos,
        hasNextPage: hasNextProductos,
        isFetching: isFetchingProductos,
        setSearchTerm
    } = productosHook;

    return (
        <div className="element-product">
            <div className="selector-container">
                <SelectorProductosPaginado
                    productos={productos}
                    value={item.productoId}
                    onChange={(selectedItem) => {
                        if (selectedItem) {
                            onUpdate(index, selectedItem.id, item.cantidad || 1);
                        }
                    }}
                    onLoadMore={loadMoreProductos}
                    hasNextPage={hasNextProductos}
                    isFetchingNextPage={isFetchingProductos}
                    isLoading={false}
                    placeholder="Buscar producto..."
                    onSearch={setSearchTerm}
                    disabled={!puntoVentaId}
                />
            </div>

            <input
                type="number"
                step="any"
                min="0.01"
                className="despacho-input-number"
                placeholder="Cantidad"
                value={item.cantidad || ""}
                onChange={(e) => {
                    const value = parseFloat(e.target.value);
                    onUpdate(index, item.productoId, isNaN(value) ? "" : value);
                }}
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

export default ElementProduct;