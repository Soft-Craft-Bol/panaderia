import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query'; // Añade useQueryClient
import { getProductosByPuntoVenta } from '../service/api';
import { useDebounce } from 'use-debounce';
import { useState } from 'react';

export const useProductos = (puntoVentaId, initialSearchTerm = '') => {
    const queryClient = useQueryClient(); // Añade esta línea
    const [searchTerm, setSearchTerm] = useState(initialSearchTerm);
    const [codigoProductoSin, setCodigoProductoSin] = useState(null);
    const [minPrice, setMinPrice] = useState('');
    const [maxPrice, setMaxPrice] = useState('');
    const [conDescuento, setConDescuento] = useState(null);
    const [categoriaIds, setCategoriaIds] = useState([]);
    const [sinStock, setSinStock] = useState(null);
    const [sortField, setSortField] = useState('cantidad,desc');
    const [debouncedSearchTerm] = useDebounce(searchTerm, 400);
    const [debouncedCodigoProductoSin] = useDebounce(codigoProductoSin, 400);
    
    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetching,
        refetch,
        ...queryResult
    } = useInfiniteQuery({
        queryKey: [
            'productos', 
            puntoVentaId, 
            debouncedSearchTerm, 
            debouncedCodigoProductoSin,
            conDescuento,
            categoriaIds,
            sinStock,
            sortField
        ],
        queryFn: ({ pageParam = 0 }) => 
            getProductosByPuntoVenta(
                puntoVentaId,
                pageParam, 
                10, 
                debouncedSearchTerm,
                debouncedCodigoProductoSin, 
                conDescuento,
                categoriaIds,
                sinStock,
                sortField 
            ).then(res => ({
                productos: res.data.productos,
                paginaActual: res.data.paginaActual,
                totalPaginas: res.data.totalPaginas,
                nextPage: res.data.paginaActual < res.data.totalPaginas - 1 
                    ? pageParam + 1 
                    : undefined
            })),
        getNextPageParam: (lastPage) => lastPage.nextPage,
        staleTime: 5 * 60 * 1000,
        cacheTime: 15 * 60 * 1000,
        keepPreviousData: true
    });

    const productos = data?.pages.flatMap(p => p.productos) || [];
    const totalProductos = data?.pages[0]?.totalElementos || 0;

    const loadMore = () => {
        if (hasNextPage && !isFetching) {
            fetchNextPage();
        }
    };

    // Función para invalidar y refrescar los datos
    const invalidateAndRefetch = async () => {
        await queryClient.invalidateQueries([
            'productos', 
            puntoVentaId, 
            debouncedSearchTerm, 
            debouncedCodigoProductoSin,
            conDescuento,
            sinStock,
            sortField
        ]);
        await refetch();
    };

    return {
        productos,
        totalProductos,
        searchTerm,
        setSearchTerm,
        codigoProductoSin,
        setCodigoProductoSin,
        minPrice,
        setMinPrice,
        maxPrice,
        setMaxPrice,
        conDescuento,
        setConDescuento,
        categoriaIds,
        setCategoriaIds,
        sinStock,
        setSinStock,
        sortField,
        setSortField,
        loadMore,
        hasNextPage,
        isFetching,
        refetch,
        invalidateAndRefetch,
        ...queryResult
    };
};