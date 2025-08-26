import { useQuery } from '@tanstack/react-query';
import { getRecetasByPage } from '../service/api';

export const useRecetas = (page = 1, size = 10, filters = {}) => {
  return useQuery({
    queryKey: ['recetas', 'list', { page, size, ...filters }],
    queryFn: () => getRecetasByPage({ page: page - 1, size, ...filters }),
    keepPreviousData: true,
    staleTime: 5 * 60 * 1000, 
    cacheTime: 15 * 60 * 1000,
    select: (res) => res.data,
  });
};