import React, { useEffect, useMemo, useState } from 'react'
import Table, { useColumnVisibility } from '../../components/table/Table'
import { getEventosSignificativosById } from '../../service/api'
import { getUser } from '../../utils/authFunctions';
import './ListEvent.css'

export default function ListEvent() {

  const [evento, setEvento] = useState([]);
  const currentUser = getUser();
  const puntoVenta = currentUser?.puntosVenta[0]?.id || null;

  useEffect(() => {
    const fetchEventos = async () => {
      try {
        const response = await getEventosSignificativosById(puntoVenta);
        console.log(response.data);
        setEvento(response.data);
      } catch (error) {
        console.error("Error fetching eventos:", error);
      }
    };

    fetchEventos();
  }, []);


  const columns = useMemo(() => [
    {
      header: "ID",
      accessor: "id",
      show: true,
      width: "120px",
      style: { textAlign: "center" },
    },
    {
      header: "Código motivo",
      accessor: "codigoMotivo",
      show: true,
      width: "120px",
      style: { textAlign: "center" },
    },
    {
      header: "Código de recepción",
      accessor: "codigoRecepcion",
      show: true,
      Cell: ({ value }) => {
        const handleCopy = () => {
          navigator.clipboard.writeText(value);
          alert("¡Código copiado!");
        };

        return (
          <div style={{ textAlign: "center", cursor: "pointer" }} onClick={handleCopy}>
            <span title="Haz clic para copiar">{value}</span>
          </div>
        );
      }

    },
    {
      header: "Descripción",
      accessor: "descripcionMotivo",
      show: true,
      style: { textAlign: "center" },
    },
    {
      header: "CUFD del evento",
      accessor: "cufdEvento",
      show: true,
      style: { textAlign: "center" },
    },
    {
      header: "Fecha inicio",
      accessor: "fechaInicio",
      Cell: ({ value }) => {
        if (!value) return "-";
        const fecha = new Date(value);
        return (
          <div style={{ textAlign: "center" }}>
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
    {
      header: "Fecha fin",
      accessor: "fechaFin",
      Cell: ({ value }) => {
        if (!value) return "-";
        const fecha = new Date(value);
        return (
          <div style={{ textAlign: "center" }}>
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
  ], []);


 const {
    filteredColumns,
    ColumnVisibilityControl
  } = useColumnVisibility(columns, "ventasHiddenColumns");



  return (
    <>
      <div className="container">
        <h1>Eventos Significativos</h1>
         <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
          <ColumnVisibilityControl buttonLabel="Columnas" />
        </div>
        <Table 
          columns={filteredColumns}  
          data={evento}
          showColumnVisibility={false}  
          storageKey="ventasHiddenColumns" 
        />
      </div>

    </>
  )
}
