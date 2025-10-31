import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import Table from "../../components/table/Table";
import { getDespachos } from "../../service/api";
import Modal from "../../components/modal/Modal";
import FiltersPanel from "../../components/search/FiltersPanel";

const Despachos = () => {
  const [pagination, setPagination] = useState({
    page: 0,
    size: 10,
  });
  const [filters, setFilters] = useState({
    fechaInicio: null,
    fechaFin: null,
    transporte: null,
    numeroContacto: null,
    sucursalOrigen: null,
    sucursalDestino: null,
    itemId: null,
  });

  const { data, isLoading } = useQuery({
    queryKey: ["despachos", pagination, filters],
    queryFn: () => getDespachos({ ...pagination, ...filters }).then(res => res.data),
    keepPreviousData: true, 
  });

  const filtersConfig = useMemo(() => [
    {
      type: "date",
      name: "fechaInicio",
      label: "Fecha Inicio",
      show: true,
    },
    {
      type: "date",
      name: "fechaFin",
      label: "Fecha Fin",
      show: true,
    },
    {
      type: "search",
      name: "transporte",
      label: "Transporte",
      placeholder: "Ej. Camión",
      show: true,
    },
    {
      type: "search",
      name: "numeroContacto",
      label: "Nro. Contacto",
      placeholder: "Ej. 76543210",
      show: true,
    },
    {
      type: "select",
      name: "sucursalOrigen",
      label: "Sucursal Origen",
      config: {
        options: [], 
      },
      show: true,
    },
    {
      type: "select",
      name: "sucursalDestino",
      label: "Sucursal Destino",
      config: {
        options: [], 
      },
      show: true,
    },
  ], []);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDespachoItems, setSelectedDespachoItems] = useState([]);

  const handleVerProductos = (row) => {
    const despacho = data?.content.find(d => d.id === row.id);
    if (despacho) {
      setSelectedDespachoItems(despacho.despachoItems || []);
      setIsModalOpen(true);
    }
  };

  const closeModal = () => setIsModalOpen(false);

  const mappedData = (data?.content || []).map((despacho) => ({
    id: despacho.id,
    sucursalOrigen: despacho.sucursalOrigen?.nombre || "-",
    destino: despacho.sucursalDestino?.nombre || "-",
    fechaEnvio: despacho.fechaEnvio,
  }));

  const columns = [
    { header: "ID", accessor: "id" },
    { header: "Sucursal Origen", accessor: "sucursalOrigen" },
    { header: "Destino", accessor: "destino" },
    { header: "Fecha de Envío", accessor: "fechaEnvio" },
    {
      header: "Ver productos",
      accessor: "verProductos",
      render: (row) => (
        <button className="btn-edit" onClick={() => handleVerProductos(row)}>
          Ver
        </button>
      ),
    },
  ];

  return (
    <div>
      <FiltersPanel
        filtersConfig={filtersConfig.filter(f => f.show)} // solo los que tengan `show: true`
        filters={filters}
        onFilterChange={(newFilter) => setFilters(prev => ({ ...prev, ...newFilter }))}
        onResetFilters={() => setFilters({})}
      />

      <div className="tabla-despachos" style={{ marginTop: "15px" }}>
        <Table
          columns={columns}
          data={mappedData}
          loading={isLoading}
          pagination={{
            currentPage: pagination.page + 1,
            totalPages: data?.totalPages || 1,
            totalElements: data?.totalElements || 0,
            rowsPerPage: pagination.size,
          }}
          onPageChange={(newPage) =>
            setPagination(prev => ({ ...prev, page: newPage - 1 }))
          }
          onRowsPerPageChange={(newSize) =>
            setPagination(prev => ({ ...prev, size: newSize, page: 0 }))
          }
          showColumnVisibility
        />
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
                <td>{item.item?.descripcion}</td>
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
