import { useInfiniteQuery } from '@tanstack/react-query';
import { getStockWithSucursal } from '../service/api';
import { useDebounce } from 'use-debounce';
import { useState } from 'react';

export const useProductosGeneral = (initialSearchTerm = '') => {
    const [searchTerm, setSearchTerm] = useState(initialSearchTerm);
    const [minPrice, setMinPrice] = useState('');
    const [maxPrice, setMaxPrice] = useState('');
    const [selectedSucursal, setSelectedSucursal] = useState('');
    const [debouncedSearchTerm] = useDebounce(searchTerm, 400);
    
    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetching,
        refetch,
        ...queryResult
    } = useInfiniteQuery({
        queryKey: ['productosGeneral', debouncedSearchTerm, minPrice, maxPrice, selectedSucursal],
        queryFn: ({ pageParam = 0 }) => 
            getStockWithSucursal(pageParam, 10, debouncedSearchTerm, minPrice, maxPrice, selectedSucursal)
                .then(res => ({
                    productos: res.data.content,
                    nextPage: !res.data.last ? pageParam + 1 : undefined
                })),
        getNextPageParam: (lastPage) => lastPage.nextPage,
        staleTime: 5 * 60 * 1000,
        cacheTime: 15 * 60 * 1000,
        keepPreviousData: true
    });

    const productos = data?.pages.flatMap(p => p.productos) || [];

    return {
        productos,
        searchTerm,
        setSearchTerm,
        minPrice,
        setMinPrice,
        maxPrice,
        setMaxPrice,
        selectedSucursal,
        setSelectedSucursal,
        fetchNextPage,
        hasNextPage,
        isFetching,
        refetch,
        ...queryResult
    };
};