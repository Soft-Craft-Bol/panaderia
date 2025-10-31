import { useState, useEffect } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { getInsumosBySucursal } from '../service/api';

export const useInsumorSucursalInf = (
  sucursalId,
  soloActivos = true,
  extraFilters = {} 
) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    tipo: null,
    unidades: null,
    ...extraFilters
  });
  
  const size = 10;

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    refetch,
    isLoading,
    error
  } = useInfiniteQuery({
    queryKey: [
      'insumos-sucursal-infinite',
      sucursalId,
      soloActivos,
      searchTerm,
      filters.tipo,
      filters.unidades,
    ],
    queryFn: ({ pageParam = 0 }) =>
      getInsumosBySucursal(sucursalId, soloActivos, {
        page: pageParam,
        size,
        nombre: searchTerm || undefined,
        tipo: filters.tipo || undefined,
        unidades: filters.unidades || undefined,
      }),
    getNextPageParam: (lastPage, allPages) =>
      lastPage && !lastPage.last ? allPages.length : undefined,
    enabled: !!sucursalId,
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    if (sucursalId) {
      // Usamos un pequeño timeout para evitar múltiples llamadas durante la escritura
      const timeoutId = setTimeout(() => {
        refetch();
      }, 300);
      
      return () => clearTimeout(timeoutId);
    }
  }, [searchTerm, sucursalId, filters, refetch]);

  const updateFilter = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setSearchTerm('');
    setFilters({
      tipo: null,
      unidades: null,
    });
  };

  const insumos = data?.pages?.flatMap(page => page.content) || [];

  return {
    insumos,
    loadMore: fetchNextPage,
    hasNextPage: hasNextPage || false,
    isFetching, 
    isFetchingNextPage,
    isLoading,
    error,
    searchTerm,
    setSearchTerm,
    filters,
    updateFilter,
    clearFilters,
    refetch,
  };
};