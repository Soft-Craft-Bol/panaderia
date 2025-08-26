import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { topClientes } from '../../service/api';
import Table from '../../components/table/Table';
import { toast } from 'sonner';

const TopClientsTable = () => {
  const { data: response, isLoading, error } = useQuery({
    queryKey: ['top-clientes'],
    queryFn: topClientes,
  });
  const clients = Array.isArray(response) ? response : response?.data || [];

  if (error) {
    toast.error('Error al cargar clientes frecuentes');
    return <div className="error">Error al cargar los datos</div>;
  }

  const columns = useMemo(() => [
    { header: 'ID', accessor: 'id'},
    { header: 'Cliente', accessor: 'nombreRazonSocial' },
    { header: 'Total de Compras', accessor: 'totalCompras' },
  ], []);

  return (
    <div>
      <Table
        columns={columns}
        data={clients}
        loading={isLoading}
        className="user-management-table"
      />
    </div>
  );
};

export default TopClientsTable;
