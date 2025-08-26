import { useQuery } from '@tanstack/react-query';
import { getComprasInsumos } from '../service/api';

export const useComprasInsumos = ({
  sucursalId,
  proveedorId,
  fechaInicio,
  fechaFin,
  tipoInsumo,
  page = 0,
  size = 10,
  sort = 'fecha,desc'
}) => {
  const queryKey = [
    'comprasInsumos', 
    sucursalId, 
    proveedorId, 
    fechaInicio, 
    fechaFin, 
    tipoInsumo,
    page,
    size,
    sort
  ];

  const queryFn = async () => {
    const params = new URLSearchParams();
    
    if (sucursalId) params.append('sucursalId', sucursalId);
    if (proveedorId) params.append('proveedorId', proveedorId);
    if (fechaInicio) params.append('fechaInicio', fechaInicio);
    if (fechaFin) params.append('fechaFin', fechaFin);
    if (tipoInsumo) params.append('tipoInsumo', tipoInsumo);
    
    params.append('page', page);
    params.append('size', size);
    params.append('sort', sort);

    const response = await getComprasInsumos(params);
    return response.data;
  };

  return useQuery({
    queryKey,
    queryFn,
    keepPreviousData: true,
    staleTime: 1000 * 60 * 5 // 5 minutos
  });
};