import { useQuery } from '@tanstack/react-query';
import { getAjustes } from '../service/api';

export const useAjustes = (filters = {}, options = {}) => {
  const {
    sucursalId,
    itemId,
    itemCodigo,
    fechaDesde,
    fechaHasta,
    usuario,
    page = 0,
    size = 20,
    sortBy = 'fecha',
    direction = 'desc'
  } = filters;

  return useQuery({
    queryKey: [
      'ajustes',
      {
        sucursalId,
        itemId,
        itemCodigo,
        fechaDesde,
        fechaHasta,
        usuario,
        page,
        size,
        sortBy,
        direction
      }
    ],
    queryFn: () => getAjustes(filters),
    keepPreviousData: true,
    staleTime: 1000 * 60 * 5, 
    ...options
  });
};