import { useEffect, useState } from "react";
import { getAllFacturas } from "../service/api";

const useFacturas = (page = 0, size = 10, searchTerm = "", filters = {}) => {
  const [facturas, setFacturas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  useEffect(() => {
    const fetchFacturas = async () => {
      try {
        setLoading(true);
        const response = await getAllFacturas(page, size, searchTerm, filters);
        setFacturas(response.data.content);
        setTotalPages(response.data.totalPages);
        setTotalElements(response.data.totalElements);
      } catch (err) {
        setError(err);
        toast.error("Error al cargar las facturas");
      } finally {
        setLoading(false);
      }
    };
    fetchFacturas();
  }, [page, size, searchTerm, filters]);

  return { 
    facturas, 
    loading, 
    error,
    totalPages,
    totalElements
  };
};

export default useFacturas;