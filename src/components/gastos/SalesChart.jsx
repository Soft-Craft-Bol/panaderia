import React, { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { getSalesChart } from "../../service/api";
import "./SalesChart.css"; // Importamos el CSS

const SalesChart = () => {
  const [salesData, setSalesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Función para transformar los días del inglés al español
  const translateDay = (day) => {
    const dayTranslations = {
      'MONDAY': 'Lunes',
      'TUESDAY': 'Martes',
      'WEDNESDAY': 'Miércoles',
      'THURSDAY': 'Jueves',
      'FRIDAY': 'Viernes',
      'SATURDAY': 'Sábado',
      'SUNDAY': 'Domingo'
    };
    return dayTranslations[day] || day;
  };

  useEffect(() => {
    const fetchSalesData = async () => {
      try {
        setLoading(true);
        const response = await getSalesChart();
        
        // Transformar los datos del API
        const transformedData = response.data.map(item => ({
          day: translateDay(item.day),
          ventas: item.ventas,
          gastos: item.gastos
        }));
        
        setSalesData(transformedData);
        setError(null);
      } catch (err) {
        console.error('Error fetching sales data:', err);
        setError('Error al cargar los datos de ventas');
        // Datos de fallback en caso de error
        setSalesData([
          { day: "Lunes", ventas: 0, gastos: 0 },
          { day: "Martes", ventas: 0, gastos: 0 },
          { day: "Miércoles", ventas: 0, gastos: 0 },
          { day: "Jueves", ventas: 0, gastos: 0 },
          { day: "Viernes", ventas: 0, gastos: 0 },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchSalesData();
  }, []);

  if (loading) {
    return (
      <div className="gastos-contenedor">
        <h1>Control de entradas y salidas</h1>
        <div className="loading">Cargando datos...</div>
      </div>
    );
  }
    
  return (
    <div className="gastos-contenedor">
        <h1>Control de entradas y salidas</h1>
        {error && <div className="error-message" style={{color: 'red', textAlign: 'center', margin: '10px 0'}}>{error}</div>}
        
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
                <td>{item.ventas.toFixed(2)}</td>
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
            <Tooltip formatter={(value) => [`${value.toFixed(2)} Bs`, 'Ventas']} />
            <Bar dataKey="ventas" fill="var(--color-primary)" />
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
                <td>{item.gastos.toFixed(2)}</td>
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
            <Tooltip formatter={(value) => [`${value.toFixed(2)} Bs`, 'Gastos']} />
            <Bar dataKey="gastos" fill="red" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
    </div>
  );
};

export default SalesChart;
