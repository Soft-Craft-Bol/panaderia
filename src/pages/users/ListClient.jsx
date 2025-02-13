import { useState, useEffect, useMemo } from "react";
import { Button } from "../../components/buttons/Button";
import Table from "../../components/table/Table";
import { FaEdit, MdDelete } from "../../hooks/icons";
import { getAllClient, deleteClient } from "../../service/api";
import { Toaster, toast } from "sonner";
import { Link } from "react-router-dom";
import LinkButton from "../../components/buttons/LinkButton";
import "./ListUser.css";

const ListClient = () => {
  const [clients, setClients] = useState([]);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [clientToDelete, setClientToDelete] = useState(null);

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const response = await getAllClient();
        setClients(response.data);
      } catch (error) {
        toast.error("Error al cargar los clientes");
      }
    };
    fetchClients();
  }, []);

  const handleDeleteClient = async () => {
    try {
      await deleteClient(clientToDelete.id);
      setClients((prevClients) => 
        prevClients.filter((client) => client.id !== clientToDelete.id)
      );
      toast.success("Cliente eliminado exitosamente.");
    } catch (error) {
      toast.error("Error al eliminar el cliente.");
    } finally {
      setDeleteConfirmOpen(false);
      setClientToDelete(null);
    }
  };

  const confirmDeleteClient = (client) => {
    setClientToDelete(client);
    setDeleteConfirmOpen(true);
  };

  const columns = useMemo(
    () => [
      { header: "ID", accessor: "id" },
      { 
        header: "Código Cliente", 
        accessor: "codigoCliente" 
      },
      { 
        header: "Nombre/Razón Social", 
        accessor: "nombreRazonSocial" 
      },
      { 
        header: "Tipo Doc.", 
        accessor: "codigoTipoDocumentoIdentidad" 
      },
      { 
        header: "Nro. Documento", 
        accessor: "numeroDocumento" 
      },
      { 
        header: "Complemento", 
        accessor: "complemento",
        render: (row) => row.complemento || "-"
      },
      { 
        header: "Email", 
        accessor: "email" 
      },
      {
        header: "Acciones",
        render: (row) => (
          <div className="user-management-table-actions">
            <Link to={`/editClient/${row.id}`} className="user-management-edit-user">
              <FaEdit />
            </Link>
            <Button
              type="danger"
              onClick={() => confirmDeleteClient(row)}
            >
              <MdDelete />
            </Button>
          </div>
        ),
      },
    ],
    []
  );

  return (
    <div className="user-management-container">
      <Toaster 
        dir="auto" 
        closeButton 
        richColors 
        visibleToasts={2} 
        duration={2000} 
        position="bottom-right" 
      />
      
      <div className="user-management-header">
        <h2 className="user-management-title">Todos de Clientes</h2>
        <LinkButton to={`/registerClient`}>Agregar Cliente</LinkButton>
      </div>

      <Table 
        columns={columns} 
        data={clients} 
        className="user-management-table" 
      />

      {deleteConfirmOpen && (
        <div className="modal">
          <div className="modal-content">
            <h2>Confirmar Eliminación</h2>
            <p>¿Estás seguro de que deseas eliminar este cliente?</p>
            <div className="user-management-table-actions">
              <Button type="danger" onClick={handleDeleteClient}>
                Confirmar
              </Button>
              <Button 
                type="secondary" 
                onClick={() => setDeleteConfirmOpen(false)}
              >
                Cancelar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ListClient;