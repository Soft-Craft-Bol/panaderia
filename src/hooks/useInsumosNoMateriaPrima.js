import { useState, useEffect } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { getInsumosBySucursalExcludingMateriaPrima } from '../service/api';

export const useInsumosNoMateriaPrima = (sucursalId, soloActivos = true) => {
  const [searchTerm, setSearchTerm] = useState('');
  const size = 10;

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    refetch,
  } = useInfiniteQuery({
    queryKey: ['insumos-no-materiaprima', sucursalId, soloActivos, searchTerm],
    queryFn: ({ pageParam = 0 }) => 
      getInsumosBySucursalExcludingMateriaPrima(sucursalId, soloActivos, { 
        page: pageParam, 
        size,
        search: searchTerm 
      }),
    getNextPageParam: (lastPage, allPages) => 
      !lastPage.last ? allPages.length : undefined,
    enabled: !!sucursalId,
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    refetch();
  }, [searchTerm, sucursalId, refetch]);

  const insumos = data?.pages.flatMap(page => page.content) || [];

  return {
    insumos,
    loadMore: fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    searchTerm,
    setSearchTerm,
  };
};