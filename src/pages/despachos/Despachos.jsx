import React from "react";
import { useNavigate } from "react-router-dom";
import Table from "../../components/table/Table"

const Despachos = () => {
        const navigate = useNavigate();
        const staticData = [
        { id: 1, sucursalOrigen: 'Central', destino: 'Villa Armonia', fechaEnvio: '2024-02-12' },
        { id: 2, sucursalOrigen: 'Villa Armonia', destino: 'Central', fechaEnvio: '2024-02-10' },
        { id: 3, sucursalOrigen: 'Central', destino: 'Villa Armonia', fechaEnvio: '2024-02-08' },
      ];
      
      const columns = [
        { header: 'ID', accessor: 'id' },
        { header: 'Sucursal Origen', accessor: 'sucursalOrigen' },
        { header: 'Destino', accessor: 'destino' },
        { header: 'Fecha de Envío', accessor: 'fechaEnvio' },
        { 
          header: 'Ver productos', 
          accessor: 'verProductos',
          render: (row) => (
            <button className="btn-edit" onClick={() => handleVerProductos(row)}>Ver</button>
          )
        }
      ];

    const handleVerProductos = (row) => {
        alert(`Mostrando productos del despacho ID: ${row.id}`);
      };
    
    return(
        <div>
            <h1>Despachos realizados</h1>
            <button className='btn-general'
            onClick={() => navigate("/despachos/create")}>
            Registrar un nuevo despacho
             </button>
             <div className="tabla-despachos" style={{marginTop:"15px"}}>
             <Table columns={columns} data={staticData} />
             </div>
        </div>
    )
}
export default Despachos;