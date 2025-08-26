import { useState, useMemo, useCallback, lazy, Suspense } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "../../components/buttons/Button";
import Table, { useColumnVisibility } from "../../components/table/Table";
import { deleteUser } from "../../service/api";
import { getUser } from "../../utils/authFunctions";
import { Toaster, toast } from "sonner";
import LinkButton from "../../components/buttons/LinkButton";
import { useUsers } from "../../hooks/useUsers";
import ActionButtons from "../../components/buttons/ActionButtons"; // Importa el componente
import "./ListUser.css";

const Modal = lazy(() => import("../../components/modal/Modal"));

const UserManagement = () => {
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  // Cambiar el valor inicial de currentPage a 1
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  
  const { 
    users,
    pagination,
    isLoading,
    isError,
    isFetching,
    refetch
    // Pasar currentPage - 1 para convertir de base-1 a base-0 para la API
  } = useUsers(currentPage - 1, pageSize);

  const queryClient = useQueryClient();
  const currentUser = useMemo(() => getUser(), []);

  const deleteMutation = useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries(['users']);
      toast.success("Usuario eliminado exitosamente.");
    },
    onError: () => {
      toast.error("Error al eliminar el usuario.");
    },
    onSettled: () => {
      setDeleteConfirmOpen(false);
      setUserToDelete(null);
    }
  });

  const hasAnyRole = (...roles) => roles.some((role) => currentUser?.roles.includes(role));

  const handleView = (row) => {
    console.log("Ver usuario:", row);
  };

  const handleEdit = (row) => {
    window.location.href = `/editUser/${row.id}`;
  };

  const handleDelete = (row) => {
    if (row.id === currentUser.id) {
      toast.error("No puedes eliminar tu propio usuario.");
      return;
    }
    if (!hasAnyRole("ROLE_ADMIN", "DELETE")) {
      toast.error("No tienes permiso para eliminar usuarios.");
      return;
    }
    setUserToDelete(row);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteUser = () => {
    if (userToDelete) {
      deleteMutation.mutate(userToDelete.id);
    }
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const handleRowsPerPageChange = (newSize) => {
    setPageSize(newSize);
    setCurrentPage(1);
  };

  const columns = useMemo(
    () => [
      { header: "ID", accessor: "id" },
      {
        header: "Foto",
        accessor: "photo",
        render: (row) => (
          <div className="user-photo">
            <img
              src={row.photo || "ruta/de/foto/por/defecto.jpg"}
              alt={`${row.firstName} ${row.lastName}`}
              className="clickable-photo"
              style={{ width: "50px", height: "50px", borderRadius: "50%" }}
              onClick={() => setSelectedImage(row.photo || "ruta/de/foto/por/defecto.jpg")}
            />
          </div>
        ),
      },
      { header: "Nombre de usuario", accessor: "username" },
      { header: "Nombre", accessor: "firstName" },
      { header: "Apellido", accessor: "lastName" },
      { header: "Teléfono", accessor: "telefono" },
      { header: "Correo Electrónico", accessor: "email" },
      { header: "Roles", accessor: "roles", render: (row) => row.roles.join(', ') },
      
      (hasAnyRole("ROLE_ADMIN", "ROLE_DEVELOPER", "UPDATE", "DELETE")) && {
        header: "Acciones",
        render: (row) => (
          <ActionButtons
            onView={() => handleView(row)}
            onEdit={() => handleEdit(row)}
            onDelete={() => handleDelete(row)}
            showView={false} 
            showEdit={hasAnyRole("ROLE_ADMIN", "UPDATE")}
            showDelete={hasAnyRole("ROLE_ADMIN", "DELETE") && row.id !== currentUser.id}
            editTitle="Editar usuario"
            deleteTitle="Eliminar usuario"
          />
        ),
      },
    ].filter(Boolean),
    [currentUser]
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

      <Table 
        columns={filteredColumns} 
        data={users} 
        className="user-management-table"
        showColumnVisibility={false}
        storageKey="ventasHiddenColumns"
        pagination={{
          // Pasar currentPage directamente (basado en 1) al componente Table
          currentPage: currentPage,
          totalPages: pagination.totalPages,
          totalElements: pagination.totalElements,
          rowsPerPage: pageSize
        }}
        onPageChange={handlePageChange}
        onRowsPerPageChange={handleRowsPerPageChange}
        loading={isLoading || isFetching}
      />

      <Suspense fallback={<div>Cargando modal...</div>}>
        {deleteConfirmOpen && (
          <Modal isOpen={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)}>
            <h2>Confirmar Eliminación</h2>
            <p>¿Estás seguro de que deseas eliminar este usuario?</p>
            <div className="user-management-table-actions">
              <Button  type="danger" onClick={handleDeleteUser}>
                Confirmar
              </Button>
              <Button type="secondary" onClick={() => setDeleteConfirmOpen(false)}>
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