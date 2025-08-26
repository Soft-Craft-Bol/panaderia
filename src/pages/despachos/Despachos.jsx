import React, { useEffect, useState } from "react";
import Table from "../../components/table/Table";
import { getDespachos } from "../../service/api";
import Modal from "../../components/modal/Modal"; 

const Despachos = () => {
  const [despachos, setDespachos] = useState([]); 
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDespachoItems, setSelectedDespachoItems] = useState([]);
  useEffect(() => {
    const fetchDespachos = async () => {
      try {
        const response = await getDespachos();
        setDespachos(response.data); 
      } catch (error) {
        console.error("Error fetching despachos:", error);
      }
    };

    fetchDespachos();
  }, []);
  const mappedData = despachos.map((despacho) => ({
    id: despacho.id,
    sucursalOrigen: despacho.sucursalOrigen.nombre, 
    destino: despacho.sucursalDestino.nombre, 
    fechaEnvio: despacho.fechaEnvio,
  }));

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
    const selectedDespacho = despachos.find(despacho => despacho.id === row.id);
    if (selectedDespacho) {
      setSelectedDespachoItems(selectedDespacho.despachoItems);
      setIsModalOpen(true); 
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div>
      
      <div className="tabla-despachos" style={{ marginTop: "15px" }}>
        <Table columns={columns} data={mappedData} /> 
      </div>

      <Modal isOpen={isModalOpen} onClose={closeModal}>
        <h2>Ítems enviados</h2>
        <table>
          <thead>
            <tr>
              <th>Descripción</th>
              <th>Cantidad</th>
            </tr>
          </thead>
          <tbody>
            {selectedDespachoItems.map((item) => (
              <tr key={item.id}>
                <td>{item.item.descripcion}</td>
                <td>{item.cantidad}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Modal>
    </div>
  );
};

export default Despachos;