import React, { useState } from "react";
import {
  obtenerCuis,
  obtenerCufd,
  sincronizarParametros,
  sincronizarCatalogos,
  sincronizarMensajeServicio,
  sincronizarFechaHora,
} from "../../service/api";

import { Button } from "../../components/buttons/Button";
import { getUser } from "../../utils/authFunctions";
import { useTheme } from "../../context/ThemeContext";

import { FiRefreshCw, FiClock, FiCloud, FiDownload, FiAlertCircle, FiKey, FiSun, FiMoon } from "react-icons/fi";

import "./Configuraciones.css";
import RoleManagement from "./RoleManagement";

const Configuraciones = () => {
  const [respuesta, setRespuesta] = useState(null);
  const [loading, setLoading] = useState(false);

  const currentUser = getUser();
  const idPuntoVenta = currentUser?.puntoVenta?.id || 1;

  const { theme, toggleTheme } = useTheme();

  const handleRequest = async (apiFn) => {
    setLoading(true);
    setRespuesta(null);
    try {
      const res = await apiFn(idPuntoVenta);
      setRespuesta(res.data);
    } catch (err) {
      setRespuesta(err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="config-container">
      <div className="config-header">
        <h2>⚙️ Configuraciones del Sistema</h2>
        <p>ID Punto de Venta: <strong>{idPuntoVenta}</strong></p>
        <Button variant="secondary" onClick={toggleTheme}>
          {theme === "dark" ? <FiSun /> : <FiMoon />} Cambiar Tema
        </Button>
      </div>

      <div className="config-grid">
        <Button onClick={() => handleRequest(obtenerCuis)}>
          <FiKey /> Obtener CUIS
        </Button>

        <Button onClick={() => handleRequest(obtenerCufd)}>
          <FiCloud /> Obtener CUFD
        </Button>

        <Button onClick={() => handleRequest(sincronizarParametros)}>
          <FiRefreshCw /> Sincronizar Parámetros
        </Button>

        <Button onClick={() => handleRequest(sincronizarCatalogos)}>
          <FiDownload /> Sincronizar Catálogos
        </Button>

        <Button onClick={() => handleRequest(sincronizarMensajeServicio)}>
          <FiAlertCircle /> Sincronizar Mensajes Servicio
        </Button>

        <Button onClick={() => handleRequest(sincronizarFechaHora)}>
          <FiClock /> Sincronizar Fecha y Hora
        </Button>
      </div>

      <div className="config-response">
        <h3>Respuesta:</h3>
        {loading ? (
          <p>Cargando...</p>
        ) : respuesta ? (
          <pre>{JSON.stringify(respuesta, null, 2)}</pre>
        ) : (
          <p>No hay respuesta todavía.</p>
        )}
      </div>
      <div className="config-section">
        <RoleManagement />
      </div>
    </div>
  );
};

export default Configuraciones;
