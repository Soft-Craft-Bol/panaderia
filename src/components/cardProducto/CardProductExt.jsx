import React from "react";
import styles from "./CardProductoExterno.module.css"; 
import { FaShoppingCart } from "react-icons/fa";

const CardProductExt = ({ item, onReservar, onAgregarAlCarrito, tipoUsuario, descuento, precioConDescuento, sucursalNombre }) => {
  return (
    <div className={`${styles.breadCard} ${styles.fadeInUp} ${descuento ? styles.descuento : ""}`}>
      {descuento && (
        <div className={styles.descuentoBadge}>
          {descuento}% DESCUENTO
        </div>
      )}
      {sucursalNombre && (
        <div className={styles.sucursalNombre}>
          {sucursalNombre}
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
          Precio:{" "}
          {descuento ? (
            <span style={{ textDecoration: "line-through", color: "#999" }}>
              Bs{item.precioUnitario?.toFixed(2)}
            </span>
          ) : (
            <strong>Bs{item.precioUnitario?.toFixed(2)}</strong>
          )}
        </p>
        {precioConDescuento && (
          <p className={styles.breadPrice}>
            Precio con descuento: <strong>Bs{precioConDescuento.toFixed(2)}</strong>
          </p>
        )}
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
            <FaShoppingCart /> Agregar al carrito
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