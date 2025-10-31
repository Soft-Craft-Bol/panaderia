import React, { useState } from 'react';
import { useAjustes } from '../../hooks/useAjustes';
import { useSucursales } from '../../hooks/useSucursales';
import { useProductos } from '../../hooks/useProductos';
import Table from '../../components/table/Table';
import FiltersPanel from '../../components/search/FiltersPanel';

const AjustesList = () => {
    const [filters, setFilters] = useState({
        page: 0,
        size: 20,
        sortBy: 'fecha',
        direction: 'desc'
    });

    const { data, isLoading, isError, error } = useAjustes(filters);
    const { data: sucursalesData } = useSucursales();
    const { data: itemsData } = useProductos();
    const columns = [
        {
            header: 'ID',
            accessor: 'id',
            show: false // Oculto por defecto
        },
        {
            header: 'Fecha',
            accessor: 'fecha',
            render: (row) => new Date(row.fecha).toLocaleString()
        },
        {
            header: 'Sucursal',
            accessor: 'sucursalNombre'
        },
        {
            header: 'Item',
            accessor: 'itemDescripcion',
        },
        {
            header: 'Código',
            accessor: 'itemCodigo'
        },
        {
            header: 'Ajuste',
            accessor: 'cantidadAjuste',
            render: (row) => (
                <span className={row.cantidadAjuste < 0 ? 'text-danger' : 'text-success'}>
                    {row.cantidadAjuste}
                </span>
            )
        },
        {
            header: 'Stock Después',
            accessor: 'stockDespuesAjuste'
        },
        {
            header: 'Observación',
            accessor: 'observacion'
        },
        {
            header: 'Usuario',
            accessor: 'usuario'
        }
    ];

    // Configuración de filtros
    const filtersConfig = [
        {
            type: 'select',
            name: 'sucursalId',
            label: 'Sucursal',
            placeholder: 'Todas las sucursales',
            config: {
                options: sucursalesData?.data || [],
                valueKey: 'id',
                labelKey: 'nombre'
            }
        },
        {
            type: 'select',
            name: 'itemId',
            label: 'Item',
            placeholder: 'Todos los items',
            config: {
                options: itemsData?.data || [],
                valueKey: 'id',
                labelKey: 'descripcion'
            }
        },
        {
            type: 'search',
            name: 'itemCodigo',
            label: 'Código Item',
            placeholder: 'Buscar por código...',
            config: {
                debounceTime: 500
            }
        },
        {
            type: 'search',
            name: 'usuario',
            label: 'Usuario',
            placeholder: 'Buscar por usuario...',
            config: {
                debounceTime: 500
            }
        },
        {
            type: 'date',
            name: 'fechaDesde',
            label: 'Fecha Desde',
            config: {
                dateFormat: 'dd/MM/yyyy'
            }
        },
        {
            type: 'date',
            name: 'fechaHasta',
            label: 'Fecha Hasta',
            config: {
                dateFormat: 'dd/MM/yyyy'
            }
        }
    ];

    const handleFilterChange = (newFilters) => {
        setFilters(prev => ({
            ...prev,
            ...newFilters,
            page: 0 // Resetear a primera página cuando cambian filtros
        }));
    };

    const handleResetFilters = () => {
        setFilters({
            page: 0,
            size: 20,
            sortBy: 'fecha',
            direction: 'desc'
        });
    };

    const handlePageChange = (newPage) => {
        setFilters(prev => ({ ...prev, page: newPage }));
    };

    const handleRowsPerPageChange = (newSize) => {
        setFilters(prev => ({ ...prev, size: newSize, page: 0 }));
    };

    const handleRowClick = (row) => {
        console.log('Row clicked:', row);
        // Aquí puedes manejar el click, por ejemplo abrir un modal de detalles
    };

    if (isError) {
        return (
            <div className="error-message">
                Error al cargar los ajustes: {error.message}
            </div>
        );
    }

    return (
        <div className="ajustes-list">
            <h1>Ajustes de Inventario</h1>

            <FiltersPanel
                filtersConfig={filtersConfig}
                filters={filters}
                onFilterChange={handleFilterChange}
                onResetFilters={handleResetFilters}
                layout="grid"
            />

            <Table
                columns={columns}
                data={data?.data?.content || []}
                onRowClick={handleRowClick}
                pagination={
                    data ? {
                        currentPage: data.number + 1,
                        totalPages: data.totalPages,
                        totalElements: data.totalElements,
                        rowsPerPage: data.size
                    } : null
                }
                onPageChange={handlePageChange}
                onRowsPerPageChange={handleRowsPerPageChange}
                showColumnVisibility={true}
                loading={isLoading}
                storageKey="ajustesHiddenColumns"
            />
        </div>
    );
};

export default AjustesList;