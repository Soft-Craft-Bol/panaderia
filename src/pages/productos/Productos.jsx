import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import './Productos.css';
import CardProducto from '../../components/cardProducto/cardProducto';
import ModalConfirm from '../../components/modalConfirm/ModalConfirm';
import { getStockWithSucursal, deleteItem, getSucursales, sumarCantidadDeProducto, addItemToSucursal, quitarPromocion, getCategorias } from '../../service/api';
import '../users/ListUser.css';
import { Toaster, toast } from "sonner";
import InfiniteScroll from 'react-infinite-scroll-component';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { FiPlus, FiPackage, FiClipboard, FiActivity } from 'react-icons/fi';
import { Button } from "../../components/buttons/Button";
import Modal from "../../components/modal/Modal";
import CategoriaForm from "../categoria/CategoriaForm";
import FiltersPanel from "../../components/search/FiltersPanel";
import RefetchButton from "../../components/buttons/RefetchButton";

const Productos = () => {
  const [showModal, setShowModal] = useState(false);
  const [showPromoModal, setShowPromoModal] = useState(false);
  const [selectedProductForPromo, setSelectedProductForPromo] = useState(null);
  const [productoAEliminar, setProductoAEliminar] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [sucursales, setSucursales] = useState([]);
  const [cantidades, setCantidades] = useState({});
  const [isCategoriaModalOpen, setIsCategoriaModalOpen] = useState(false);
  
  // Estado para los filtros
  const [filters, setFilters] = useState({
    searchTerm: '',
    categoriaId: null,
    sucursalId: null,
    conDescuento: null,
    sortBy: 'descripcion',
    sortDirection: 'asc'
  });

  // Estado para el término de búsqueda con debounce
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

  const navigate = useNavigate();
  const dataLabels = {
    data1: 'Cantidad General:',
    data2: 'Precio unitario:',
    data3: 'Código Producto SIN:',
    data4: 'Categoría:'
  };

  // Configuración de debounce para el término de búsqueda
  useEffect(() => {
    const timerId = setTimeout(() => {
      setDebouncedSearchTerm(filters.searchTerm);
    }, 400);

    return () => {
      clearTimeout(timerId);
    };
  }, [filters.searchTerm]);

  // Obtener sucursales
  const { data: sucursalesData = [] } = useQuery({
    queryKey: ['sucursales'],
    queryFn: () => getSucursales().then(res => res.data),
  });

  // Obtener categorías
  const { data: categorias = [], refetch: refetchCategorias } = useQuery({
    queryKey: ['categorias'],
    queryFn: () => getCategorias().then(res => res.data),
  });

  // Query principal para obtener productos
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetching,
    refetch
  } = useInfiniteQuery({
    queryKey: ['productos', debouncedSearchTerm, filters.categoriaId, filters.sucursalId, filters.conDescuento, filters.sortBy, filters.sortDirection],
    queryFn: ({ pageParam = 0 }) =>
      getStockWithSucursal(
        pageParam,
        10,
        debouncedSearchTerm,
        null, // codigo (no usado en tu API original)
        filters.conDescuento,
        filters.sucursalId,
        filters.categoriaId,
        filters.sortBy,
        filters.sortDirection
      ).then(res => ({
        productos: res.data.content,
        nextPage: !res.data.last ? pageParam + 1 : undefined
      })),
    getNextPageParam: (lastPage) => lastPage.nextPage,
    staleTime: 5 * 60 * 1000,
    cacheTime: 15 * 60 * 1000,
    keepPreviousData: true
  });

  const productos = data?.pages.flatMap(p => p.productos) || [];

  const productosPorCategoria = productos.reduce((acc, prod) => {
    const categoria = prod.categoria || "Sin categoría";
    if (!acc[categoria]) {
      acc[categoria] = [];
    }
    acc[categoria].push(prod);
    return acc;
  }, {});

  const getDescripcionProducto = (codigoProducto) => {
    const producto = productos.find(p => p.codigoProductoSin === codigoProducto);
    return producto ? producto.descripcion : 'Descripción no disponible';
  };

  const handleOpenModal = (product) => {
    setProductoAEliminar(product);
    setShowModal(true);
  };

  const handleOpenModalAdd = (product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
    const initialCantidades = {};
    sucursalesData.forEach((sucursal) => {
      initialCantidades[sucursal.id] = "";
    });
    setCantidades(initialCantidades);
  };

  const handleCloseModal = () => {
    console.log("Modal cerrado");
    setShowModal(false);
    setProductoAEliminar(null);
  };

  const confirmarAccion = async () => {
    if (productoAEliminar) {
      try {
        await deleteItem(productoAEliminar.id);
        refetch(); // Refetch data after deletion
        toast.success("Producto eliminado correctamente");
      } catch (error) {
        console.error("Error al eliminar el producto:", error);
        toast.error("Error al eliminar el producto");
      }
    }
    setShowModal(false);
    setProductoAEliminar(null);
  };

  const handleConfirm = async () => {
    if (selectedProduct) {
      try {
        for (const sucursalId in cantidades) {
          const cantidad = cantidades[sucursalId];
          if (cantidad !== "" && cantidad > 0) {
            const productoEnSucursal = selectedProduct.sucursales.find((s) => s.sucursalId === Number(sucursalId));

            if (productoEnSucursal) {
              await sumarCantidadDeProducto(sucursalId, selectedProduct.id, cantidad);
            } else {
              await addItemToSucursal(sucursalId, selectedProduct.id, cantidad);
            }
          }
        }
        toast.success("Cantidades agregadas correctamente");
        refetch(); // Refetch data after adding quantities
      } catch (error) {
        console.error('Error al agregar cantidades:', error);
        toast.error('Error al agregar cantidades');
      }
    }
    setIsModalOpen(false);
  };

  const handleRemovePromocionInit = (product) => {
    setSelectedProductForPromo(product);
    setShowPromoModal(true);
  };

  const handleRemovePromocionConfirm = async (sucursalId) => {
    try {
      await quitarPromocion(selectedProductForPromo.id, sucursalId);
      toast.success("Promoción eliminada correctamente");
      refetch();
      setShowPromoModal(false);
    } catch (error) {
      console.error("Error al eliminar la promoción:", error);
      toast.error(error.response?.data?.message || "Error al eliminar la promoción");
    }
  };

  const handleKeyDown = (e) => {
    if (
      !/[0-9]/.test(e.key) &&
      e.key !== "Backspace" &&
      e.key !== "Delete" &&
      e.key !== "ArrowLeft" &&
      e.key !== "ArrowRight"
    ) {
      e.preventDefault();
    }
  };

  const hasDiscount = (product) => {
    return product.sucursales.some(s => s.tieneDescuento);
  };

  const handleFilterChange = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const handleResetFilters = () => {
    setFilters({
      searchTerm: '',
      categoriaId: null,
      sucursalId: null,
      conDescuento: null,
      sortBy: 'descripcion',
      sortDirection: 'asc'
    });
  };

  const handleCategoriaCreada = () => {
    refetchCategorias(); 
    setIsCategoriaModalOpen(false);
  };

  const filtersConfig = [
  {
    type: 'search',
    name: 'searchTerm',
    placeholder: 'Buscar por código o descripción...',
    config: {
      debounceTime: 400
    }
  },
  {
    type: 'select',
    name: 'categoriaId',
    label: 'Categoría',
    config: {
      options: categorias || [], // VALIDACIÓN: Asegurar que sea array
      valueKey: 'id',
      labelKey: 'nombre',
    }
  },
  {
    type: 'select',
    name: 'sucursalId',
    label: 'Sucursal',
    config: {
      options: sucursalesData || [], // VALIDACIÓN: Asegurar que sea array
      valueKey: 'id',
      labelKey: 'nombre'
    }
  },
  {
    type: 'select',
    name: 'conDescuento',
    label: 'Con descuento',
    config: {
      options: [
        { id: 'true', nombre: 'Sí' },
        { id: 'false', nombre: 'No' }
      ],
      valueKey: 'id',
      labelKey: 'nombre'
    }
  },
  {
    type: 'select',
    name: 'sort',
    label: 'Ordenar por',
    config: {
      options: [
        { id: 'descripcion,asc', nombre: 'Nombre (A-Z)' },
        { id: 'descripcion,desc', nombre: 'Nombre (Z-A)' },
        { id: 'precioUnitario,asc', nombre: 'Precio (menor a mayor)' },
        { id: 'precioUnitario,desc', nombre: 'Precio (mayor a menor)' }
      ],
      valueKey: 'id',
      labelKey: 'nombre',
      onChange: (value) => {
        if (value) {
          const [sortBy, sortDirection] = value.split(',');
          setFilters(prev => ({ ...prev, sortBy, sortDirection }));
        } else {
          setFilters(prev => ({ ...prev, sortBy: 'descripcion', sortDirection: 'asc' }));
        }
      }
    }
  }
];

  return (
    <div className="productos-contenedor">
      <Toaster dir="auto" closeButton richColors visibleToasts={2} duration={2000} position="bottom-right" />
      <div className="header-productos">
        <h1 className="titulo-seccion">
          <FiPackage style={{ marginRight: '0.5rem' }} />
          Productos en stock
        </h1>

        <div className="acciones-productos">
          <Button variant="primary" onClick={() => navigate("/addProduct")}>
            <FiPlus />
            Nuevo Producto
          </Button>

          <Button variant="primary" onClick={() => navigate("/productos/insumos")}>
            <FiPackage />
            Insumos
          </Button>

          <Button variant="primary" onClick={() => navigate("/recetas")}>
            <FiClipboard />
            Recetas
          </Button>

          <Button variant="primary" onClick={() => navigate("/movimientos")}>
            <FiActivity />
            Movimientos
          </Button>

          <Button variant="primary" onClick={() => setIsCategoriaModalOpen(true)}>
            <FiPlus />
            Crear Nueva Categoria
          </Button>
          <RefetchButton onRefetch={refetch} />
        </div>
      </div>

      <FiltersPanel
        filtersConfig={filtersConfig}
        filters={filters}
        onFilterChange={handleFilterChange}
        onResetFilters={handleResetFilters}
      />

      <InfiniteScroll
        dataLength={productos.length}
        next={fetchNextPage}
        hasMore={hasNextPage}
        loader={<h4>Cargando...</h4>}
        endMessage={
          <p style={{ textAlign: 'center' }}>
            <b>No hay más productos para mostrar</b>
          </p>
        }
      >
        <div className="cardsProducto-contenedor">
          {Object.entries(productosPorCategoria).map(([categoria, productosCategoria]) => (
            <div key={categoria} className="categoria-section">
              <h2 className="categoria-titulo">{categoria}</h2>
              <div className="categoria-grid">
                {productosCategoria.map((product) => (
                  <div
                    key={product.id}
                    className={`product-card-container ${hasDiscount(product) ? 'has-discount' : ''}`}
                  >
                    {hasDiscount(product) && (
                      <div className="discount-badge">
                        ¡EN DESCUENTO!
                        <button
                          className="btn-remove-promo"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemovePromocionInit(product);
                          }}
                          title="Eliminar promoción"
                        >
                          ✕
                        </button>
                      </div>
                    )}
                    <CardProducto
                      dataLabels={dataLabels}
                      product={product}
                      onEliminar={() => handleOpenModal(product)}
                      onEdit={`/editProduct/${product.id}`}
                      onAdd={() => handleOpenModalAdd(product)}
                      descripcionProducto={getDescripcionProducto(product.codigoProductoSin)}
                      onPromocionAplicada={refetch}
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </InfiniteScroll>

      <Modal isOpen={isCategoriaModalOpen} onClose={() => setIsCategoriaModalOpen(false)}>
        <CategoriaForm onSuccess={handleCategoriaCreada} />
      </Modal>

      {showPromoModal && selectedProductForPromo && (
        <div className="modal-promo">
          <div className="modal-promo-content">
            <h2>Eliminar promoción</h2>
            <p>Selecciona la sucursal donde quieres quitar la promoción:</p>

            <div className="sucursal-list">
              {selectedProductForPromo.sucursales
                .filter(s => s.tieneDescuento)
                .map(sucursal => (
                  <div key={sucursal.sucursalId} className="sucursal-item-promo">
                    <button
                      onClick={() => handleRemovePromocionConfirm(sucursal.sucursalId)}
                      className="btn-sucursal-promo"
                    >
                      {sucursal.nombre}
                    </button>
                  </div>
                ))
              }
            </div>

            <div className="botones-footer">
              <button
                className="btn-cancel"
                onClick={() => setShowPromoModal(false)}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="modalCant">
          <div className="modalCant-content">
            <h2>Agregar Cantidad</h2>
            {sucursalesData.map((sucursal) => {
              const productoEnSucursal = selectedProduct.sucursales.find((s) => s.sucursalId === sucursal.id);
              return (
                <div key={sucursal.id} className="sucursal-item">
                  <label>{sucursal.nombre}</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="Ingrese la cantidad"
                    value={cantidades[sucursal.id] || ""}
                    onChange={(e) => setCantidades((prev) => ({
                      ...prev,
                      [sucursal.id]: e.target.value === "" ? "" : Number(e.target.value),
                    }))}
                    onKeyDown={handleKeyDown}
                  />
                  <label>Cantidad actual: {productoEnSucursal ? productoEnSucursal.cantidad : 0}</label>
                </div>
              );
            })}
            <div className="botones-footer">
              <button className="btn-edit" onClick={handleConfirm}>Confirmar</button>
              <button className="btn-cancel" onClick={() => setIsModalOpen(false)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}

      <ModalConfirm
        isOpen={showModal}
        onClose={handleCloseModal}
        onConfirm={confirmarAccion}
        title="Confirmar eliminación"
        message="¿Estás seguro de que quieres eliminar este producto?"
        confirmText="Eliminar"
        cancelText="Cancelar"
        danger
      />
    </div>
  );
};

export default Productos;