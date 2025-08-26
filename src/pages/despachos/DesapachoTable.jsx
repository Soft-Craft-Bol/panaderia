import React, { useState, useEffect } from 'react'
import { Button } from "../../components/buttons/Button";
import Table from "../../components/table/Table";
import { FaEdit, MdDelete } from "../../hooks/icons";
import { getDespachoInsumo } from "../../service/api";
import { Toaster, toast } from "sonner";
import LinkButton from "../../components/buttons/LinkButton";
import ActionButtons from "../../components/buttons/ActionButtons";
import "./DespachoTable.css";

export default function DespachoTable() {
  const [despachos, setDespachos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [despachoToDelete, setDespachoToDelete] = useState(null);

  useEffect(() => {
    const fetchDespachos = async () => {
      try {
        setLoading(true);
        const response = await getDespachoInsumo();
        setDespachos(response.data);
      } catch (err) {
        setError(err.message);
        toast.error("Error al cargar los despachos");
      } finally {
        setLoading(false);
      }
    };

    fetchDespachos();
  }, []);

  const handleView = (row) => {
    console.log("Ver despacho:", row);
  };

  const handleEdit = (row) => {
    window.location.href = `/despachos-insumos/editar/${row.id}`;
  };

  const handleDelete = (row) => {
    setDespachoToDelete(row);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteDespacho = async () => {
    if (!despachoToDelete) return;
    
    try {
      // Aquí deberías implementar la llamada API para eliminar
      // await deleteDespachoInsumo(despachoToDelete.id);
      toast.success("Despacho eliminado exitosamente");
      setDespachos(despachos.filter(d => d.id !== despachoToDelete.id));
    } catch (err) {
      toast.error("Error al eliminar el despacho");
    } finally {
      setDeleteConfirmOpen(false);
      setDespachoToDelete(null);
    }
  };

  const columns = [
    { header: "ID", accessor: "id" },
    { 
      header: "Origen", 
      accessor: "sucursalOrigen",
      render: (row) => row.sucursalOrigen.nombre
    },
    { 
      header: "Destino", 
      accessor: "sucursalDestino",
      render: (row) => row.sucursalDestino.nombre
    },
    { header: "Fecha", accessor: "fechaDespacho" },
    { header: "Responsable", accessor: "responsable" },
    { header: "Estado", accessor: "estado" },
    {
      header: "Insumos",
      accessor: "items",
      render: (row) => (
        <div>
          {row.items.map((item, index) => (
            <div key={index} className="insumo-item">
              {item.insumo.nombre} - {item.cantidadEnviada} {item.insumo.unidades}
            </div>
          ))}
        </div>
      )
    },
    /* {
      header: "Acciones",
      render: (row) => (
        <ActionButtons
          onView={() => handleView(row)}
          onEdit={() => handleEdit(row)}
          onDelete={() => handleDelete(row)}
          showView={true}
          showEdit={true}
          showDelete={true}
          editTitle="Editar despacho"
          deleteTitle="Eliminar despacho"
        />
      )
    } */
  ];

  return (
    <div className="despacho-container">
      <Toaster dir="auto" closeButton richColors visibleToasts={2} duration={2000} position="bottom-right" />
      
      <div className="despacho-header">
        <h2 className="despacho-title">Listado de Despachos de Insumos</h2>
      </div>

      {error && <div className="error-message">{error}</div>}

      <Table 
        columns={columns} 
        data={despachos} 
        className="despacho-table"
        loading={loading}
        emptyMessage="No hay despachos registrados"
      />

      {deleteConfirmOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Confirmar Eliminación</h2>
            <p>¿Estás seguro de que deseas eliminar este despacho?</p>
            <div className="modal-actions">
              <Button type="danger" onClick={handleDeleteDespacho}>
                Confirmar
              </Button>
              <Button type="secondary" onClick={() => setDeleteConfirmOpen(false)}>
                Cancelar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}