import { useInfiniteQuery } from '@tanstack/react-query';
import { getInsumos } from '../service/api';

const PAGE_SIZE = 10;

export const useInsumos = ({ nombre = '', tipo = '', sucursalId = '', soloActivos = true }) => {
  const queryKey = ['insumos', { nombre, tipo, sucursalId, soloActivos }];
  
  const query = useInfiniteQuery({
    queryKey,
    queryFn: ({ pageParam = 0 }) =>
      getInsumos({ 
        page: pageParam, 
        size: PAGE_SIZE, 
        nombre, 
        tipo,
        ...(sucursalId && { sucursalId, soloActivos })
      }),
    getNextPageParam: (lastPage) => {
      if (!lastPage?.data) return undefined;
      const { number, totalPages } = lastPage.data;
      return number + 1 < totalPages ? number + 1 : undefined;
    },
    select: (data) => {
      return {
        pages: data.pages,
        pageParams: data.pageParams,
        // Aplanamos los datos para usar en la tabla
        flatData: data.pages.flatMap(page => page.data?.content || [])
      };
    },
    staleTime: 1000 * 60 * 5 // 5 minutos
  });

  return {
    ...query,
    data: query.data?.flatData || [],
    pagination: query.data?.pages[0]?.data || {},
    hasMore: query.hasNextPage
  };
};