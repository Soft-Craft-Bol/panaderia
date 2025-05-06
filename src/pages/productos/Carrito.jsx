import React from 'react';
import PropTypes from 'prop-types';
import './Carrito.css';

const Carrito = ({ cart, updateQuantity, handleCheckout, totalCompra, isOpen, toggleCart }) => {
  const removeFromCart = (productId) => {
    updateQuantity(productId, 0);
  };

  const totalConDescuentos = cart.reduce((total, item) => {
    return total + ((item.tieneDescuento ? item.precioConDescuento : item.precioUnitario) * item.quantity);
  }, 0);

  const totalProductos = cart.reduce((total, item) => total + item.quantity, 0);

  return (
    <div className={`cart-container ${isOpen ? 'open' : 'closed'}`}>
      <button className="cart-toggle-btn" onClick={toggleCart}>
        {isOpen ? (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M6 18L18 6M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        ) : (
          <>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 3H5L5.4 5M7 13H17L21 5H5.4M7 13L5.4 5M7 13L4.70711 15.2929C4.07714 15.9229 4.52331 17 5.41421 17H17M17 17C15.8954 17 15 17.8954 15 19C15 20.1046 15.8954 21 17 21C18.1046 21 19 20.1046 19 19C19 17.8954 18.1046 17 17 17ZM9 19C9 20.1046 8.10457 21 7 21C5.89543 21 5 20.1046 5 19C5 17.8954 5.89543 17 7 17C8.10457 17 9 17.8954 9 19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            {totalProductos > 0 && (
              <span className="cart-counter">
                {totalProductos}
              </span>
            )}
          </>
        )}
      </button>

      <div className="cart-content">
        <h2 className="cart-title">Carrito de Compras</h2>
        
        {cart.length === 0 ? (
          <div className="cart-empty">
            <p>No hay productos en el carrito</p>
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
              <path d="M6 2L3 6V20C3 20.5304 3.21071 21.0391 3.58579 21.4142C3.96086 21.7893 4.46957 22 5 22H19C19.5304 22 20.0391 21.7893 20.4142 21.4142C20.7893 21.0391 21 20.5304 21 20V6L18 2H6Z" stroke="var(--primary-color)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M3 6H21" stroke="var(--primary-color)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M16 10C16 11.0609 15.5786 12.0783 14.8284 12.8284C14.0783 13.5786 13.0609 14 12 14C10.9391 14 9.92172 13.5786 9.17157 12.8284C8.42143 12.0783 8 11.0609 8 10" stroke="var(--primary-color)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        ) : (
          <>
            <div className="cart-items">
              {cart.map(item => (
                <div key={item.id} className={`cart-item ${item.tieneDescuento ? 'has-discount' : ''}`}>
                  <div className="item-info">
                    <div className="item-descuent">
                    <span className="item-name">{item.descripcion}</span>
                    {item.tieneDescuento && (
                      <span className="item-discount-badge">
                        {Math.round((1 - (item.precioConDescuento / item.precioUnitario)) * 100)}% OFF
                      </span>
                    )}
                    </div>
                    <div className="item-details">
                      <div className="item-price-container">
                        {item.tieneDescuento && (
                          <span className="item-original-price">
                            Bs {(item.precioUnitario * item.quantity).toFixed(2)}
                          </span>
                        )}
                        <span className="item-price">
                          Bs {(item.tieneDescuento 
                            ? (item.precioConDescuento * item.quantity).toFixed(2) 
                            : (item.precioUnitario * item.quantity).toFixed(2))}
                        </span>
                      </div>
                      <span className="item-stock">
                        Stock: {item.stockActual}
                      </span>
                    </div>
                  </div>
                  
                  <div className="quantity-controls">
                    <button 
                      className="quantity-btn minus"
                      onClick={(e) => {
                        e.stopPropagation();
                        updateQuantity(item.id, item.quantity - 1);
                      }}
                      disabled={item.quantity <= 1}
                      aria-label="Reducir cantidad"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      </svg>
                    </button>
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => updateQuantity(item.id, parseInt(e.target.value || 1))}
                      min="1"
                      max={item.stockActual}
                      className="quantity-input"
                      aria-label="Cantidad"
                    />
                    <button 
                      className="quantity-btn plus"
                      onClick={(e) => {
                        e.stopPropagation();
                        updateQuantity(item.id, item.quantity + 1);
                      }}
                      disabled={item.quantity >= item.stockActual}
                      aria-label="Aumentar cantidad"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      </svg>
                    </button>
                    <button 
                      className="remove-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFromCart(item.id);
                      }}
                      aria-label="Eliminar producto"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M6 18L18 6M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="cart-summary">
              <div className="cart-total">
                <span>Total:</span>
                <span className="total-amount">Bs {totalConDescuentos.toFixed(2)}</span>
              </div>
              
              <button 
                className="checkout-btn"
                onClick={handleCheckout}
                disabled={cart.length === 0}
              >
                Finalizar Venta
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M5 12H19M12 5L19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

Carrito.propTypes = {
  cart: PropTypes.array.isRequired,
  updateQuantity: PropTypes.func.isRequired,
  handleCheckout: PropTypes.func.isRequired,
  totalCompra: PropTypes.number.isRequired,
  isOpen: PropTypes.bool.isRequired,
  toggleCart: PropTypes.func.isRequired
};

export default Carrito;