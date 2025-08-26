import React, { useState, useEffect } from 'react';
import {
  getRoles,
  createRole,
  getPermissions,
  createPermission,
  updateRoleStatus,
  updateRolePermissions
} from '../../service/api';
import { FiPlus, FiEdit, FiSave, FiX } from 'react-icons/fi';
import ToggleSwitch from '../../components/toogle/ToggleSwitch';
import { Button } from '../../components/buttons/Button';
import Modal from '../../components/modal/Modal';
import './RoleManagement.css';

const RoleManagement = () => {
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create'); 
  const [currentRole, setCurrentRole] = useState(null);
  const [roleName, setRoleName] = useState('');
  const [rolePermissions, setRolePermissions] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [rolesRes, permissionsRes] = await Promise.all([
        getRoles(),
        getPermissions()
      ]);
      setRoles(rolesRes.data);
      setPermissions(permissionsRes.data);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRole = async () => {
    try {
      const res = await createRole({
        roleEnum: roleName.toUpperCase(),
        permissionNames: rolePermissions
      });
      setRoles([...roles, res.data]);
      closeModal();
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    }
  };

  const handleUpdateRole = async () => {
    try {
      await updateRolePermissions(currentRole.id, rolePermissions);
      setRoles(roles.map(r => r.id === currentRole.id ? { ...r, permissions: rolePermissions } : r));
      closeModal();
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    }
  };

  const handleToggleRoleStatus = async (roleId, active) => {
    try {
      await updateRoleStatus(roleId, active);
      setRoles(roles.map(r => r.id === roleId ? { ...r, active } : r));
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    }
  };

  const openModalCreate = () => {
    setModalMode('create');
    setRoleName('');
    setRolePermissions([]);
    setModalOpen(true);
  };

  const openModalEdit = (role) => {
    setModalMode('edit');
    setCurrentRole(role);
    setRoleName(role.roleEnum);
    setRolePermissions(role.permissions || []);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setCurrentRole(null);
    setRoleName('');
    setRolePermissions([]);
  };

  const togglePermission = (perm) => {
    setRolePermissions(prev =>
      prev.includes(perm) ? prev.filter(p => p !== perm) : [...prev, perm]
    );
  };

  return (
    <div className="role-management-container">
      <div className="header-bar">
        <h2>Gestión de Roles</h2>
        <Button onClick={openModalCreate}>
          <FiPlus /> Nuevo Rol
        </Button>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="roles-grid">
        {roles.map(role => (
          <div key={role.id} className="role-card">
            <div className="role-card-header">
              <h4>{role.roleEnum}</h4>
              {/* <ToggleSwitch
                checked={role.active}
                onChange={(checked) => handleToggleRoleStatus(role.id, checked)}
              /> */}
            </div>
            <div className="role-card-body">
              <p className="permissions-preview">
                {role.permissions?.join(', ') || 'Sin permisos'}
              </p>
              <Button variant="secondary" onClick={() => openModalEdit(role)}>
                <FiEdit /> Editar
              </Button>
            </div>
          </div>
        ))}
      </div>

      <Modal isOpen={modalOpen} onClose={closeModal}>
        <h3>{modalMode === 'create' ? 'Crear Nuevo Rol' : `Editar Rol: ${roleName}`}</h3>
        <div className="modal-form">
          {modalMode === 'create' && (
            <input
              type="text"
              placeholder="Nombre del rol"
              value={roleName}
              onChange={(e) => setRoleName(e.target.value)}
            />
          )}
          <div className="permissions-grid">
            {permissions.map(p => (
              <div key={p.id} className="permission-item">
                <ToggleSwitch
                  label={p.name}
                  checked={rolePermissions.includes(p.name)}
                  onChange={() => togglePermission(p.name)}
                />
              </div>
            ))}
          </div>
          <div className="modal-actions">
            <Button onClick={modalMode === 'create' ? handleCreateRole : handleUpdateRole}>
              {modalMode === 'create' ? <><FiSave /> Crear</> : <><FiSave /> Guardar</>}
            </Button>
            <Button variant="danger" onClick={closeModal}>
              <FiX /> Cancelar
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default RoleManagement;
