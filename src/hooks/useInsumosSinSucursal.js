import { useQuery } from '@tanstack/react-query';
import { getInsumos } from '../service/api';

export const useInsumosSinSucursal = () => {
  return useQuery({
    queryKey: ['insumos'],
    queryFn: getInsumos,
    select: (response) => {
      const data = response.data.content || [];
      if (!Array.isArray(data)) {
        console.error('La respuesta de insumos no es un array:', data);
        return [];
      }
      return data;
    },
    onError: (error) => {
      console.error('Error al obtener insumos:', error);
    },
    staleTime: 1000 * 60 * 5, // Cachear por 5 minutos
    refetchOnWindowFocus: false,
  });
};