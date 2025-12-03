import axios from 'axios';
import qs from 'qs';
//deply
//const baseURL = "https://api.inpasep.com/api/v1";
const baseURL = "http://localhost:8080/api/v1";

const api = axios.create({
    baseURL: baseURL,
    responseType: 'json',
    withCredentials: true, 
    timeout: 60000,
     paramsSerializer: params => qs.stringify(params, { arrayFormat: 'repeat' }) 
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

export const createAjuste = (data) => api.post('/ajustes/masivo', data);
export const createAjusteInsumos = (data) => api.post('/ajustes-insumo/masivo', data);
export const getAjustes = (params) => api.get('/ajustes', { params });
export const getAjustesInsumo = (params) => api.get('/ajustes-insumo', { params });

export const loginUser = (data) => api.post('/auth/log-in', data);
export const addUser = (data) => api.post('/auth/sign-up', data);
export const getAllClient = () => api.get('/clientes'); 
export const deleteClient = (id) => api.delete(`/clientes/delete/${id}`);
export const createClient = (data) => api.post('/clientes/create', data);
export const getUserVendor = () => api.get('/users/vendedores');

export const fetchProductos = () => api.get('/productos-servicios');
export const fetchPuntosDeVenta = () => api.get('/puntos-venta');
export const fetchPuntoDeVentaPorIdSucursal = (sucursalId) => 
  api.get(`/puntos-venta/${sucursalId}/puntos-venta`);
;
export const fetchItems = () => api.get('/items');
export const getItemID = (id) => api.get(`/items/${id}`);
export const getItemsWithRecetas = (params = {}) => {
  return api.get('/sucursal-items/con-recetas', {
    params: {
      page: params.page || 0,
      size: params.size || 10,
      search: params.search || '',
      tieneReceta: params.hasRecipes
    }
  });
};
export const createItem = (data) => api.post('/items', data);
export const deleteItem = (id) => api.delete(`/items/${id}`);
export const updateItem = (id, data) => api.put(`/items/${id}`, data);
export const addCantidadItem = (id,data) => api.put(`/items/${id}/add/${data}`);
export const getProductoServicio = () => api.get('/productos-servicios');
export const createItemsBulk = (id) => api.get(`/items/${id}`);

export const deleteUser = (id) => api.delete(`/users/${id}`);
export const getRoles = () => api.get('/roles');
export const createRole = (data) => api.post('/roles', data);
export const getRoleById = (id) => api.get(`/roles/${id}`);
export const createPermission = (name) => api.post('/roles/permissions', { name });
export const getPermissions = () => api.get('/roles/permissions');
export const updateRoleStatus = (roleId, active) => api.patch(`/roles/${roleId}/status?active=${active}`);
export const updateRolePermissions = (roleId, permissions) => api.put(`/roles/${roleId}/permissions`, { permissionNames: permissions });

export const getUsers = ({ page = 0, size = 10, sort = 'id' }) => {
  return api.get('/users', {
    params: {
      page,
      size,
      sort
    }
  }).then(response => response.data);
};
export const updateUser = (id, data) => api.put(`/users/${id}`, data);
export const getUserById = (id) => api.get(`/users/${id}`);

//Sincornizacio y generacion de codigos
export const obtenerCuis = (idPuntoVenta) => api.post(`/codigos/obtener-cuis/${idPuntoVenta}`);
export const obtenerCufd = (idPuntoVenta) => api.post(`/codigos/obtener-cufd/${idPuntoVenta}`);
//Sincronizacion
export const sincronizarParametros = (idPuntoVenta) => api.post(`/sincronizar/parametros/${idPuntoVenta}`);
export const sincronizarCatalogos = (idPuntoVenta) => api.post(`/sincronizar/catalogos/${idPuntoVenta}`);
export const sincronizarMensajeServicio = (idPuntoVenta) => api.post(`/sincronizar/mensajes-servicios/${idPuntoVenta}`);
export const sincronizarFechaHora = (idPuntoVenta) => api.post(`/sincronizar/fecha-hora/${idPuntoVenta}`);

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
export const getVentasConFactura = (
  fechaDesde = null,
  fechaHasta = null,
  estadoFactura = null,
  metodoPago = null,
  codigoCliente = null,
  codigoProducto = null,
  montoMin = null,
  montoMax = null,
  page = 0,
  size = 10
) => {
  const params = new URLSearchParams();
  
  if (fechaDesde) params.append('fechaDesde', fechaDesde);
  if (fechaHasta) params.append('fechaHasta', fechaHasta);
  if (estadoFactura) params.append('estadoFactura', estadoFactura);
  if (metodoPago) params.append('metodoPago', metodoPago);
  if (codigoCliente) params.append('codigoCliente', codigoCliente);
  if (codigoProducto) params.append('codigoProducto', codigoProducto);
  if (montoMin) params.append('montoMin', montoMin);
  if (montoMax) params.append('montoMax', montoMax);
  
  params.append('page', page);
  params.append('size', size);
  
  return api.get('/ventas/con-factura', { params });
};
export const getVentasSinFactura = (
  fechaDesde = null,
  fechaHasta = null,
  metodoPago = null,
  codigoCliente = null,
  codigoProducto = null,
  montoMin = null,
  montoMax = null,
  page = 0,
  size = 10
) => {
  const params = {
    page,
    size
  };

  if (fechaDesde) params.fechaDesde = fechaDesde;
  if (fechaHasta) params.fechaHasta = fechaHasta;
  if (metodoPago) params.metodoPago = metodoPago;
  if (codigoCliente) params.codigoCliente = codigoCliente;
  if (codigoProducto) params.codigoProducto = codigoProducto;
  if (montoMin != null) params.montoMin = montoMin;
  if (montoMax != null) params.montoMax = montoMax;

  return api.get('/ventas/sin-factura', { params });
};

export const emitirFactura = (data) => api.post('/factura/emitir', data);
export const anularFactura = (data) => api.post('/factura/anular', data);
export const revertirAnulacionFactura = (data) => api.post('/factura/reversion-anulacion', data);
export const emitirSinFactura = (data) => api.post('/ventas', data);
export const anularVentas = (id, data) => api.post(`/ventas/${id}/anular`, data);
export const VentasCredito = (data) => api.post('/pago-posterior/venta', data);
export const listarVentasCreditoPendientes = (page = 0, size = 10) => api.get(`/pago-posterior/pendientes?page=${page}&size=${size}`);
export const abonarVentaCredito = (ventaId, data) => api.post(`/pago-posterior/${ventaId}/abonar`, data);


// reservas
export const reservarProducto = (data) => api.post('/reservas', data);
export const getReservasByFilters = async ({ estado, desde, hasta }) => {
  const params = new URLSearchParams();

  if (estado) params.append("estado", estado);
  if (desde) params.append("desde", desde);
  if (hasta) params.append("hasta", hasta);

  return api.get(`/reservas?${params.toString()}`);
};

export const getReservas = () => api.get('/reservas/pendientes');
export const updateReserva = (id, estado, motivo = "") =>
  api.put(`/reservas/${id}/estado?estado=${estado}${motivo ? `&motivo=${motivo}` : ""}`);

//Despachos
export const createDespacho = (data) => api.post('/despachos', data);
export const anularDespacho = (id) => api.put(`/despachos/anular/${id}`);
export const getDespachos = (filters = {}) => {
    const params = new URLSearchParams();
    params.append('page', filters.page || 0);
    params.append('size', filters.size || 10);
    
    if (filters.fechaInicio) params.append('fechaInicio', filters.fechaInicio);
    if (filters.fechaFin) params.append('fechaFin', filters.fechaFin);
    if (filters.transporte) params.append('transporte', filters.transporte);
    if (filters.numeroContacto) params.append('numeroContacto', filters.numeroContacto);
    if (filters.sucursalOrigen) params.append('sucursalOrigen', filters.sucursalOrigen);
    if (filters.sucursalDestino) params.append('sucursalDestino', filters.sucursalDestino);
    if (filters.itemId) params.append('itemId', filters.itemId);
    
    return api.get(`/despachos?${params.toString()}`);
};
export const createDespachoInsumo = (data) => api.post('/despachos-insumos', data);
export const getDespachoInsumo = () => api.get(`/despachos-insumos`);
export const getDespachoInsumoById = (id) => api.get(`/despachos-insumos/${id}`);
export const deleteDespachoInsumo = (id) => api.delete(`/despachos-insumos/${id}`);
export const recibirDespachoInsumo = (id) => api.post(`/despachos-insumos/${id}/recibir`);

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
export const getMotivoAnulacion = () => api.get('/parametros/motivo-anulacion');
export const getTipoEmision = () => api.get('/parametros/tipo-emision');
export const VerificarComunicacion = () => api.get('/parametros/verificar-comunicacion');

//Cufd 
export const getCufd = (idPuntoVenta) => api.post(`/codigos/obtener-cufd/${idPuntoVenta}`);

//getFacturaDetail
export const getFacturaDetail = (cuf) => api.get(`/factura/cuf/${cuf}`);
//STOCKS
export const addItemToSucursal = (sucursalId, itemId, cantidad) => api.post(`/sucursal-items/sucursal/${sucursalId}/item/${itemId}?cantidad=${cantidad}`);
export const topvendidos = () => api.get(`/ventas/mas-vendidos`);
export const topClientes = () => api.get(`/ventas/clientes-frecuentes`);
export const buscarCliente = (searchTerm) => api.get(`/clientes/sugerencias/documento?q=${searchTerm}`);
export const buscarClientePorNombre = (nombre) => api.get(`/clientes/sugerencias/nombre?q=${nombre}`);

export const getStockWithSucursal = (
  page = 0, 
  size = 10, 
  search = '',
  codigo = null,
  conDescuento = null,
  sucursalId = null,
  categoriaId = null,
  sortBy = 'descripcion',
  sortDirection = 'asc'
) => {
  const params = {
    page,
    size,
    search,
    codigo,
    conDescuento,
    sucursalId,
    categoriaId,
    sortBy,
    sortDirection
  };

  Object.keys(params).forEach(key => params[key] === null && delete params[key]);

  return api.get(`/sucursal-items/items-with-sucursales`, { params });
};
export const getProductosByPuntoVenta = (
    puntoVentaId, 
    page = 0, 
    size = 10, 
    search = '', 
    codigoProductoSin = null,
    conDescuento = null,
    categoriaIds = [], 
    sinStock = false,
    sort = 'cantidadDisponible,desc'
) => api.get(`/sucursal-items/by-punto-venta/${puntoVentaId}`, {
    params: {
        page,
        size,
        search,
        codigoProductoSin,
        conDescuento,
        categoriaIds,
        sinStock,
        sort
    }
});
export const sumarCantidadDeProducto = (sucursalId, itemId, cantidad) => api.put(`/sucursal-items/sucursal/${sucursalId}/item/${itemId}/increase?cantidad=${cantidad}`);
export const restarCantidadDeProducto = (sucursalId, itemId, cantidad) => api.put(`/sucursal-items/sucursal/${sucursalId}/item/${itemId}/decrease?cantidad=${cantidad}`);
export const getStockBySucursal = (sucursalId) => api.get(`/sucursal-items/sucursal/${sucursalId}`);

//categorias
export const getCategorias = () => api.get('/categorias');
export const createCategoria = (data) => api.post('/categorias', data);
export const updateCategoria = (id, data) => api.put(`/categorias/${id}`, data);
//http://localhost:8080/api/v1/items/103/categoria?categoriaId=102
export const asignarCategoriaAItem = (itemId, categoriaId) => api.put(`/items/${itemId}/categoria?categoriaId=${categoriaId}`);

//Insumos

// -----------

export const getInsumosById = (id) => api.get(`/insumos/${id}`);
export const eliminarInsumo = (id) => api.delete(`/insumos/${id}`);
export const updateInsumo = (id, data) => api.put(`/insumos/${id}`, data);
export const crearInsumo = (data) => api.post('/insumos/crear', data);
export const cambiarEstadoInsumo = (id, activo) => api.patch(`/insumos/${id}/estado?activo=${activo}`);
export const getInsumos = ({ page = 0, size = 10, nombre = '', tipo = '' }) => api.get('/insumos', {params: { page, size, nombre, tipo } });
export const getInsumosBySucursal = (
  idSucursal,
  soloActivos,
  { page, size, nombre, tipo, unidades }
) => {
  return api.get(`/insumos/sucursal/${idSucursal}`, {
    params: {
      soloActivos,  
      page,
      size,
      nombre,       
      tipo,         
      unidades,     
    },
  }).then(res => res.data);
};

export const getInsumosBySucursalExcludingMateriaPrima = (idSucursal, soloActivos, { page, size, search }) => {
  return api.get(`/insumos/sucursal/${idSucursal}/otros`, {
    params: {
      activos: soloActivos,
      page,
      size,
      search
    }
  }).then(res => res.data);
};
export const getInsumosActivosBySucursal = (idSucursal) => api.get(`/insumos/activos/${idSucursal}`);
export const asignarInsumoSucursal = (data, idInsumo) => api.post(`/sucursal-insumos/${idInsumo}`, data);
export const updateStockMinimo = (idInsumo, idSucursal, stockMinimo) => {
  return api.patch(`/sucursal-insumos/${idInsumo}/sucursal/${idSucursal}/stock-minimo?stockMinimo=${stockMinimo}`);
};
export const asignarInsumosaSucursalMasivo = (data) => api.post('/sucursal-insumos/masivo', data);
//Insumos genericos
export const createInsumoGenerico = (data) => api.post('/insumos-genericos', data);
export const getInsumosGenericos = ({ page = 0, size = 10, nombre = '' }) => api.get('/insumos-genericos', { params: { page, size, nombre } });
export const asignarInsumosGenericos = (idInsumoGenerico, data) => api.post(`/insumos-genericos/${idInsumoGenerico}/asignar-insumos`, data);
export const updateAsignacionInsumoGenerico = (genericoId, data) => 
  api.put(`/insumos-genericos/${genericoId}/actualizar-asignaciones`, data);
export const deleteInsumoGenerico = (id) => api.delete(`/insumos-genericos/${id}`);
export const getInsumoGenericoById = (id) => api.get(`/insumos-genericos/${id}`);
export const updateInsumoGenerico = (id, data) => api.put(`/insumos-genericos/${id}`, data);

export const removerInsumoAsignado = (genericoId, insumoId) => 
  api.delete(`/insumos-genericos/${genericoId}/remover-insumo/${insumoId}`);


//Compras
export const comprarInsumo = (data) => api.post('/compras-insumos', data);
export const getComprasInsumos = (params) => api.get('/compras-insumos', { params });
export const getCompraInsumoById = (id) => api.get(`/compras-insumos/${id}`);
export const deleteCompraInsumo = (id) => api.delete(`/compras-insumos/${id}`);
export const updateCompraInsumo = (id, data) => api.put(`/compras-insumos/${id}`, data);



//Recetas 
export const getRecetasByPage = ({ page = 0, size = 10, nombre = '', productoId = null }) => api.get('/recetas/list', {
    params: { 

        page,
        size,
        nombre,
        ...(productoId && { productoId })
    }
});
export const getRecetas = () => api.get('/recetas');
export const createReceta = (data) => api.post('/recetas', data);
export const deleteReceta = (id) => api.delete(`/recetas/${id}`);
export const updateReceta = (id, data) => api.put(`/recetas/${id}`, data);
export const getRecetasByItem = (itemId) => api.get(`/recetas/producto/${itemId}`);
export const getRecetaID = (id) => api.get(`/recetas/${id}/detalle`);

//Produccion 
export const getProduccion = () => api.get('/produccion');

export const getProduccionByFilters = (params) => api.get('/produccion', { params });
export const createProduccion = (data) => api.post('/produccion', data);
export const getProduccionById = (id) => api.get(`/produccion/${id}`);
export const deleteProduccion = (id) => api.delete(`/produccion/${id}`);
export const updateProduccion = (id, data) => api.put(`/produccion/${id}`, data);


//Promociones
export const getItemsPromocion = () => api.get('/promocion');
export const setItemsPromocion = (data) => api.post('/promocion', data);
export const deletePromocion = (id) => api.delete(`/promocion/${id}`);
// Cambia la función deletePromocion para aceptar ambos IDs
export const quitarPromocion = (itemId, sucursalId) => 
  api.delete(`/promocion/by-item-sucursal?itemId=${itemId}&sucursalId=${sucursalId}`);

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


//proveedores
export const getProveedores = () => api.get('/proveedores');
export const createProveedor = (data) => api.post('/proveedores/registrar', data);
export const updateProveedor = (id, data) => api.put(`/proveedores/${id}`, data);
export const deleteProveedor = (id) => api.delete(`/proveedores/${id}`);
export const getProveedorById = (id) => api.get(`/proveedores/${id}`);

//cierre de Cajas
export const getCierreCaja = () => api.get('/cierre-caja');
export const createCierreCaja = (data) => api.post('/cierre-caja', data);
export const getCajas = () => api.get('/cajas');
export const getHistorialCajas = (userId, desde, hasta, page = 0, size = 10) => {
  const params = { page, size, sort: 'fechaApertura,desc' };
  if (desde) params.desde = desde;
  if (hasta) params.hasta = hasta;

  return api.get(`/cajas/historial/${userId}`, { params });
};
export const abrirCaja = ({ sucursalId, puntoVentaId, usuarioId, turno, montoInicial }) => {
  return api.post(`/cajas/abrir`, null, {
    params: {
      sucursalId,
      puntoVentaId,
      usuarioId,
      turno,
      montoInicial,
    },
  });
};
export const verificarCajas = (userId) => api.get(`/cajas/abierta/${userId}`);
export const cerrarCaja = (data) => api.post('/cajas/cerrar', data);
export const getStockInicial = (idCaja) => api.get(`/cajas/stock-inicial/${idCaja}`);
export const getCajaById = (id) => api.get(`/cajas/resumen/${id}`);
export const getResumenPagos = (idCaja) => api.get(`/ventas/resumen-pagos?cajaId=${idCaja}`);
export const getResumenPagosCredito = (idCaja) => api.get(`/cajas/${idCaja}/resumen-pagos`);
export const getResumenProductos = (idCaja) => api.get(`/ventas/caja/${idCaja}/resumen`);
export const getEgresosByCaja = (idCaja) => api.get(`/egresos/caja/${idCaja}`);

//Mermas
export const registerMerma = (data) => api.post('/mermas', data);
export const getMermas = (params) => api.get('/mermas', { params });

//contactos 
export const getContactosByFilters = (params) => {
  const queryParams = new URLSearchParams();
  
  if (params.page !== undefined) queryParams.append('page', params.page);
  if (params.size !== undefined) queryParams.append('size', params.size);
  if (params.asunto) queryParams.append('asunto', params.asunto);
  if (params.atendido) queryParams.append('atendido', params.atendido);

  return api.get(`/contactos?${queryParams.toString()}`);
};
export const updateContactoEstado = (id, estado) => {
  return api.patch(`/contactos/${id}/estado?estado=${estado}`);
};
export const createContacto = (data) => api.post('/contactos', data);
export const deleteContacto = (id) => api.delete(`/contactos/${id}`);
export const getContactoById = (id) => api.get(`/contactos/${id}`);

export const getArchivos = () => api.get(`/archivos-facturas`);

//Egresos 
export const getEgresos = () => api.get("/egresos");
export const createEgreso = (data) => api.post("/egresos", data);
export const updateEgreso = (id, data) => api.put(`/egresos/${id}`, data);
export const deleteEgreso = (id) => api.delete(`/egresos/${id}`);