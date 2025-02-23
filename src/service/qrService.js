// src/service/qrService.js
import axios from "axios";

const QR_API_URL = "https://qrsimpleapiv2.azurewebsites.net/api/v1/main/getQRWithImageAsync";

export const generarQR = async (currency, gloss, amount, expirationDate, singleUse) => {
  try {
    const response = await axios.post(
      QR_API_URL,
      {
        currency,
        gloss,
        amount,
        expirationDate,
        singleUse,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (response.data.success) {
      return response.data; 
    } else {
      throw new Error(response.data.message || "Error al generar el QR");
    }
  } catch (error) {
    console.error("Error en la solicitud:", error);
    throw error;
  }
};