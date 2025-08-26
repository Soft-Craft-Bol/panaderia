import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Table from '../../components/table/Table';
import { useRecetas } from '../../hooks/useRecetas';
import SearchInput from '../../components/search/SearchInput';
import Modal from '../../components/modal/Modal';
import './RecetasTable.css';
import RecetaDetail from './RecetaDetail';
import { deleteReceta } from '../../service/api';
import { toast, Toaster } from 'sonner';
import ActionButtons from '../../components/buttons/ActionButtons';

const RecetasTable = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filters, setFilters] = useState({ nombre: '', productoId: '' });
  const [selectedReceta, setSelectedReceta] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data, isLoading, isError, error, refetch } = useRecetas(page, rowsPerPage, filters);

   const handleDelete = async (id) => {
    try {
      await deleteReceta(id);
      toast.success('Receta eliminada correctamente');
      refetch(); 
    } catch (err) {
      toast.error('Error al eliminar la receta');
      console.error(err);
    }
  };

  const columns = [
    { header: 'Nombre', accessor: 'nombre' },
    {
      header: 'Descripción',
      accessor: 'descripcion',
      render: (row) => row.descripcion || 'N/A',
    },
    {
      header: 'Producto',
      accessor: 'productoId',
      render: (row) => row.nombreProducto || `ID: ${row.productoId}`,
    },
    { header: 'Unidades', accessor: 'cantidadUnidades' },
    { header: 'Peso (kg)', accessor: 'pesoUnitario' },
    {
      header: 'Insumos',
      accessor: 'insumos',
      render: (row) => row.insumos?.length || 0,
    },
    {
      header: 'Acciones',
      accessor: 'actions',
      render: (row) => (
        <ActionButtons
          onView={() => handleViewReceta(row)}
          onEdit={() => navigate(`/recetas/editar/${row.id}`)}
          //onEdit={false}
          onDelete={() => {
            if (window.confirm('¿Estás seguro de eliminar esta receta?')) {
              handleDelete(row.id);
            }
          }}
        />
      ),
    },
  ];

   const handleViewReceta = (receta) => {
    setSelectedReceta(receta);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedReceta(null);
  };

  const handleSearchChange = (searchValue) => {
    setPage(1);
    setFilters((prev) => ({ ...prev, nombre: searchValue }));
  };

  if (isError) return <div className="error">Error: {error.message}</div>;

  return (
    <div className="recetas-container">
    <Toaster/>
      <div className="recetas-header">
          <SearchInput
            placeholder="Buscar recetas por nombre..."
            onSearch={handleSearchChange}
            initialValue={filters.nombre}
            debounceTime={400}
            className="recetas-search"
          />
      </div>

      <Table
        columns={columns}
        data={data?.content || []}
        //onRowClick={(row) => navigate(`/recetas/${row.id}`)}
        onRowClick={(row) => handleViewReceta(row)} 
        pagination={{
          currentPage: page,
          totalPages: data?.totalPages || 1,
          totalElements: data?.totalElements || 0,
          rowsPerPage: rowsPerPage,
        }}
        onPageChange={setPage}
        onRowsPerPageChange={setRowsPerPage}
        loading={isLoading}
        showColumnVisibility={true}
        storageKey="recetasTableHiddenColumns"
      />
      <Modal isOpen={isModalOpen} onClose={closeModal}>
        {selectedReceta && <RecetaDetail receta={selectedReceta} onClose={closeModal} />}
      </Modal>
    </div>
  );
};

export default RecetasTable;
