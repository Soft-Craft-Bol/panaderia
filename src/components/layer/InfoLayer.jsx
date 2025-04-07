import React, { useState, useMemo, useCallback } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import "./InfoLayer.css";

const InfoLayer = ({ title, description, total, image }) => {
  const [flipped, setFlipped] = useState(false);

  // Memoizar los colores basados en el tema
  const COLORS = useMemo(() => ["var(--primary-color)", "var(--bg-app)"], []);

  const data = useMemo(() => [
    { name: "Actual", value: total },
    { name: "Faltante", value: Math.max(0, 10 - total) }, // Evitar valores negativos
  ], [total]);

  // Handlers memoizados
  const handleMouseEnter = useCallback(() => setFlipped(true), []);
  const handleMouseLeave = useCallback(() => setFlipped(false), []);

  return (
    <div
      className={`info-layer ${flipped ? "flipped" : ""}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={() => setFlipped(!flipped)} // Para dispositivos táctiles
    >
      <div className="card-content">
        <div className="front">
          <img 
            src={image} 
            alt={title} 
            className="info-image" 
            loading="lazy" // Lazy loading para imágenes
          />
        </div>
        <div className="back">
          <h3 className="title">{title}</h3>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius="60%"
                  outerRadius="80%"
                  dataKey="value"
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <p className="description">
            <span className="dot" /> {description}
          </p>
          <strong className="total">{total}</strong>
        </div>
      </div>
    </div>
  );
};

export default React.memo(InfoLayer);