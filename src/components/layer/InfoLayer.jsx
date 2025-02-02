import React from "react";
import { PieChart, Pie, Cell } from "recharts";
import "./InfoLayer.css";

const COLORS = ["#e25f23", "#CBD5E1"];

const InfoLayer = ({ title, description, total }) => {
  const data = [
    { name: "Actual", value: total },
    { name: "Faltante", value: 10 - total },
  ];

  return (
    <div className="info-layer">
      <h3 className="title">{title}</h3>
      <PieChart width={120} height={120}>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={35}
          outerRadius={50}
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index]} />
          ))}
        </Pie>
      </PieChart>
      <p className="description">
        <span className="dot" /> {description}
      </p>
      <strong className="total">{total}</strong>
    </div>
  );
};

export default InfoLayer;