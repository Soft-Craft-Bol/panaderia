import { useEffect, useState } from "react";
import { getAllFacturas } from "../service/api";

const useFacturas = () => {
  const [facturas, setFacturas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFacturas = async () => {
      try {
        const response = await getAllFacturas();
        setFacturas(response.data.content);
      } catch (err) {
        setError(err);
        toast.error("Error al cargar las facturas");
      } finally {
        setLoading(false);
      }
    };
    fetchFacturas();
  }, []);

  return { facturas, setFacturas, loading, error };
};

export default useFacturas;