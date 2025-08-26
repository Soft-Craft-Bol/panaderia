import React from "react";
import SelectorProductosPaginado from "../../selected/SelectorProductosPaginado";
import { useProductos } from "../../../hooks/useProductos";

const ElementProduct = ({ index, onUpdate, onRemove, isDefault, puntoVentaId, selectedProducto }) => {
    const productosHook =
        puntoVentaId != null
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
            {selectedProducto ? (
                <div className="producto-seleccionado">
                    <strong>{selectedProducto.descripcion}</strong>
                    <span style={{ marginLeft: "8px", color: "#666" }}>
                        ({selectedProducto.cantidad} {selectedProducto.unidades})
                    </span>
                </div>
            ) : (
                <div className="selector-container">
                    <SelectorProductosPaginado
                    productos={productos}
                    value={null}
                    onChange={(item) => {
                        if (item) {
                            onUpdate(index, item.id, 1, item); 
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
            )}

            {selectedProducto && (
                <input
                    type="number"
                    min="1"
                    className="despacho-input"
                    placeholder="Cantidad"
                    value={selectedProducto.cantidad}
                    onChange={(e) => {
                        onUpdate(index, null, e.target.value);
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

export default ElementProduct;