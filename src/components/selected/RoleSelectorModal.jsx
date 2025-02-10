import React, { useState } from 'react';
import Modal from '../modalConfirm/Modal';
import './RoleSelectorModal.css';
import { Button } from '../buttons/ButtonPrimary';

const RoleSelectorModal = ({ selectedRoles, setSelectedRoles, onClose, setFieldValue }) => {
  // Lista estática de roles
  const roles = ['ADMIN', 'USER', 'INVITED', 'DEVELOPER', 'PANADERO', 'MAESTRO', 'SECRETARIA'];

  const toggleRoleSelection = (role) => {
    if (selectedRoles.includes(role)) {
      setSelectedRoles(selectedRoles.filter((r) => r !== role));
    } else {
      setSelectedRoles([...selectedRoles, role]);
    }
  };

  const handleSave = () => {
    // Actualiza el campo roleRequest.roleListName en el formulario
    setFieldValue('roleRequest.roleListName', selectedRoles);
    onClose();
  };

  const clearSelections = () => {
    setSelectedRoles([]);
  };

  return (
    <Modal isOpen={true} onClose={onClose}>
      <h3>Seleccionar Roles</h3>
      <div className="scrollable-list">
        <ul>
          {roles.map((role) => (
            <li key={role} className="custom-checkbox">
              <input
                id={`checkbox-${role}`}
                type="checkbox"
                value={role}
                checked={selectedRoles.includes(role)}
                onChange={() => toggleRoleSelection(role)}
              />
              <label htmlFor={`checkbox-${role}`}>{role}</label>
            </li>
          ))}
        </ul>
      </div>
      <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
        <Button
          variant="primary"
          type="button"
          onClick={handleSave}
          style={{ marginTop: '20px', alignSelf: 'center' }}
        >
          Guardar selección
        </Button>
        <Button
          variant="primary"
          type="button"
          onClick={clearSelections}
          style={{ marginTop: '20px', alignSelf: 'center' }}
        >
          Limpiar selección
        </Button>
      </div>
    </Modal>
  );
};

export default RoleSelectorModal;