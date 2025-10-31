import { useQuery } from '@tanstack/react-query';
import { getAjustesInsumo } from '../service/api';

export const useAjustesInsumo = (filters = {}, options = {}) => {
  const {
    sucursalId,
    insumoId,
    fechaDesde,
    fechaHasta,
    usuarioResponsable,
    tipoAjuste,
    page = 0,
    size = 20,
    sortBy = 'fechaAjuste',
    direction = 'desc'
  } = filters;

  return useQuery({
    queryKey: [
      'ajustes-insumo',
      {
        sucursalId,
        insumoId,
        fechaDesde,
        fechaHasta,
        usuarioResponsable,
        tipoAjuste,
        page,
        size,
        sortBy,
        direction
      }
    ],
    queryFn: () => getAjustesInsumo(filters),
    keepPreviousData: true,
    staleTime: 1000 * 60 * 5,
    select: (data) => {
      return {
        ...data,
        data: {
          ...data.data,
          content: data.data?.content?.map(ajuste => ({
            ...ajuste,
            cantidad: ajuste.diferencia,
            stockAnterior: ajuste.cantidadAnterior,
            stockActual: ajuste.stockDespuesAjuste,
            observacion: ajuste.motivo,
            fechaCreacion: ajuste.fechaAjuste
          })) || []
        }
      };
    },
    ...options
  });
};