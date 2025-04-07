import React, { createContext, useContext, useState } from "react";

const CarritoContext = createContext();

export const CarritoProvider = ({ children }) => {
  const [carrito, setCarrito] = useState([]);

  const agregarAlCarrito = (producto) => {
    setCarrito((prevCarrito) => {
      // Si el producto tiene descuento, lo guardamos en el carrito
      const productoConDescuento = producto.descuento 
        ? { ...producto, precioOriginal: producto.precioUnitario }
        : producto;
      
      const existe = prevCarrito.find((item) => item.id === productoConDescuento.id);
      
      if (existe) {
        return prevCarrito.map((item) =>
          item.id === productoConDescuento.id 
            ? { 
                ...item, 
                cantidad: item.cantidad + (productoConDescuento.cantidad || 1),
                // Mantenemos el descuento si ya existía
                descuento: productoConDescuento.descuento || item.descuento,
                precioUnitario: productoConDescuento.descuento 
                  ? productoConDescuento.precioUnitario * (1 - (productoConDescuento.descuento / 100))
                  : item.precioUnitario
              } 
            : item
        );
      }
      return [...prevCarrito, {
        ...productoConDescuento,
        precioUnitario: productoConDescuento.descuento
          ? productoConDescuento.precioUnitario * (1 - (productoConDescuento.descuento / 100))
          : productoConDescuento.precioUnitario
      }];
    });
  };

  const eliminarDelCarrito = (id) => {
    setCarrito((prevCarrito) => prevCarrito.filter((item) => item.id !== id));
  };

  return (
    <CarritoContext.Provider value={{ carrito, agregarAlCarrito, eliminarDelCarrito }}>
      {children}
    </CarritoContext.Provider>
  );
};

export const useCarrito = () => useContext(CarritoContext);