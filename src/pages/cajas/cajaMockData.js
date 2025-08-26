export const usuarioEjemplo = {
  id: 1,
  nombre: "Juan Pérez",
  puntosVenta: [{ id: 1, nombre: "Panadería Central" }]
};

export const cajaEjemplo = {
  id: 1,
  nombre: "Caja Principal",
  estado: "ABIERTA",
  montoInicial: 500.00,
  fechaApertura: new Date(),
  puntoVenta: { id: 1, nombre: "Panadería Central" },
  usuario: usuarioEjemplo
};

export const historialCajas = [
  {
    id: 1,
    nombre: "Caja Principal",
    estado: "CERRADA",
    montoInicial: 500.00,
    montoFinal: 2850.50,
    fechaApertura: new Date(Date.now() - 86400000), // Ayer
    fechaCierre: new Date(Date.now() - 82800000), // Ayer + 10 horas
    puntoVenta: { id: 1, nombre: "Panadería Central" },
    usuario: usuarioEjemplo
  },
  {
    id: 2,
    nombre: "Caja Principal",
    estado: "CERRADA",
    montoInicial: 500.00,
    montoFinal: 3200.75,
    fechaApertura: new Date(Date.now() - 172800000), // Antier
    fechaCierre: new Date(Date.now() - 169200000), // Antier + 10 horas
    puntoVenta: { id: 1, nombre: "Panadería Central" },
    usuario: usuarioEjemplo
  }
];