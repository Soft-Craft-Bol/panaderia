// hooks/usePagination.js
import { useState } from 'react';

export const usePagination = (initialState = { page: 0, size: 10, sort: 'id,asc' }) => {
  const [pagination, setPagination] = useState(initialState);

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const handleRowsPerPageChange = (newSize) => {
    setPagination(prev => ({ ...prev, size: newSize, page: 0 }));
  };

  const handleSortChange = (newSort) => {
    setPagination(prev => ({ ...prev, sort: newSort, page: 0 }));
  };

  return {
    pagination,
    handlePageChange,
    handleRowsPerPageChange,
    handleSortChange,
    setPagination
  };
};