import { useQuery } from '@tanstack/react-query';
import { getInsumos } from '../service/api';

export const useInsumosTable = ({
  nombre = '',
  tipo = '',
  sucursalId = '',
  soloActivos = true,
  page = 0, 
  size = 10
}) => {
  const params = {
    page,
    size,
    nombre,
    tipo,
    ...(sucursalId && { sucursalId, soloActivos })
  };

  return useQuery({
    queryKey: ['insumos-table', params],
    queryFn: () => getInsumos(params),
    keepPreviousData: true,
    staleTime: 1000 * 60 * 5 // 5 minutos
  });
};