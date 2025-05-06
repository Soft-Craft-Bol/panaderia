import { useQuery } from "@tanstack/react-query";
import { getAllFacturas } from "../service/api";

const useFacturas = (page = 0, size = 10, searchTerm = "", filters = {}) => {
  return useQuery({
    queryKey: ['facturas', page, size, searchTerm, filters],
    queryFn: async () => {
      const response = await getAllFacturas(page, size, searchTerm, filters);
      return {
        content: response.data.content,  // Asegúrate que coincide con tu estructura
        totalPages: response.data.totalPages,
        totalElements: response.data.totalElements
      };
    },
    keepPreviousData: true
  });
};

export default useFacturas;