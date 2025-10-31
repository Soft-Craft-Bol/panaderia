import React, { memo } from "react";
import './ProductoCard.css';
import { getUser } from "../../utils/authFunctions";

const ProductoCard = memo(({ product, addToCart, getCurrentStock }) => {
    const currentUser = getUser();
    if (!currentUser?.puntosVenta || currentUser.puntosVenta.length === 0) {
        alert('No cuenta con sucursales asignadas.');
    }

    const currentStock = getCurrentStock(product);
    const tieneDescuento = product.tieneDescuento || false;
    const precioConDescuento = product.precioConDescuento || product.precioUnitario;
    const discountPercentage = tieneDescuento
        ? Math.round((1 - (precioConDescuento / product.precioUnitario)) * 100)
        : 0;

    const handleAddToCart = () => {
        if (currentStock > 0) addToCart(product);
    };

    return (
        <div
            className={`producto-card ${currentStock < 1 ? 'no-stock' : ''} ${tieneDescuento ? 'has-discount' : ''}`}
            onClick={handleAddToCart}
        >
            {tieneDescuento && (
                <div className="discount-badge">
                    {discountPercentage} % OFF
                </div>
            )}

            <div className="producto-image-container">
                {product.imagen ? (
                    <img
                        src={product.imagen}
                        alt={product.descripcion}
                        className="producto-image"
                        loading="lazy"
                        onError={(e) => {
                            e.target.src = 'https://static.vecteezy.com/system/resources/previews/005/723/771/non_2x/photo-album-icon-image-symbol-or-no-image-flat-design-on-a-white-background-vector.jpg';
                        }}
                    />
                ) : (
                    <div className="producto-image-placeholder">
                        <span>Sin imagen</span>
                    </div>
                )}
            </div>

            <div className="producto-info">
                <h3 className="producto-name">{product.descripcion}</h3>
                <div className="producto-details">
                    <div className="detail-row">
                        <span className="detail-label">Código:</span>
                        <span className="detail-value">{product.codigo}</span>
                    </div>
                    <div className="detail-row">
                        <span className="detail-label">Precio:</span>
                        <div className="price-container">
                            {tieneDescuento && (
                                <span className="original-price">
                                    Bs {product.precioUnitario.toFixed(2)}
                                </span>
                            )}
                            <span className={`detail-value price ${tieneDescuento ? 'discounted' : ''}`}>
                                Bs {precioConDescuento.toFixed(2)}
                            </span>
                        </div>
                    </div>
                    <div className="detail-row">
                        <span className="detail-label">Stock:</span>
                        <span className={`detail-value stock ${currentStock < 5 ? 'low-stock' : ''}`}>
                            {currentStock}
                        </span>
                    </div>
                </div>
            </div>

            {currentStock > 0 && (
                <button className="add-button">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <path d="M12 6V18M6 12H18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                    Agregar
                </button>
            )}
        </div>
    );
});

export default ProductoCard;