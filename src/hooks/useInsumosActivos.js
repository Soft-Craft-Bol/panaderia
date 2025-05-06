import { useQuery } from '@tanstack/react-query';
import { getActivos } from '../service/api';

export const useInsumosActivos = () => {
  return useQuery({
    queryKey: ['insumosActivos'],
    queryFn: getActivos,
    onError: (error) => {
      console.error('Error al obtener insumos activos:', error);
    },
    staleTime: 1000 * 60 * 5, // Cachear por 5 minutos
    refetchOnWindowFocus: false, // No hacer peticiones innecesarias
  });
};
