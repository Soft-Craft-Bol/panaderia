import React, { useEffect, useState } from "react";
import { getArchivos } from "../../service/api"; 
import "./ExploradorArchivos.css";

const ArchivoNodo = ({ archivo }) => {
  const [expandido, setExpandido] = useState(false);

  const toggleExpandido = () => {
    if (archivo.esDirectorio) setExpandido(!expandido);
  };

  return (
    <div className="nodo">
      <div
        className={`nodo-header ${archivo.esDirectorio ? "directorio" : "archivo"}`}
        onClick={toggleExpandido}
      >
        {archivo.esDirectorio ? (
          <span className="icono">{expandido ? "📂" : "📁"}</span>
        ) : (
          <span className="icono">📄</span>
        )}
        <span className="nombre">{archivo.nombre}</span>
      </div>

      {expandido && archivo.archivosHijos && (
        <div className="nodo-hijos">
          {archivo.archivosHijos.map((hijo, idx) => (
            <ArchivoNodo key={idx} archivo={hijo} />
          ))}
        </div>
      )}
    </div>
  );
};

const ExploradorArchivos = () => {
  const [archivos, setArchivos] = useState([]);

  useEffect(() => {
    const fetchArchivos = async () => {
      try {
        const { data } = await getArchivos();
        setArchivos(data);
      } catch (error) {
        console.error("Error al obtener archivos:", error);
      }
    };
    fetchArchivos();
  }, []);

  return (
    <div className="explorador-container">
      <h2 className="explorador-titulo">📂 Explorador de Facturas</h2>
      <div className="explorador-lista">
        {archivos.map((archivo, idx) => (
          <ArchivoNodo key={idx} archivo={archivo} />
        ))}
      </div>
    </div>
  );
};

export default ExploradorArchivos;
