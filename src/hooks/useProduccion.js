import { useQuery } from '@tanstack/react-query';
import { getProduccionByFilters } from '../service/api';

const CACHE_TIME = 5 * 60 * 1000;
const STALE_TIME = 1 * 60 * 1000;

export const useProduccion = (page, size, filters) => {
  const normalizedFilters = JSON.stringify(filters);
  
  return useQuery({
    queryKey: ['produccion', page, size, normalizedFilters],
    queryFn: () => getProduccionByFilters({
      page,
      size,
      ...JSON.parse(normalizedFilters)
    }).then(res => res.data),
    keepPreviousData: true,
    staleTime: STALE_TIME,
    cacheTime: CACHE_TIME,
    onSuccess: (data) => {
      if (data.totalPages > page + 1) {
        queryClient.prefetchQuery(
          ['produccion', page + 1, size, normalizedFilters],
          () => getProduccionByFilters({
            page: page + 1,
            size,
            ...JSON.parse(normalizedFilters)
          }).then(res => res.data)
        );
      }
    }
  });
};