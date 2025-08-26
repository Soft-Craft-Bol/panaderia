import React from "react";
import styles from "./CardProductoExterno.module.css"; 
import { FaShoppingCart } from "react-icons/fa";

const CardProductExt = ({ 
  item, 
  onReservar, 
  tipoUsuario, 
  descuento, 
  precioConDescuento, 
  sucursalNombre 
}) => {
  return (
    <div className={`${styles.breadCard} ${descuento ? styles.descuento : ""}`}>
      {descuento && (
        <div className={styles.descuentoBadge}>
          {descuento}% OFF
        </div>
      )}
      
      {sucursalNombre && (
        <div className={styles.sucursalNombre}>
          {sucursalNombre}
        </div>
      )}
      
      <div className={styles.breadImageContainer}>
        <img
          src={item.imagen || '/placeholder-product.jpg'}
          alt={item.descripcion}
          className={styles.breadImage}
          loading="lazy"
        />
      </div>

      <div className={styles.breadInfo}>
        <h2 className={styles.breadDescription}>{item.descripcion}</h2>
        
        <div className={styles.breadPrice}>
          {descuento ? (
            <>
              <span style={{ textDecoration: "line-through", color: "var(--color-text-secondary)" }}>
                Bs {item.precioUnitario?.toFixed(2)}
              </span>
              <strong> Bs {precioConDescuento?.toFixed(2)}</strong>
            </>
          ) : (
            <strong>Bs {item.precioUnitario?.toFixed(2)}</strong>
          )}
        </div>
        
        {item.sucursal && (
          <p className={styles.breadQuantity}>
            Disponible: {item.sucursal.cantidad} unidades
          </p>
        )}
      </div>

      <div className={styles.cardActions}>
  <button
    onClick={() => onReservar(item)}
    className={styles.reserveButton}
    aria-label={`Reservar ${item.descripcion}`}
  >
    {tipoUsuario === "externo" ? <><FaShoppingCart /> Agregar</> : <>Reservar</>}
  </button>
</div>
    </div>
  );
};

export default CardProductExt;