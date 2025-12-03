import React, { useState, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import Table from "../../components/table/Table";
import { getDespachos, anularDespacho } from "../../service/api";
import Modal from "../../components/modal/Modal";
import FiltersPanel from "../../components/search/FiltersPanel";
import ActionButtons from "../../components/buttons/ActionButtons";

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
  console.log(data);
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

  const { mutate: anular } = useMutation({
    mutationFn: (id) => anularDespacho(id),
    onSuccess: () => {
      alert("Despacho anulado correctamente");
      queryClient.invalidateQueries(["despachos"]);
    },
    onError: (error) => {
      alert("Error: " + error.response?.data);
    }
  });

  const closeModal = () => setIsModalOpen(false);

  const mappedData = (data?.content || []).map((despacho) => ({
    id: despacho.id,
    sucursalOrigen: despacho.sucursalOrigen?.nombre || "-",
    destino: despacho.sucursalDestino?.nombre || "-",
    fechaEnvio: despacho.fechaEnvio,
    anulado: despacho.anulado,
  }));

  const columns = [
    { header: "ID", accessor: "id" },
    { header: "Sucursal Origen", accessor: "sucursalOrigen" },
    { header: "Destino", accessor: "destino" },
    { header: "Fecha de Envío", accessor: "fechaEnvio" },
    {
      header: "Anulado",
      accessor: "anulado",
      render: (row) => (
        <span
          style={{
            padding: "4px 10px",
            borderRadius: "8px",
            fontWeight: "bold",
            fontSize: "12px",
            color: "white",
            backgroundColor: row.anulado ? "#e74c3c" : "#2ecc71",
          }}
        >
          {row.anulado ? "Sí" : "No"}
        </span>
      ),
    },

    {
      header: "Acciones",
      accessor: "acciones",
      render: (row) => (
        <ActionButtons
          onView={() => handleVerProductos(row)}
          showEdit={false}
          showDelete={!row.anulado}
          onDelete={() => anular(row.id)}
          deleteTitle="Anular"
        />
      ),
    }
  ];
  return (
    <div>
      <FiltersPanel
        filtersConfig={filtersConfig.filter(f => f.show)}
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
