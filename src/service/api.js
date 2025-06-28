import axios from 'axios';
import { getToken } from '../utils/authFunctions';
//deply
//const baseURL = "https://api.inpasep.com/api/v1";
const baseURL = "http://localhost:8080/api/v1";

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
export const createItemsBulk = (id) => api.get(`/items/${id}`);

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

export const getAllFacturas = (params = {}) => {
  // Aseguramos que page y size sean números y tengan valores por defecto
  const processedParams = {
    page: Number(params.page || 0),
    size: Number(params.size || 10),
    ...params
  };
  
  return api.get('/ventas/hoy', { params: processedParams });
};
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
export const getVentasPorDia = () => api.get('/ventas/totales-por-dia');
//parametros
export const getTipoMoneda = () => api.get('/parametros/tipo-moneda');
export const unidadesMedida = () => api.get('/parametros/unidades-medida');
export const getUnidadMedida = () => api.get('/parametros/unidades-medida');
export const getDocumentoIdentidad = () => api.get('/parametros/documentos-identidad');

//Cufd 
export const getCufd = (idPuntoVenta) => api.post(`/codigos/obtener-cufd/${idPuntoVenta}`);

//getFacturaDetail
export const getFacturaDetail = (cuf) => api.get(`/factura/cuf/${cuf}`);
//STOCKS
export const addItemToSucursal = (sucursalId, itemId, cantidad) => api.post(`/sucursal-items/sucursal/${sucursalId}/item/${itemId}?cantidad=${cantidad}`);
export const topvendidos = () => api.get(`/ventas/mas-vendidos`);
export const topClientes = () => api.get(`/ventas/clientes-frecuentes`);
export const buscarCliente = (searchTerm) => api.get(`/clientes/buscar?documento=${searchTerm}`);

//productos para los clientes por sucursal
export const getStockWithSucursal = (page = 0, size = 10, search = '') => api.get(`/sucursal-items/items-with-sucursales?page=${page}&size=${size}&search=${search}`);


export const sumarCantidadDeProducto = (sucursalId, itemId, cantidad) => api.put(`/sucursal-items/sucursal/${sucursalId}/item/${itemId}/increase?cantidad=${cantidad}`);
export const restarCantidadDeProducto = (sucursalId, itemId, cantidad) => api.put(`/sucursal-items/sucursal/${sucursalId}/item/${itemId}/decrease?cantidad=${cantidad}`);
export const getStockBySucursal = (sucursalId) => api.get(`/sucursal-items/sucursal/${sucursalId}`);

//Insumos

export const getActivos = () => api.get('/insumos');
export const desactivarInsumo = (id) => api.put(`/insumos/desactivar/${id}`);
export const getInactivos = () => api.get('/insumos/inactivos');
export const activarInsumo = (id) => api.put(`/insumos/activar/${id}`);
export const updateInsumo = (id, data) => api.put(`/insumos/${id}`, data);
export const insumoPorSucursal = (id) => api.get(`/insumos/sucursal/${id}`);
export const eliminarInsumo = (id) => api.delete(`/insumos/${id}`);
export const getInsumosAndSuccursales = () => api.get('/sucursal-insumos/insumo-with-sucursales');
export const getSucursalWithInsumos = () => api.get('/sucursal-insumos');
export const createSucursalInsumo = (data, idSucursal, idInsumo) => api.post(`/sucursal-insumos/sucursal/${idSucursal}/insumo/${idInsumo}`, data);
export const createInsumo = (data) => api.post('/insumos', data);
export const editIns = (id, data) => api.put(`/insumos/${id}`, data);


//Recetas 
export const getRecetas = () => api.get('/recetas');
export const createReceta = (data) => api.post('/recetas', data);
export const deleteReceta = (id) => api.delete(`/recetas/${id}`);
export const getRecetaID = (id) => api.get(`/recetas/${id}`);

//Produccion 
export const getProduccion = () => api.get('/produccion');
export const createProduccion = (data) => api.post('/produccion', data);


//Promociones
export const getItemsPromocion = () => api.get('/promocion');
export const setItemsPromocion = (data) => api.post('/promocion', data);
export const deletePromocion = (id) => api.delete(`/promocion/${id}`);
// Cambia la función deletePromocion para aceptar ambos IDs
export const quitarPromocion = (itemId, sucursalId) => 
  api.delete(`/promocion/by-item-sucursal?itemId=${itemId}&sucursalId=${sucursalId}`);
export const sumarCantidadDeInsumo = (sucursalId, insumoId, cantidad) => api.put(`/sucursal-insumos/sucursal/${sucursalId}/insumo/${insumoId}/increase?cantidad=${cantidad}`);
export const restarCantidadDeInsumo = (sucursalId, insumoId, cantidad) => api.put(`/sucursal-insumos/sucursal/${sucursalId}/insumo/${insumoId}/decrease?cantidad=${cantidad}`);

//eventos y contingencias
export const getEventos = () => api.get('/eventos');
export const getCufdAnterior = (idPuntoVenta) => api.get(`/codigos/obtener-cufds-anteriores/${idPuntoVenta}`);
export const definirEvento = (data) => api.post('/eventos-significativos', data);
export const getEventosSignificativosById = (puntoVenta) => api.get(`/eventos-significativos/vigentes/${puntoVenta}`);
export const registrarEvento = (data) => api.post('/factura/enviar-paquete', data);
export const validarPaquete = (data) => api.post('/factura/validar', data);
export const emitirContingencia = (data) => api.post('/factura/contigencia', data);

//EMAIL
export const sendEmail = (data) => api.post('/email/enviar-factura', data);

//Sales Chart
export const getSalesChart = () => api.get('/sales-chart');

export const crearInsumo = (data) => api.post('/insumos/crear', data);
export const asignarInsumoSucursal = (data, idInsumo) => api.post(`/sucursal-insumos/${idInsumo}`, data);
export const comprarInsumo = (data) => api.post('/compras-insumos', data);
export const getInsumosById = (id) => api.get(`/insumos/${id}`);
//http://localhost:8080/api/v1/sucursal-insumos/11/sucursal/1/stock?cantidad=-10
export const ActualizarStockInsumo = (idSucursal, idInsumo) => api.patch(`/sucursal-insumos/${idInsumo}/sucursal/${idSucursal}/stock`);
export const getInsumos = () => api.get('/insumos');
export const getInsumosBySucursal = (idSucursal) => api.get(`/insumos/sucursal/${idSucursal}`);


//proveedores
export const getProveedores = () => api.get('/proveedores');
export const createProveedor = (data) => api.post('/proveedores/registrar', data);

//cierre de Cajas
export const getCierreCaja = () => api.get('/cierre-caja');
export const createCierreCaja = (data) => api.post('/cierre-caja', data);
