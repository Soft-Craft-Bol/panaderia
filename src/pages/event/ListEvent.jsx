import React, { useEffect, useMemo, useState } from 'react'
import Table, { useColumnVisibility } from '../../components/table/Table'
import { getEventosSignificativosById } from '../../service/api'
import { getUser } from '../../utils/authFunctions';
import './ListEvent.css'

export default function ListEvent() {
  const [evento, setEvento] = useState([]);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const currentUser = getUser();
  const puntoVenta = currentUser?.puntosVenta[0]?.id || null;

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const fetchEventos = async () => {
      try {
        const response = await getEventosSignificativosById(puntoVenta);
        setEvento(response.data);
      } catch (error) {
        console.error("Error fetching eventos:", error);
      }
    };

    fetchEventos();
  }, [puntoVenta]);

  const columns = useMemo(() => [
    {
      header: "ID",
      accessor: "id",
      show: true,
      width: isMobile ? "80px" : "120px",
      style: { textAlign: "center" },
      Cell: ({ value }) => (
        <div className="cell-content">
          {isMobile && <span className="mobile-label">ID: </span>}
          {value}
        </div>
      )
    },
    {
      header: "Código motivo",
      accessor: "codigoMotivo",
      show: !isMobile,
      width: "120px",
      style: { textAlign: "center" },
      Cell: ({ value }) => (
        <div className="cell-content">
          {isMobile && <span className="mobile-label">Motivo: </span>}
          {value}
        </div>
      )
    },
    {
      header: "Código recepción",
      accessor: "codigoRecepcion",
      show: true,
      Cell: ({ value }) => {
        const handleCopy = () => {
          navigator.clipboard.writeText(value);
          alert("¡Código copiado!");
        };

        return (
          <div className="cell-content" style={{ textAlign: "center" }}>
            {isMobile && <span className="mobile-label">Recepción: </span>}
            <span 
              className="copyable-text" 
              onClick={handleCopy}
              title="Haz clic para copiar"
            >
              {isMobile ? value.substring(0, 8) + '...' : value}
            </span>
          </div>
        );
      }
    },
    {
      header: "Descripción",
      accessor: "descripcionMotivo",
      show: !isMobile,
      style: { textAlign: "center" },
      Cell: ({ value }) => (
        <div className="cell-content">
          {isMobile && <span className="mobile-label">Descripción: </span>}
          {isMobile ? `${value.substring(0, 20)}...` : value}
        </div>
      )
    },
    {
      header: "CUFD evento",
      accessor: "cufdEvento",
      show: !isMobile,
      style: { textAlign: "center" },
      Cell: ({ value }) => (
        <div className="cell-content">
          {isMobile && <span className="mobile-label">CUFD: </span>}
          {isMobile ? `${value.substring(0, 8)}...` : value}
        </div>
      )
    },
    {
      header: "Fecha inicio",
      accessor: "fechaInicio",
      show: true,
      Cell: ({ value }) => {
        if (!value) return "-";
        const fecha = new Date(value);
        const formattedDate = fecha.toLocaleString("es-ES", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });

        return (
          <div className="cell-content" style={{ textAlign: "center" }}>
            {isMobile && <span className="mobile-label">Inicio: </span>}
            {isMobile ? formattedDate.split(',')[0] : formattedDate}
          </div>
        );
      },
    },
    {
      header: "Fecha fin",
      accessor: "fechaFin",
      show: !isMobile,
      Cell: ({ value }) => {
        if (!value) return "-";
        const fecha = new Date(value);
        return (
          <div className="cell-content" style={{ textAlign: "center" }}>
            {isMobile && <span className="mobile-label">Fin: </span>}
            {fecha.toLocaleString("es-ES", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>
        );
      },
    },
  ], [isMobile]);

  const { filteredColumns, ColumnVisibilityControl } = useColumnVisibility(
    columns, 
    "eventosHiddenColumns"
  );

  return (
    <div className="list-event-container">
      <div className="list-event-header">
        <h1>Eventos Significativos</h1>
        <div className="column-control-wrapper">
          <ColumnVisibilityControl buttonLabel="Columnas" />
        </div>
      </div>
      
      <div className="table-responsive">
        <Table 
          columns={filteredColumns}  
          data={evento}
          showColumnVisibility={false}
          storageKey="eventosHiddenColumns"
          isMobile={isMobile}
        />
      </div>
    </div>
  )
}