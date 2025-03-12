import axios from 'axios';
import { getToken } from '../utils/authFunctions';

//deply
// const baseURL = "https://api.inpasep.com/api/v1";
const baseURL = "http://localhost:8082/api/v1";

const api = axios.create({
    baseURL: baseURL,
    responseType: 'json',
    withCredentials: true, 
    timeout: 60000,
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
//
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
export const deleteClient = (id) => api.delete(`/clientes/delete/${id}`);
export const createClient = (data) => api.post('/clientes/create', data);
export const getUserVendor = () => api.get('/users/vendedores');

export const fetchProductos = () => api.get('/productos-servicios');
export const fetchPuntosDeVenta = () => api.get('/puntos-venta');
export const fetchItems = () => api.get('/items');
export const getItemID = (id) => api.get(`/items/${id}`);
export const createItem = (data) => api.post('/items', data);
export const deleteItem = (id) => api.delete(`/items/${id}`);
export const updateItem = (id, data) => api.put(`/items/${id}`, data);
export const addCantidadItem = (id,data) => api.put(`/items/${id}/add/${data}`);
export const getProductoServicio = () => api.get('/productos-servicios');

export const deleteUser = (id) => api.delete(`/users/${id}`);
export const getRoles = () => api.get('/roles');
export const getUsers = () => api.get('/users');
export const updateUser = (id, data) => api.put(`/users/${id}`, data);
export const getUserById = (id) => api.get(`/users/${id}`);
//sucursales
export const getSucursales = () => api.get('/sucursales');
export const createSucursal = (data) => api.post('/sucursales',data);
export const deleteSucursal = (id) => api.delete(`/sucursales/${id}`);
export const getSucursalID = (id) => api.get(`/sucursales/${id}`);
export const editSucursal = (id, data) => api.put(`/sucursales/${id}`, data);

export const getAllFacturas = () => api.get('/ventas/hoy');
export const emitirFactura = (data) => api.post('/factura/emitir', data);
export const anularFactura = (data) => api.post('/factura/anular', data);
export const revertirAnulacionFactura = (data) => api.post('/factura/reversion-anulacion', data);
export const emitirSinFactura = (data) => api.post('/ventas', data);


// reservas
export const reservarProducto = (data) => api.post('/reservas/crear', data);
export const getReservas = () => api.get('/reservas/pendientes');
export const updateReserva = (id) => api.put(`/reservas/verificar/${id}`);

//Despachos
export const createDespacho = (data) => api.post('/despachos', data);
export const getDespachos = () => api.get('/despachos');

//otrps
export const createHoario = (data) => api.post('/horarios', data);
export const getHorario = () => api.get('/horarios');

//Estadisticas
export const getItemsLimited = () => api.get('/items/limited');
export const getClientLimited = () => api.get('/clientes/limited');
export const getStats = () => api.get('/stats');
//parametros
export const getTipoMoneda = () => api.get('/parametros/tipo-moneda');
export const unidadesMedida = () => api.get('/parametros/unidades-medida');
export const getUnidadMedida = () => api.get('/parametros/unidades-medida');
export const getDocumentoIdentidad = () => api.get('/parametros/documentos-identidad');

//Cufd 
export const getCufd = (idPuntoVenta) => api.post(`/codigos/obtener-cufd/${idPuntoVenta}`);
//STOCKS
export const addItemToSucursal = (sucursalId, itemId, cantidad) => api.post(`/sucursal-items/sucursal/${sucursalId}/item/${itemId}?cantidad=${cantidad}`);


//productos para los clientes por sucursal
export const getStockWithSucursal = () => api.get('/sucursal-items/items-with-sucursales');

export const sumarCantidadDeProducto = (sucursalId, itemId, cantidad) => api.put(`/sucursal-items/sucursal/${sucursalId}/item/${itemId}/increase?cantidad=${cantidad}`);
export const restarCantidadDeProducto = (sucursalId, itemId, cantidad) => api.put(`/sucursal-items/sucursal/${sucursalId}/item/${itemId}/decrease?cantidad=${cantidad}`);
export const getStockBySucursal = (sucursalId) => api.get(`/sucursal-items/sucursal/${sucursalId}`);
export const getInsumos = () => api.get('/insumos');
export const getInsumosAndSuccursales = () => api.get('/sucursal-insumos/insumo-with-sucursales');
export const createInsumo = (data) => api.post('/insumos', data);
export const editIns = (id, data) => api.put(`/insumos/${id}`, data);
export const getItemsPromocion = () => api.get('/promocion');
export const setItemsPromocion = (data) => api.post('/promocion', data);
export const deletePromocion = (id) => api.delete(`/promocion/${id}`);
export const sumarCantidadDeInsumo = (sucursalId, insumoId, cantidad) => api.put(`/sucursal-insumos/sucursal/${sucursalId}/insumo/${insumoId}/increase?cantidad=${cantidad}`);
export const restarCantidadDeInsumo = (sucursalId, insumoId, cantidad) => api.put(`/sucursal-insumos/sucursal/${sucursalId}/insumo/${insumoId}/decrease?cantidad=${cantidad}`);