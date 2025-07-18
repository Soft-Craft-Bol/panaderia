import { useState, useEffect, useMemo, useCallback, lazy, Suspense } from "react";
import { Button } from "../../components/buttons/Button";
import Table, { useColumnVisibility } from "../../components/table/Table";
import { FaEdit, MdDelete } from "../../hooks/icons";
import { getUsers, deleteUser } from "../../service/api";
import { getUser } from "../../utils/authFunctions";
import { Toaster, toast } from "sonner";
import { Link } from "react-router-dom";

import LinkButton from "../../components/buttons/LinkButton";
import "./ListUser.css";
import ColumnVisibilityControl from "../../components/table/ColumnVisibilityControl";

const Modal = lazy(() => import("../../components/modal/Modal"));

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const currentUser = useMemo(() => getUser(), []);

  useEffect(() => {
    const fetchUsers = async () => {
      const response = await getUsers();
      const newResponse = response.data;
      const filtrado = newResponse.filter((theUser) => {
        if(theUser.username != currentUser.username){
          return theUser;
        }
      })
      setUsers(filtrado);
    };
    fetchUsers();
  }, []);

  const hasRole = (role) => currentUser?.roles.includes(role);

  const hasAnyRole = (...roles) => roles.some((role) => currentUser?.roles.includes(role));
  const handleDeleteUser = useCallback(async () => {
    try {
      await deleteUser(userToDelete.id);
      setUsers((prevUsers) => prevUsers.filter((user) => user.id !== userToDelete.id));
      toast.success("Usuario eliminado exitosamente.");
    } catch (error) {
      toast.error("Error al eliminar el usuario.");
    } finally {
      setDeleteConfirmOpen(false);
      setUserToDelete(null);
    }
  }, [userToDelete, currentUser]);

  const confirmDeleteUser = useCallback(
    (user) => {
      if (user.id === currentUser.id) {
        toast.error("No puedes eliminar tu propio usuario.");
        return;
      }
      if (!hasAnyRole("ROLE_ADMIN", "DELETE")) {
        toast.error("No tienes permiso para eliminar usuarios.");
        return;
      }
      setUserToDelete(user);
      setDeleteConfirmOpen(true);
    },
    [currentUser]
  );

  const columns = useMemo(
    () => [
      { header: "ID", accessor: "id" },
      {
        header: "",
        accessor: "photo",
        render: (row) => (
          <div className="user-photo">
            <img
              src={row.photo || "ruta/de/foto/por/defecto.jpg"}
              alt={`${row.name} ${row.last_name}`}
              className="clickable-photo"
              style={{ width: "50px", height: "50px", borderRadius: "50%" }}
              onClick={() => setSelectedImage(row.photo || "ruta/de/foto/por/defecto.jpg")}
            />
          </div>
        ),
      },
      { 
        header: "Nombre de usuario", 
        accessor: "username",
      },
      { header: "Nombre", accessor: "firstName" },
      { header: "Apellido", accessor: "lastName" },
      { header: "Teléfono", accessor: "telefono" },
      { header: "Correo Electrónico", accessor: "email" },
     
      
      (hasAnyRole("ROLE_ADMIN", "ROLE_DEVELOPER") || hasRole("UPDATE")) && {
        header: "Acciones",
        render: (row) => (
          <div className="user-management-table-actions">
            {hasAnyRole("ROLE_ADMIN", "UPDATE") && (
              <Link to={`/editUser/${row.id}`} className="user-management-edit-user">
                <FaEdit />
              </Link>
            )}
            {hasAnyRole("ROLE_ADMIN", "DELETE") && (
              <Button
                type="danger"
                onClick={() => confirmDeleteUser(row)}
                disabled={currentUser?.id === row.id}
              >
                <MdDelete />
              </Button>
            )}
          </div>
        ),
      },
    ].filter(Boolean),
    [currentUser, confirmDeleteUser]
  );

  
   const {
      filteredColumns,
      ColumnVisibilityControl
    } = useColumnVisibility(columns, "ventasHiddenColumns");
  

  return (
    <div className="user-management-container">
      <Toaster dir="auto" closeButton richColors visibleToasts={2} duration={2000} position="bottom-right" />
      <div className="user-management-header">
        <h2 className="user-management-title">Gestión de Usuarios</h2>
        {hasAnyRole("ROLE_ADMIN", "ROLE_SECRETARIA") && (
          <LinkButton to={`/registerUser`}>Agregar Usuario</LinkButton>
        )}
        {hasAnyRole("ROLE_ADMIN", "ROLE_SECRETARIA") && (
          <LinkButton to={`/horario`}>Asignar horarios</LinkButton>
        )}
      </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
          <ColumnVisibilityControl buttonLabel="Columnas" />
        </div>

      <Table  columns={filteredColumns}  data={users} className="user-management-table"  showColumnVisibility={false}  
          storageKey="ventasHiddenColumns"   />

      <Suspense fallback={<div>Cargando modal...</div>}>
        {deleteConfirmOpen && (
          <Modal isOpen={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)}>
            <h2>Confirmar Eliminación</h2>
            <p>¿Estás seguro de que deseas eliminar este usuario?</p>
            <div className="user-management-table-actions">
              <Button className="btn-edit" type="danger" onClick={handleDeleteUser}>
                Confirmar
              </Button>
              <Button className="btn-cancel" type="secondary" onClick={() => setDeleteConfirmOpen(false)}>
                Cancelar
              </Button>
            </div>
          </Modal>
        )}
      </Suspense>
      {selectedImage && (
        <div className="image-modal" onClick={() => setSelectedImage(null)}>
          <div className="modal-content">
            <img src={selectedImage} alt="Imagen Ampliada" />
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;