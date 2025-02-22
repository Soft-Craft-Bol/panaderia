import { useState, useEffect } from "react";
import { getRoles, getUsers, assignRoleToUser, createRole, deleteRole, getPermissions } from "../../service/api";
import "./RolesForm.css";
import { IoCloseOutline } from "react-icons/io5";



const RolesForm = () => {
  const [nombre, setNombre] = useState("");
  const [codigo, setCodigo] = useState("");
  const [permisos, setPermisos] = useState([]);
  const [selectedUser, setSelectedUser] = useState("");
  const [todosLosPermisos, setTodosLosPermisos] = useState([]);
  const [roles, setRoles] = useState([]);
  const [usuarios, setUsuarios] = useState([]);

  useEffect(() => {
    cargarRoles();
    cargarUsuarios();
    cargarPermisos(); 
  }, []);
  const cargarPermisos = async () => {
    try {
      const response = await getPermissions();
      setTodosLosPermisos(response.data);
    } catch (error) {
      console.error("Error al obtener roles:", error);
    }
  };

  const cargarRoles = async () => {
    try {
      const response = await getRoles();
      setRoles(response.data);
    } catch (error) {
      console.error("Error al obtener roles:", error);
    }
  };

  const cargarUsuarios = async () => {
    try{
        const response = await getUsers();
        setUsuarios(response.data);
    }catch (error) {
        console.error("Error al obtener usuarios:", error);
    }
  }

  const togglePermiso = (permisoId) => {
    const permisoSeleccionado = todosLosPermisos.find(p => p.id === parseInt(permisoId, 10));
    if (!permisoSeleccionado) return; 
  
    setPermisos((prevPermisos) =>
      prevPermisos.some(p => p.id === permisoSeleccionado.id)
        ? prevPermisos.filter((p) => p.id !== permisoSeleccionado.id)
        : [...prevPermisos, permisoSeleccionado]
    );
  };
  
  const handleAssignRole = async () => {
    if (!selectedUser || !selectedRole) {
      return;
    }

    try {
      await assignRoleToUser({ userId: selectedUser, roleId: selectedRole });
      cargarUsuarios();
    } catch (error) {
      console.error("Error al asignar rol:", error);
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
  
    const permisosIds = permisos.map(p => p.id);
  
    console.log("Nombre:", nombre);
    console.log("Permisos enviados:", permisosIds);
  
    if (permisosIds.length === 0) {
      alert("Debes seleccionar al menos un permiso.");
      return;
    }
  
    try {
      await createRole({ nombre, permisos: permisosIds });
      alert("Rol creado correctamente");
      setNombre("");
      setPermisos([]);
      cargarRoles();
    } catch (error) {
      console.error("Error al crear el rol:", error);
    }
  };
  

  const handleDeleteRole = async (id) => {
    try {
      await deleteRole(id);
      // alert("Rol eliminado correctamente");
      cargarRoles(); 
    } catch (error) {
      console.error("Error al eliminar el rol:", error);
    }
  };

  return (
    <div className="roles-form-container">
      <h2>Role</h2>
      <form onSubmit={handleSubmit}>
        <label>Nombre del Rol:</label>
        <input type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} required />

        <label>Permisos:</label>
        <select onChange={(e) => togglePermiso(e.target.value)}>
          {/* <option>Selecciona un permiso</option> */}
          {todosLosPermisos.map((permiso) => (
            <option key={permiso.id} value={permiso.id}>{permiso.nombre}</option>
          ))}
        </select>

        <div className="permisos-container">
            <h3>Mis Permisos:</h3>
            {permisos.length === 0 ? (
                <p>No has seleccionado permisos aún.</p>
            ) : (
                permisos.map((permiso, index) => (
                <span key={index} className="permiso-item" onClick={() => togglePermiso(permiso.id)}>
                    {permiso.nombre} 
                    <IoCloseOutline size={20} color="red" />
                </span>
                ))
            )}
        </div>


        <button type="submit">Guardar Rol</button>
      </form>
    </div>
  );
};

export default RolesForm;
