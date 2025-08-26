import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Table from '../../components/table/Table';
import ButtonPrimary from '../../components/buttons/ButtonPrimary';
import Modal from '../../components/modal/Modal';
import { FaFilter, FaTimes, FaTrash, FaEnvelope, FaPhone } from 'react-icons/fa';
import './ContactosTable.css';
import SelectSecondary from '../../components/selected/SelectSecondary';
import SearchInput from '../../components/search/SearchInput';
import ActionButtons from '../../components/buttons/ActionButtons';
import {
    getContactosByFilters,
    deleteContacto,
    getContactoById,
    updateContactoEstado
} from '../../service/api';
import ContactoDetail from './ContactoDetail';
import { toast } from 'sonner';

export const ASUNTOS_OPCIONES = [
    { value: 'PEDIDO_ESPECIAL', label: 'Pedido Especial' },
    { value: 'CONSULTA', label: 'Consulta' },
    { value: 'RECLAMO', label: 'Reclamo' },
    { value: 'SUGERENCIA', label: 'Sugerencia' },
    { value: '', label: 'Todos los asuntos' }
];

export const ESTADOS_OPCIONES = [
    { value: 'PENDIENTE', label: 'Pendiente' },
    { value: 'ATENDIDO', label: 'Atendido' },
    { value: 'DESCARTADO', label: 'Descartado' },
    { value: '', label: 'Todos los estados' }
];

const ContactoTable = () => {
    const [nombreFilter, setNombreFilter] = useState('');
    const [asuntoFilter, setAsuntoFilter] = useState('');
    const [estadoFilter, setEstadoFilter] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedContacto, setSelectedContacto] = useState(null);
    const [page, setPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const queryClient = useQueryClient();

    // Configuración de caching y paginación
    const {
        data,
        isLoading,
        error,
        isFetching,
        isPreviousData
    } = useQuery({
        queryKey: ['contactos', {
            page: page - 1,
            size: rowsPerPage,
            nombre: nombreFilter,
            asunto: asuntoFilter,
            atendido: estadoFilter
        }],
        queryFn: ({ queryKey }) => {
            const [, params] = queryKey;
            return getContactosByFilters(params);
        },
        keepPreviousData: true,
        staleTime: 5 * 60 * 1000,
        cacheTime: 15 * 60 * 1000
    });

    // Mutación para cambiar estado del contacto
    const updateEstadoMutation = useMutation({
        mutationFn: ({ id, estado }) => updateContactoEstado(id, estado),
        onMutate: async ({ id, estado }) => {
            await queryClient.cancelQueries(['contactos']);
            const previousContactos = queryClient.getQueryData(['contactos']);

            queryClient.setQueryData(['contactos'], old => ({
                ...old,
                content: old.content.map(contacto =>
                    contacto.id === id ? { ...contacto, atendido: estado } : contacto
                )
            }));

            return { previousContactos };
        },
        onError: (err, variables, context) => {
            queryClient.setQueryData(['contactos'], context.previousContactos);
            toast.error(`Error al actualizar estado: ${err.message}`);
        },
        onSuccess: () => {
            toast.success('Estado del contacto actualizado correctamente');
        },
        onSettled: () => {
            queryClient.invalidateQueries(['contactos']);
        }
    });

    const deleteMutation = useMutation({
        mutationFn: (id) => deleteContacto(id),
        onSuccess: () => {
            queryClient.invalidateQueries(['contactos']);
            toast.success('Contacto eliminado correctamente');
        },
        onError: (error) => {
            toast.error(`Error al eliminar contacto: ${error.message}`);
        }
    });

    const contactos = data?.data?.content || [];
    const totalPages = data?.data?.totalPages || 1;
    const totalElements = data?.data?.totalElements || 0;

    const handleViewDetails = async (contacto) => {
        try {
            const response = await getContactoById(contacto.id);
            setSelectedContacto(response.data);
            setModalOpen(true);
        } catch (error) {
            toast.error('Error al cargar detalles del contacto');
        }
    };

    const handleChangeEstado = (id, estado) => {
        if (window.confirm(`¿Está seguro que desea marcar este contacto como ${estado}?`)) {
            updateEstadoMutation.mutate({ id, estado });
        }
    };

    const handleDelete = (id) => {
        if (window.confirm('¿Está seguro que desea eliminar este contacto?')) {
            deleteMutation.mutate(id);
        }
    };

    const handleStatusChange = (estado) => {
        if (selectedContacto && selectedContacto.id) {
            updateEstadoMutation.mutate({
                id: selectedContacto.id,
                estado
            });
            setModalOpen(false);
        }
    };

    const columns = [
        {
            accessor: 'name',
            header: 'Nombre',
            render: (row) => (
                <div className="contacto-cell">
                    <span className="contacto-name">{row.name}</span>
                    <div className="contacto-contact">
                        {row.correo && (
                            <a href={`mailto:${row.correo}`} className="contacto-email">
                                <FaEnvelope /> {row.correo}
                            </a>
                        )}
                        {row.telefono && (
                            <a href={`tel:${row.telefono}`} className="contacto-phone">
                                <FaPhone /> {row.telefono}
                            </a>
                        )}
                    </div>
                </div>
            )
        },
        {
            accessor: 'asunto',
            header: 'Asunto',
            render: (row) => {
                const asunto = ASUNTOS_OPCIONES.find(a => a.value === row.asunto);
                return <span>{asunto?.label || row.asunto}</span>;
            }
        },
        {
            accessor: 'detalles',
            header: 'Detalles',
            render: (row) => (
                <div className="contacto-details">
                    {row.detalles.length > 50 ?
                        `${row.detalles.substring(0, 50)}...` :
                        row.detalles
                    }
                </div>
            )
        },
        {
            accessor: 'atendido',
            header: 'Estado',
            render: (row) => {
                const estado = ESTADOS_OPCIONES.find(e => e.value === row.atendido);
                return (
                    <span
                        className={`estado-badge ${row.atendido.toLowerCase()}`}
                        style={{
                            backgroundColor: row.atendido === 'PENDIENTE' ? '#fff3e0' :
                                row.atendido === 'ATENDIDO' ? '#e8f5e9' : '#ffebee',
                            color: row.atendido === 'PENDIENTE' ? '#f57c00' :
                                row.atendido === 'ATENDIDO' ? '#388e3c' : '#d32f2f'
                        }}
                    >
                        {estado?.label || row.atendido}
                    </span>
                );
            }
        },
        {
            accessor: 'actions',
            header: 'Acciones',
            render: (row) => (
                <div className="contacto-actions">
                    <ActionButtons
                        onView={() => handleViewDetails(row)}
                        onDelete={() => handleDelete(row.id)}
                        showEdit={false}
                        deleteTooltip="Eliminar contacto"
                        customButtons={[
                            {
                                icon: <FaTimes />,
                                onClick: () => handleChangeEstado(row.id, 'DESCARTADO'),
                                tooltip: 'Descartar contacto',
                                variant: 'danger',
                                show: row.atendido === 'PENDIENTE'
                            }
                        ]}
                    />
                </div>
            )
        }
    ];

    const handlePageChange = (newPage) => {
        if (!isPreviousData && newPage > 0 && newPage <= totalPages) {
            setPage(newPage);
        }
    };

    const handleRowsPerPageChange = (newSize) => {
        setRowsPerPage(newSize);
        setPage(1);
    };

    return (
        <div className="contacto-table-container">
            <div className="table-header">
                <h2>Contactos</h2>

                <div className="table-actions">
                    <ButtonPrimary
                        onClick={() => setShowFilters(!showFilters)}
                        variant="secondary"
                    >
                        <FaFilter /> {showFilters ? 'Ocultar Filtros' : 'Mostrar Filtros'}
                    </ButtonPrimary>
                </div>
            </div>

            {showFilters && (
                <div className="filters-container">
                    <div className="filter-group">
                        <SearchInput
                            placeholder="Buscar por nombre"
                            initialValue={nombreFilter}
                            onSearch={(term) => {
                                setNombreFilter(term);
                                setPage(1);
                            }}
                            debounceTime={400}
                        />
                    </div>

                    <div className="filter-group">
                        <SelectSecondary
                            value={asuntoFilter}
                            formikCompatible={false}
                            onChange={(e) => {
                                setAsuntoFilter(e.target.value);
                                setPage(1);
                            }}
                            placeholder="Filtrar por asunto..."
                        >
                            {ASUNTOS_OPCIONES.map(asunto => (
                                <option key={asunto.value} value={asunto.value}>
                                    {asunto.label}
                                </option>
                            ))}
                        </SelectSecondary>
                    </div>

                    <div className="filter-group">
                        <SelectSecondary
                            value={estadoFilter}
                            formikCompatible={false}
                            onChange={(e) => {
                                setEstadoFilter(e.target.value);
                                setPage(1);
                            }}
                            placeholder="Filtrar por estado..."
                        >
                            {ESTADOS_OPCIONES.map(estado => (
                                <option key={estado.value} value={estado.value}>
                                    {estado.label}
                                </option>
                            ))}
                        </SelectSecondary>
                    </div>
                </div>
            )}

            <Table
                columns={columns}
                data={contactos}
                onRowClick={handleViewDetails}
                loading={isLoading || isFetching}
                pagination={{
                    currentPage: page,
                    totalPages: totalPages,
                    totalElements: totalElements,
                    rowsPerPage: rowsPerPage
                }}
                onPageChange={handlePageChange}
                onRowsPerPageChange={handleRowsPerPageChange}
            />

            <Modal
                isOpen={modalOpen}
                onClose={() => {
                    setModalOpen(false);
                    setSelectedContacto(null);
                }}
                size="lg"
            >
                {selectedContacto && (
                    <ContactoDetail
                        contacto={selectedContacto}
                        onClose={() => setModalOpen(false)}
                        onStatusChange={handleStatusChange}
                    />
                )}
            </Modal>
        </div>
    );
};

export default ContactoTable;