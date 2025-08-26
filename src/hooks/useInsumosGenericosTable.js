import { useQuery } from '@tanstack/react-query';
import { getInsumosGenericos } from '../service/api';

export const useInsumosGenericosTable = ({ nombre, page, size }) => {
  return useQuery({
    queryKey: ['insumosGenericos', { nombre, page, size }],
    queryFn: () => getInsumosGenericos({ nombre, page, size }),

    keepPreviousData: true,
    staleTime: 1000 * 60 * 5, 
    cacheTime: 1000 * 60 * 10, 
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchInterval: false,
  });
};
