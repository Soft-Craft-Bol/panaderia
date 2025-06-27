import { useState } from "react";
import { emitirSinFactura } from "../service/api";

export const useVentas = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [ventaRealizada, setVentaRealizada] = useState(null);

    const realizarVenta = async (ventaData) => {
        setIsLoading(true);
        setError(null);
        
        try {
            const response = await emitirSinFactura(ventaData);
            
            if (response.status === 201) {
                setVentaRealizada(response.data);
                return { success: true, data: response.data };
            } else {
                throw new Error(`La venta no pudo ser procesada. Código: ${response.status}`);
            }
        } catch (error) {
            setError(error);
            return { success: false, error };
        } finally {
            setIsLoading(false);
        }
    };

    return {
        realizarVenta,
        isLoading,
        error,
        ventaRealizada,
        reset: () => {
            setError(null);
            setVentaRealizada(null);
        }
    };
};