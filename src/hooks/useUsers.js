import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { getUsers } from '../service/api';

export const useUsers = (
  initialPage = 0, 
  pageSize = 10, 
  sortField = 'id',
  filters = {}
) => {
  const queryKey = useMemo(
    () => ['users', { 
      page: initialPage, 
      size: pageSize, 
      sort: sortField,
      ...filters 
    }],
    [initialPage, pageSize, sortField, filters]
  );

  const { 
    data, 
    isLoading, 
    isError, 
    error,
    isFetching,
    isPreviousData,
    refetch
  } = useQuery({
    queryKey,
    queryFn: () => getUsers({ 
      page: initialPage, 
      size: pageSize, 
      sort: sortField,
      ...filters
    }),
    keepPreviousData: true,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  const users = data?.content || [];
  const pagination = {
    currentPage: data?.number ?? initialPage,
    totalPages: data?.totalPages ?? 1,
    totalElements: data?.totalElements ?? 0,
    pageSize: data?.size ?? pageSize,
    isFirst: data?.first ?? true,
    isLast: data?.last ?? true,
  };

  // Función para filtrar usuarios por roles
  const filterUsersByRoles = (users, roles) => {
    return users.filter(user => 
      user.roles?.some(role => roles.includes(role))
    ).map(user => ({
      ...user,
      fullName: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username
    }));
  };

  return {
    users,
    filteredUsers: (roles) => filterUsersByRoles(users, roles),
    pagination,
    isLoading,
    isError,
    error,
    isFetching,
    isPreviousData,
    refetch
  };
};