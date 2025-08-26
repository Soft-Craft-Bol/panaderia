// useVentasSinFactura.js
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getVentasSinFactura } from '../service/api';
import { useDebounce } from './useDebounce';

export const useVentasSinFactura = (initialFilters = {}) => {
  const [filters, setFilters] = useState({
    fechaDesde: null,
    fechaHasta: null,
    metodoPago: '',
    codigoCliente: '',
    codigoProducto: '',
    montoMin: null,
    montoMax: null,
    page: 0,
    size: 10,
    ...initialFilters
  });

  const debouncedCodigoCliente = useDebounce(filters.codigoCliente, 500);
  const debouncedCodigoProducto = useDebounce(filters.codigoProducto, 500);

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['ventasSinFactura', { ...filters, debouncedCodigoCliente, debouncedCodigoProducto }],
    queryFn: async () => {
      const response = await getVentasSinFactura(
        filters.fechaDesde,
        filters.fechaHasta,
        filters.metodoPago,
        debouncedCodigoCliente,
        debouncedCodigoProducto,
        filters.montoMin,
        filters.montoMax,
        filters.page,
        filters.size
      );
      return response.data;
    },
    keepPreviousData: true, 
    staleTime: 1000 * 60 * 5,
  });

  const handlePageChange = (newPage) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  const handleSizeChange = (newSize) => {
    setFilters(prev => ({ ...prev, size: newSize, page: 0 }));
  };

  const updateFilters = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters, page: 0 }));
  };

  const resetFilters = () => {
    setFilters({
      fechaDesde: null,
      fechaHasta: null,
      metodoPago: '',
      codigoCliente: '',
      codigoProducto: '',
      montoMin: null,
      montoMax: null,
      page: 0,
      size: 10,
      ...initialFilters
    });
  };

  return {
    ventas: data?.content || [],
    pagination: {
      page: data?.pageable?.pageNumber || 0,
      size: data?.size || 10,
      totalPages: data?.totalPages || 0,
      totalElements: data?.totalElements || 0,
    },
    loading: isLoading,
    error: isError ? error.response?.data?.message || 'Error al cargar ventas' : null,
    filters,
    handlePageChange,
    handleSizeChange,
    updateFilters,
    resetFilters,
    refetch
  };
};