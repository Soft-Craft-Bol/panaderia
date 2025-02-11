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

api.interceptors.request.use((config) => {
  if (config.data instanceof FormData) {
    config.headers['Content-Type'] = 'multipart/form-data';
  } else {
    config.headers['Content-Type'] = 'application/json';
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default api;

export const loginUser = (data) => api.post('/auth/log-in', data);
export const addUser = (data) => api.post('/auth/sign-up', data);
export const getAllClient = () => api.get('/clientes'); 
export const createClient = (data) => api.post('/clientes/create', data);
export const fetchProductos = () => api.get('/productos-servicios');
export const emitirFactura = (data) => api.post('/factura/emitir', data);
export const fetchPuntosDeVenta = () => api.get('/puntos-venta');
export const fetchItems = () => api.get('/items');
export const createItem = (data) => api.post('/items', data);
export const deleteItem = (id) => api.delete(`/items/${id}`);
export const getDocumentoIdentidad = () => api.get('/parametros/documentos-identidad');

export const deleteUser = (id) => api.delete(`/users/${id}`);
export const getRoles = () => api.get('/roles');
export const getUsers = () => api.get('/users');
export const updateUser = (id, data) => api.put(`/users/${id}`, data);
export const getUserById = (id) => api.get(`/users/${id}`);
export const getSucursales = () => api.get('/sucursales');

export const getAllFacturas = () => api.get('/factura');

