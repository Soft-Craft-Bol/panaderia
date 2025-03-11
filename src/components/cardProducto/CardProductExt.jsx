import React from "react";
import styles from "./CardProductoExterno.module.css"; 
import { FaShoppingCart } from "react-icons/fa";

const CardProductExt = ({ item, onReservar, onAgregarAlCarrito, tipoUsuario, descuento }) => {
  return (
    <div className={`${styles.breadCard} ${styles.fadeInUp}`}>
      {descuento && (
        <div className={styles.descuentoBadge}>
          {descuento}% OFF
        </div>
      )}
      <div className={styles.breadImageContainer}>
        <img
          src={item.imagen}
          alt={item.descripcion}
          className={styles.breadImage}
        />
      </div>

      <div className={styles.breadInfo}>
        <h2 className={styles.breadDescription}>{item.descripcion}</h2>
        <p className={styles.breadPrice}>
          Precio: <strong>Bs{item.precioUnitario?.toFixed(2)}</strong>
        </p>
        {item.sucursal && (
          <p className={styles.breadQuantity}>
            Cantidad en {item.sucursal.nombre}: {item.sucursal.cantidad}
          </p>
        )}
      </div>

      <div className={styles.cardActions}>
        {tipoUsuario === "externo" ? (
          <button
            onClick={() => onAgregarAlCarrito(item)}
            className={styles.reserveButton}
          >
             <FaShoppingCart />  Agregar al carrito
          </button>
        ) : (
          <button
            onClick={() => onReservar(item.id)}
            className={styles.reserveButton}
          >
            Reservar
          </button>
        )}
      </div>
    </div>
  );
};

export default CardProductExt;