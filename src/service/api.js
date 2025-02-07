import axios from 'axios';
import { getToken } from '../utils/authFunctions';

const baseURL = "http://localhost:8082/api/v1";

const api = axios.create({
    baseURL: baseURL,
    responseType: 'json',
    withCredentials: true, 
    timeout: 10000,
  });

/* api.interceptors.request.use((config) => {
  const token = getToken()
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
}); */

export default api;

export const loginUser = (data) => api.post('/auth/log-in', data);
export const getAllClient = () => api.get('/clientes'); 
export const createClient = (data) => api.post('/clientes/create', data);
export const fetchProductos = () => api.get('/productos-servicios');
export const emitirFactura = (data) => api.post('/factura/emitir', data);