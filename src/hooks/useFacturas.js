import { useQuery } from "@tanstack/react-query";
import { getAllFacturas } from "../service/api";

const useFacturas = (page = 0, size = 10, searchTerm = "", filters = {}) => {
  return useQuery({
    queryKey: ['facturas', { page, size, searchTerm, ...filters }],
    queryFn: async () => {
      const params = {
        page: Number(page),
        size: Number(size),
        ...(searchTerm && { busqueda: searchTerm }),
        ...(filters.estado && { estado: filters.estado }),
        ...(filters.idPuntoVenta && { idPuntoVenta: filters.idPuntoVenta }),
        ...(filters.tipoBusqueda && { tipoBusqueda: filters.tipoBusqueda }),
      };

      const response = await getAllFacturas(params);
      return {
        content: response.data.content,
        totalPages: response.data.totalPages,
        totalElements: response.data.totalElements
      };
    },
    keepPreviousData: true,
    staleTime: 1000 * 60 * 5, // 5 minutos
    retry: 2
  });
};

export default useFacturas;