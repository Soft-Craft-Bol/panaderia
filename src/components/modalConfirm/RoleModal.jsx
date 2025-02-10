const RoleModal = ({ isOpen, onClose, roles, selectedRoles, onRoleChange }) => {
    if (!isOpen) return null;
  
    return (
      <div className="modal-overlay">
        <div className="modal-content">
          <h3>Seleccionar Roles</h3>
          <div className="roles-list">
            {roles.map((role) => (
              <div key={role} className="role-checkbox">
                <input
                  type="checkbox"
                  id={role}
                  value={role}
                  checked={selectedRoles.includes(role)}
                  onChange={(e) => onRoleChange(e, role)}
                />
                <label htmlFor={role}>{role}</label>
              </div>
            ))}
          </div>
          <button onClick={onClose}>Cerrar</button>
        </div>
      </div>
    );
  };
  export default RoleModal;