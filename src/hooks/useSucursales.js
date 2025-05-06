import { useQuery } from '@tanstack/react-query';
import { getSucursales } from '../service/api';

export const useSucursales = () => {
  return useQuery({
    queryKey: ['sucursales'],
    queryFn: getSucursales,
    select: (response) => {
      const data = response.data;
      if (!Array.isArray(data)) {
        console.error('La respuesta de sucursales no es un array:', data);
        return [];
      }
      return data;
    },
    onError: (error) => {
      console.error('Error al obtener sucursales:', error);
    },
    staleTime: 1000 * 60 * 5, // Cachear por 5 minutos
    refetchOnWindowFocus: false, // No hacer peticiones innecesarias al volver a la página
  });
};
