import React from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import "./SalesChart.css"; // Importamos el CSS

const salesData = [
  { day: "Lunes", ventas: 120 , gastos: 80},
  { day: "Martes", ventas: 150 , gastos: 75},
  { day: "Miércoles", ventas: 180 , gastos: 70},
  { day: "Jueves", ventas: 220 , gastos: 80},
  { day: "Viernes", ventas: 200 , gastos: 77},
];

const SalesChart = () => {
    
  return (
    <div className="gastos-contenedor">
        <h1>Control de entradas y salidas</h1>
        <div className="sales-container">
      {/* Tabla */}
      <div className="sales-table">
        <h2>Ventas por Día</h2>
        <table>
          <thead>
            <tr>
              <th>Día</th>
              <th>Ventas (Bs)</th>
            </tr>
          </thead>
          <tbody>
            {salesData.map((item, index) => (
              <tr key={index}>
                <td>{item.day}</td>
                <td>{item.ventas}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Gráfico */}
      <div className="sales-chart">
        <h2>Gráfico de Ventas</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={salesData}>
            <XAxis dataKey="day" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="ventas" fill="var(--primary-color)" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>

    {/*Para gastos*/ }
    <div className="sales-container">
      {/* Tabla */}
      <div className="sales-table">
        <h2>Gastos por Día</h2>
        <table>
          <thead>
            <tr>
              <th style={{backgroundColor:"red"}}>Día</th>
              <th style={{backgroundColor:"red"}}>Gastos (Bs)</th>
            </tr>
          </thead>
          <tbody>
            {salesData.map((item, index) => (
              <tr key={index}>
                <td>{item.day}</td>
                <td>{item.gastos}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Gráfico */}
      <div className="sales-chart">
        <h2>Gráfico de Gastos</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={salesData}>
            <XAxis dataKey="day" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="gastos" fill="red" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
    </div>
  );
};

export default SalesChart;
