import { useQuery } from '@tanstack/react-query';
import { getInsumosBySucursal } from '../service/api';

export const useInsumosSucursal = (sucursalId, soloActivos, page, size, search) => {
  return useQuery({
    queryKey: ['insumos-sucursal', sucursalId, soloActivos, page, size, search],
    queryFn: () => getInsumosBySucursal(sucursalId, soloActivos, { page, size, search }),
    enabled: !!sucursalId,
    keepPreviousData: true,
    staleTime: 5 * 60 * 1000,
    cacheTime: 15 * 60 * 1000,
  });
};
