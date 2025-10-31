import React, { useState } from 'react';
import { useAjustesInsumo } from '../../hooks/useAjustesInsumo';
import { useSucursales } from '../../hooks/useSucursales';
import { useInsumos } from '../../hooks/useInsumos';
import Table from '../../components/table/Table';
import FiltersPanel from '../../components/search/FiltersPanel';

const AjustesInsumoList = () => {
    const [filters, setFilters] = useState({
        page: 0,
        size: 20,
        sortBy: 'fechaAjuste',
        direction: 'desc'
    });

    const { data, isLoading, isError, error } = useAjustesInsumo(filters);
    const { data: sucursalesData } = useSucursales();
    const { data: insumosData } = useInsumos({
        nombre: '', 
        tipo: '', 
        sucursalId: '', 
        soloActivos: true 
    });
    
    // Opciones para el tipo de ajuste - usando los valores que vienen de la API
    const tipoAjusteOptions = [
        { id: 'ENTRADA', nombre: 'Entrada' },
        { id: 'SALIDA', nombre: 'Salida' }
    ];

    // Opciones para estado de ajuste
    const estadoAjusteOptions = [
        { id: 'INCREMENTO', nombre: 'Incremento' },
        { id: 'DECREMENTO', nombre: 'Decremento' }
    ];

    const columns = [
        {
            header: 'ID',
            accessor: 'id',
            show: false
        },
        {
            header: 'Fecha Ajuste',
            accessor: 'fechaAjuste',
            render: (row) => new Date(row.fechaAjuste).toLocaleString()
        },
        {
            header: 'Sucursal',
            accessor: 'sucursalNombre'
        },
        {
            header: 'Insumo',
            accessor: 'insumoNombre'
        },
        {
            header: 'Código Insumo',
            accessor: 'insumoCodigo'
        },
        {
            header: 'Descripción',
            accessor: 'insumoDescripcion'
        },
        {
            header: 'Unidades',
            accessor: 'insumoUnidades'
        },
        {
            header: 'Tipo Ajuste',
            accessor: 'tipoAjuste',
            render: (row) => (
                <span className={row.tipoAjuste === 'SALIDA' ? 'text-danger' : 'text-success'}>
                    {row.tipoAjuste === 'ENTRADA' ? '📥 Entrada' : '📤 Salida'}
                </span>
            )
        },
        {
            header: 'Estado Ajuste',
            accessor: 'estadoAjuste',
            render: (row) => (
                <span className={row.estadoAjuste === 'DECREMENTO' ? 'text-danger' : 'text-success'}>
                    {row.estadoAjuste === 'INCREMENTO' ? '➕ Incremento' : '➖ Decremento'}
                </span>
            )
        },
        {
            header: 'Diferencia',
            accessor: 'diferencia',
            render: (row) => (
                <span className={row.diferencia < 0 ? 'text-danger' : 'text-success'}>
                    {row.diferencia > 0 ? '+' : ''}{row.diferencia} {row.insumoUnidades}
                </span>
            )
        },
        {
            header: 'Cantidad Anterior',
            accessor: 'cantidadAnterior',
            render: (row) => `${row.cantidadAnterior} ${row.insumoUnidades}`
        },
        {
            header: 'Cantidad Nueva',
            accessor: 'cantidadNueva',
            render: (row) => `${row.cantidadNueva} ${row.insumoUnidades}`
        },
        {
            header: 'Stock Después Ajuste',
            accessor: 'stockDespuesAjuste',
            render: (row) => `${row.stockDespuesAjuste} ${row.insumoUnidades}`
        },
        {
            header: 'Motivo',
            accessor: 'motivo',
            render: (row) => row.motivo || 'Sin motivo especificado'
        },
        {
            header: 'Usuario Responsable',
            accessor: 'usuarioResponsable'
        }
    ];

    // Configuración de filtros mejorada
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
            name: 'insumoId',
            label: 'Insumo',
            placeholder: 'Todos los insumos',
            config: {
                options: insumosData?.data || [],
                valueKey: 'id',
                labelKey: 'nombre'
            }
        },
        {
            type: 'select',
            name: 'tipoAjuste',
            label: 'Tipo de Ajuste',
            placeholder: 'Todos los tipos',
            config: {
                options: tipoAjusteOptions,
                valueKey: 'id',
                labelKey: 'nombre'
            }
        },
        {
            type: 'select',
            name: 'estadoAjuste',
            label: 'Estado de Ajuste',
            placeholder: 'Todos los estados',
            config: {
                options: estadoAjusteOptions,
                valueKey: 'id',
                labelKey: 'nombre'
            }
        },
        {
            type: 'search',
            name: 'usuarioResponsable',
            label: 'Usuario Responsable',
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
            sortBy: 'fechaAjuste',
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

    // Función para debuggear los datos
    const debugData = () => {
        console.log('Datos completos:', data);
        console.log('Contenido:', data?.data?.content);
    };

    if (isError) {
        return (
            <div className="error-message">
                Error al cargar los ajustes de insumos: {error.message}
            </div>
        );
    }

    return (
        <div className="ajustes-insumo-list">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h1>Ajustes de Insumos</h1>
                <button 
                    onClick={debugData} 
                    style={{ 
                        padding: '5px 10px', 
                        fontSize: '12px',
                        backgroundColor: '#f0f0f0',
                        border: '1px solid #ccc',
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}
                >
                    Debug Data
                </button>
            </div>

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
                    data?.data ? {
                        currentPage: data.data.number,
                        totalPages: data.data.totalPages,
                        totalElements: data.data.totalElements,
                        rowsPerPage: data.data.size
                    } : null
                }
                onPageChange={handlePageChange}
                onRowsPerPageChange={handleRowsPerPageChange}
                showColumnVisibility={true}
                loading={isLoading}
                storageKey="ajustesInsumosHiddenColumns"
            />
        </div>
    );
};

export default AjustesInsumoList;