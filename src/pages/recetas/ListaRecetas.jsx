import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { getItemsWithRecetas } from '../../service/api';
import { FaSearch, FaPlusCircle, FaInfoCircle, FaArrowLeft, FaArrowRight } from 'react-icons/fa';
import './ListaRecetas.css';
import BackButton from '../../components/buttons/BackButton';
import SearchInput from '../../components/search/SearchInput';
import Table from '../../components/table/Table';

const PAGE_SIZE = 10;
const CACHE_TIME = 1000 * 60 * 5;
const DEBOUNCE_DELAY = 500;

const ListaRecetas = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [hasRecipes, setHasRecipes] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const timerId = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setCurrentPage(0);
    }, DEBOUNCE_DELAY);

    return () => clearTimeout(timerId);
  }, [searchTerm]);

  const {
    data,
    isLoading,
    error,
    isFetching,
  } = useQuery({
    queryKey: ['itemsWithRecetas', debouncedSearchTerm, hasRecipes, currentPage],
    queryFn: () =>
      getItemsWithRecetas({
        page: currentPage,
        size: PAGE_SIZE,
        search: debouncedSearchTerm,
        hasRecipes
      }),
    staleTime: CACHE_TIME,
    cacheTime: CACHE_TIME * 2,
    keepPreviousData: true,
  });

  const handleEstablecerReceta = (itemId, itemDescripcion) => {
    navigate(`/recetas/crear`, {
      state: {
        productoId: itemId,
        nombreProducto: itemDescripcion
      }
    });
  };


  if (isLoading && !isFetching) return <div className="loading">Cargando productos...</div>;
  if (error) return <div className="error">Error al cargar productos: {error.message}</div>;

  const items = data?.data?.content || [];
  const totalPages = data?.data?.totalPages || 0;

  const columns = [
    { header: 'ID', accessor: 'id' },
    { header: 'Descripción', accessor: 'descripcion' },
    { header: 'Código', accessor: 'codigo' },
    {
      header: 'Receta',
      accessor: 'tieneReceta',
      render: (row) =>
        row.tieneReceta ? (
          <span className="receta-badge has-recipe">
            <FaInfoCircle /> Con receta
          </span>
        ) : (
          <span className="receta-badge no-recipe">
            <FaPlusCircle /> Sin receta
          </span>
        )
    },
    {
      header: 'Precio',
      accessor: 'precioUnitario',
      render: (row) => `${row.precioUnitario} Bs`,
    },
    { header: 'Unidad', accessor: 'unidadMedida' },
    {
      header: 'Imagen',
      accessor: 'imagen',
      render: (row) => (
        <img
          src={row.imagen || '/placeholder-product.png'}
          alt={row.descripcion}
          className="recetas-item-image"
          onError={(e) => {
            e.target.src = '/placeholder-product.png';
          }}
        />
      ),
    },
    {
      header: 'Acción',
      accessor: 'accion',
      render: (row) => (
        !row.tieneReceta && (
          <button
            className="btn-establecer-receta"
            onClick={(e) => {
              e.stopPropagation();
              handleEstablecerReceta(row.id, row.descripcion);
            }}
          >
            Crear Receta
          </button>
        )
      ),
    },

  ];


  return (
    <div className="recetas-container">
      <div className="recetas-header">
        <div className="recetas-filters">
          <div className="search-box">
            <SearchInput
              placeholder="Buscar productos..."
              initialValue={searchTerm}
              onSearch={(term) => {
                setSearchTerm(term);
              }}
            />
          </div>


          <div className="filter-buttons">
            <button
              className={`filter-btn ${hasRecipes === null ? 'active' : ''}`}
              onClick={() => {
                setHasRecipes(null);
                setCurrentPage(0);
              }}
            >
              Todos
            </button>
            <button
              className={`filter-btn ${hasRecipes === true ? 'active' : ''}`}
              onClick={() => {
                setHasRecipes(true);
                setCurrentPage(0);
              }}
            >
              Con receta
            </button>
            <button
              className={`filter-btn ${hasRecipes === false ? 'active' : ''}`}
              onClick={() => {
                setHasRecipes(false);
                setCurrentPage(0);
              }}
            >
              Sin receta
            </button>
          </div>
        </div>
      </div>
      <Table
        columns={columns}
        data={items}
        pagination={{
          currentPage: currentPage + 1,
          totalPages,
          totalElements: data?.data?.totalElements || 0,
          rowsPerPage: PAGE_SIZE,
        }}
        onPageChange={(newPage) => setCurrentPage(newPage - 1)}
        onRowsPerPageChange={() => {
          setCurrentPage(0);
        }}
        loading={isLoading && isFetching}
        showColumnVisibility={true}
        storageKey="listaRecetasTableHiddenColumns"
        onRowClick={(row) => {
          if (!row.tieneReceta) {
            handleEstablecerReceta(row.id, row.descripcion);
          }
        }}

      />
    </div>
  );
};

export default ListaRecetas;