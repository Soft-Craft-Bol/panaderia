import { useInfiniteQuery } from "@tanstack/react-query";
import { getInsumosGenericos } from "../service/api";

export const useInsumosGenericos = ({ nombre = '' }) => {
  return useInfiniteQuery({
    queryKey: ['insumosGenericos', nombre],
    queryFn: async ({ pageParam = 0 }) => {
      const response = await getInsumosGenericos({ 
        page: pageParam, 
        size: 10, 
        nombre 
      });
      return {
        data: response.data.content, 
        pageNumber: response.data.number,
        totalPages: response.data.totalPages, 
        isLast: response.data.last 
      };
    },
    getNextPageParam: (lastPage) => {
      if (lastPage.isLast) return undefined;
      return lastPage.pageNumber + 1;
    },
    initialPageParam: 0,
  });
};