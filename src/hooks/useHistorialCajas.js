import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getHistorialCajas, verificarCajas } from '../service/api';

const CACHE_TIME = 30 * 60 * 1000; // 30 minutos
const STALE_TIME = 5 * 60 * 1000; // 5 minutos

export const useHistorialCajas = ({ userId, desde, hasta, page = 0, size = 10, enabled = true }) => {
  const queryClient = useQueryClient();
  
  return useQuery({
    queryKey: ['historialCajas', userId, desde, hasta, page, size],
    queryFn: () => getHistorialCajas(userId, desde, hasta, page, size).then(res => res.data),
    enabled,
    keepPreviousData: true,
    staleTime: STALE_TIME,
    cacheTime: CACHE_TIME,
    onSuccess: (data) => {
      console.log(data);
      if (data.totalPages > page + 1) {
        queryClient.prefetchQuery(
          ['historialCajas', userId, desde, hasta, page + 1, size],
          () => getHistorialCajas(userId, desde, hasta, page + 1, size).then(res => res.data)
        );
      }
    }
  });
};

export const useCajaActiva = (userId) => {
  return useQuery({
    queryKey: ['cajaActiva', userId],
    queryFn: () => verificarCajas(userId).then(res => res.data),
    staleTime: STALE_TIME,
    cacheTime: CACHE_TIME,
    refetchOnWindowFocus: true, 
    retry: 2, 
  });
};