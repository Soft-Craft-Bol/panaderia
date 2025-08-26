import React, { useEffect, useState } from 'react';
import Modal from '../../components/modal/Modal';
import ModalConfirm from '../../components/modalConfirm/ModalConfirm';
import Table from '../../components/table/Table';
import ButtonPrimary from '../../components/buttons/ButtonPrimary';
import ProveedorForm from './ProveedorForm';
import ProveedorDetails from './ProveedorDetails';
import { getProveedores, deleteProveedor, getProveedorById } from '../../service/api';
import { toast, Toaster } from 'sonner';

import './ProveedoresPanel.css';
import ActionButtons from '../../components/buttons/ActionButtons';

const ProveedoresPanel = () => {
  const [proveedores, setProveedores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedProveedor, setSelectedProveedor] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  const fetchProveedores = async () => {
    setLoading(true);
    try {
      const res = await getProveedores();
      setProveedores(res.data);
    } catch (err) {
      console.error(err);
      toast.error('Error al cargar proveedores');
    } finally {
      setLoading(false);
    }
  };

  const fetchProveedorDetails = async (id) => {
    try {
      const res = await getProveedorById(id);
      setSelectedProveedor(res.data);
      setDetailsOpen(true);
    } catch (err) {
      console.error(err);
      toast.error('Error al cargar detalles del proveedor');
    }
  };

  useEffect(() => {
    fetchProveedores();
  }, []);

  const handleDeleteProveedor = async () => {
    if (!selectedProveedor) return;

    try {
      await deleteProveedor(selectedProveedor.id);
      toast.success('Proveedor eliminado correctamente');
      fetchProveedores();
    } catch (err) {
      console.error(err);
      toast.error('Error al eliminar proveedor');
    } finally {
      setConfirmDeleteOpen(false);
      setSelectedProveedor(null);
    }
  };

    const handleView = (row) => {
    fetchProveedorDetails(row.id);
  };

  const handleEdit = (row) => {
    setSelectedProveedor(row);
    setModalOpen(true);
  };

  const handleDelete = (row) => {
    setSelectedProveedor(row);
    setConfirmDeleteOpen(true);
  };

  const columns = [
    { header: 'Nombre/Razón Social', accessor: 'nombreRazonSocial' },
    { header: 'Tipo', accessor: 'tipoProveedor' },
    { header: 'Dirección', accessor: 'direccion' },
    { header: 'Teléfono', accessor: 'telefono' },
    { header: 'Email', accessor: 'email' },
    {
      header: 'Acciones',
      accessor: 'acciones',
      render: (row) => (
        <ActionButtons
          onView={() => handleView(row)}
          onEdit={() => handleEdit(row)}
          onDelete={() => handleDelete(row)}
          viewTitle="Ver detalles"
          editTitle="Editar compra"
          deleteTitle="Eliminar compra"
        />
      )
    }
  ];

  return (
    <div>
      <Toaster />
      <div className="panel-header">
        <h2>Proveedores</h2>
        <ButtonPrimary
          onClick={() => {
            setSelectedProveedor(null);
            setModalOpen(true);
          }}
          variant="primary"
        >
          + Nuevo Proveedor
        </ButtonPrimary>
      </div>

      <Table
        columns={columns}
        data={proveedores}
        loading={loading}
        storageKey="proveedoresTableHiddenColumns"
        onRowClick={(row) => fetchProveedorDetails(row.id)}
      />

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)}>
        <ProveedorForm
          onSuccess={() => {
            setModalOpen(false);
            fetchProveedores();
          }}
          onCancel={() => setModalOpen(false)}
          proveedor={selectedProveedor}
        />
      </Modal>

      {/* Modal para detalles */}
      <Modal isOpen={detailsOpen} onClose={() => setDetailsOpen(false)}>
        <ProveedorDetails
          proveedor={selectedProveedor}
          onClose={() => setDetailsOpen(false)}
          onEdit={() => {
            setDetailsOpen(false);
            setModalOpen(true);
          }}
        />
      </Modal>

      {/* Modal confirmación eliminar */}
      <ModalConfirm
        isOpen={confirmDeleteOpen}
        onClose={() => setConfirmDeleteOpen(false)}
        onConfirm={handleDeleteProveedor}
        title="Eliminar Proveedor"
        message={`¿Está seguro que desea eliminar a "${selectedProveedor?.nombreRazonSocial}"?`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        danger
      />
    </div>
  );
};

export default ProveedoresPanel;
