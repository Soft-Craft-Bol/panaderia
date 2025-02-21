import axios from 'axios';

const url = 'http://localhost:8082/api/v1/factura/enviar-paquete';
const body = {
    idPuntoVenta: 2,
    idCliente: 11,
    usuario: "Gaspar",
    cantidadFacturas: 500,
    codigoEvento: 9171039,
    detalle: [
        {
            idProducto: 15,
            cantidad: 2,
            montoDescuento: 0
        }
    ]
};

async function sendRequests() {
    for (let i = 0; i < 500; i++) {
        try {
            const response = await axios.post(url, body);
            console.log(`Solicitud ${i + 1}:`, {
                status: response.status,
                data: response.data,
            });
        } catch (error) {
            console.error(`Error en solicitud ${i + 1}:`, {
                message: error.message,
                response: error.response ? {
                    status: error.response.status,
                    data: error.response.data,
                } : undefined,
            });
        }
    }
}

sendRequests();