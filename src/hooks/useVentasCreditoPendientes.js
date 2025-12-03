import { useQuery } from '@tanstack/react-query';
import { listarVentasCreditoPendientes } from '../service/api';

export function useVentasCreditoPendientes(page, size) {
  return useQuery({
    queryKey: ['ventas-credito-pendientes', page, size],  // 🔥 cache por página
    queryFn: () => listarVentasCreditoPendientes(page - 1, size).then(res => res.data),

    staleTime: 1000 * 60 * 2,    // 2 min sin recargar
    cacheTime: 1000 * 60 * 10,   // 10 min cacheado
    keepPreviousData: true,      // 🔥 mantiene la página anterior mientras carga la nueva
    refetchOnWindowFocus: false,
  });
}
