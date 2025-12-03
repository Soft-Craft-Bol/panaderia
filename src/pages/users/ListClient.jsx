import { useState, useEffect, useMemo } from "react";
import { Button } from "../../components/buttons/Button";
import Table from "../../components/table/Table";
import { FaEdit, MdDelete } from "../../hooks/icons";
import { getAllClient, deleteClient } from "../../service/api";
import { Toaster, toast } from "sonner";
import { Link } from "react-router-dom";
import LinkButton from "../../components/buttons/LinkButton";
import "./ListUser.css";
import ActionButtons from "../../components/buttons/ActionButtons";
import Modal from "../../components/modal/Modal";
import ButtonPrimary from "../../components/buttons/ButtonPrimary";

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
        header: "Email",
        accessor: "email",
        render: (row) => row.email || "-"
      },
      {
        header: "Celular",
        accessor: "celular"
      },
      {
        header: "Acciones",
        render: (row) => (

          <ActionButtons
            showDelete={true}
            onDelete={() => confirmDeleteClient(row)}
            showEdit={false}
            showView={false}
          />
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
        <LinkButton to={`/clientes/crear-cliente`}>Agregar Cliente</LinkButton>
      </div>
      <Table
        columns={columns}
        data={clients}
        className="user-management-table"
      />
      {deleteConfirmOpen && (
        <Modal isOpen={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)}>
          <h2>Confirmar Eliminación</h2>
          <p>¿Estás seguro de que deseas eliminar este usuario?</p>
          <div style={{
            display: "flex",
            justifyContent: "center",
            gap: "1rem"
          }}>
            <ButtonPrimary variant="danger" onClick={handleDeleteClient}>
              Confirmar
            </ButtonPrimary>
            <ButtonPrimary variant="secondary" onClick={() => setDeleteConfirmOpen(false)}>
              Cancelar
            </ButtonPrimary>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default ListClient;