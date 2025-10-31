import { Routes, Route } from "react-router-dom";
import PrivateRoute from "../context/PrivateRoute";
import LoginUser from "../pages/login/LoginUser";
import { lazy } from "react";

const Inicio = lazy(() => import("../pages/inicio/Inicio"));
const Configuraciones = lazy(() => import("../pages/configuraciones/Configuraciones"));
const RegisterUser = lazy(() => import("../pages/users/RegisterUser"));
const UserManagement = lazy(() => import("../pages/users/ListUser"));
const Horarios = lazy(() => import("../pages/horarios/Horarios"));
const Sucursales = lazy(() => import("../pages/Sucursales/Sucursales"));
const AddSucursal = lazy(() => import("../pages/Sucursales/AddSucursal"))
const DespachoMain = lazy(() => import("../pages/despachos/DespachoMain"))
const CrearDespacho = lazy(() => import("../components/forms/despachoForm/DespachoForm"))
const CrearDespachoInsumo = lazy(() => import("../components/forms/despachoForm/DespachoInsumoForm"));
const ItemForm = lazy(() => import("../components/forms/itemForm/ItemForm"));
const Productos = lazy(() => import("../pages/productos/Productos"));
const CarrritoLista = lazy(() => import("../pages/pedidos/CarritoLista"));
const ReservaMain = lazy(() => import("../pages/pedidos/ReservaMain"));
const VentasMain = lazy(() => import("../pages/facturacion/VentasMain"));
const Gastos = lazy(() => import("../pages/gastos/Gastos"));
const ClientForm = lazy(() => import("../components/forms/clientForm/ClientForm"));
const Clientes = lazy(() => import("../pages/clientes/Clientes"));
const LandingPage = lazy(() => import("../pages/landingPage/LandingPage"));
const BreadList = lazy(() => import("../pages/landingPage/BreadList"));
const CrearReceta = lazy(() => import("../pages/recetas/CrearReceta"));
const ProductosVentas = lazy(() => import("../pages/productos/ProdcutoVentas"));
const EventManager = lazy(() => import("../pages/event/EventoManager"))
const ItemMassImport = lazy(() => import("../components/forms/itemForm/ItemMassImport"))
const FormFacturacion = lazy(() => import("../components/facturaForm/FormFacturacion"))
const FormFacturacionMasiva = lazy(() => import("../components/facturaForm/FormFacturacionMasiva"));
const RegisterClient = lazy(() => import("../components/forms/clientForm/RegisterClient"));
const SectionContact = lazy(() => import("../pages/landingPage/SectionContact"));
const SectionNosotros = lazy(() => import("../pages/landingPage/SectionNosotros"));
const CajaDashboard = lazy(() => import("../pages/cajas/CajaDashboard"));
const InsumosPanel = lazy(() => import("../pages/insumos/InsumosPanel"));
const DashboardMovimientos = lazy(() => import("../pages/mermas/DashboardMovimientos"));
const UserProfile = lazy(() => import("../pages/users/UserProfile"));
const RecetasMain = lazy(() => import("../pages/recetas/RecetasMain"));
const AjustesInventario = lazy(() => import("../pages/ajustes/AjustesInventario"));
const AjustesInventarioInsumos = lazy(() => import("../pages/ajustes/AjustesInventarioInsumos"));
const EgresosPanel = lazy(() => import("../pages/egresos/EgresosPanel"));

const AppRoutes = () => (

  <Routes>
    {/* Rutas públicas */}
    <Route path="/login" element={<LoginUser />} />
    <Route path="/" element={<LandingPage />} />
    
    {/* Rutas privadas */}
    <Route path="/home" element={<PrivateRoute><Inicio /></PrivateRoute>} />
    <Route path="/configuraciones" element={<PrivateRoute requiredPermissions={["ADMIN"]}><Configuraciones /></PrivateRoute>} />
    <Route path="/ajuste" element={<PrivateRoute><AjustesInventario /></PrivateRoute>} />
    {/*Principal Sidebar*/}
    <Route path="/users" element={<PrivateRoute><UserManagement /></PrivateRoute>} />
    <Route path="/registerUser" element={<PrivateRoute><RegisterUser /> </PrivateRoute>} />
    <Route path="/register" element={<RegisterUser />} />
    <Route path="/editUser/:id" element={<PrivateRoute><RegisterUser /></PrivateRoute>} />
    <Route path="/horario" element={<PrivateRoute><Horarios /></PrivateRoute>} />

    <Route path="/sucursales" element={<PrivateRoute><Sucursales /></PrivateRoute>} />
    <Route path="/sucursales/addSucursal" element={<PrivateRoute> <AddSucursal> </AddSucursal></PrivateRoute>} />
    <Route path="/editSucursal/:id" element={<PrivateRoute> <AddSucursal /> </PrivateRoute>} />
    <Route path="/despachos" element={<PrivateRoute> <DespachoMain /> </PrivateRoute>} />
    <Route path="/despachos/create" element={<PrivateRoute> <CrearDespacho /> </PrivateRoute>} />
    <Route path="/despachos/create-insumo" element={<PrivateRoute> <CrearDespachoInsumo /> </PrivateRoute>} />
    <Route path="/productos" element={<PrivateRoute> <Productos /> </PrivateRoute>} />
    <Route path="/addProduct" element={<PrivateRoute> <ItemForm /> </PrivateRoute>} />
    <Route path="/editProduct/:id" element={<PrivateRoute>  <ItemForm /> </PrivateRoute>} />
    <Route path="/reservas" element={<PrivateRoute> <ReservaMain /></PrivateRoute>} />
    <Route path="/punto-ventas" element={<PrivateRoute> <ProductosVentas /> </PrivateRoute>} />
    <Route path="/ventas" element={<PrivateRoute> <VentasMain /> </PrivateRoute>} />


    <Route path="/impuestos-form1" element={<PrivateRoute><FormFacturacion /></PrivateRoute>} />
    <Route path="/facturacion-masiva" element={<PrivateRoute><FormFacturacionMasiva /></PrivateRoute>} />
    <Route path="/gastos" element={<PrivateRoute><Gastos /></PrivateRoute>} />

    <Route path="/clientes/crear-cliente" element={<PrivateRoute> <ClientForm /> </PrivateRoute>} />
    <Route path="/editClient/:id" element={<PrivateRoute> <ClientForm /> </PrivateRoute>} />
    <Route path="/clientes" element={<PrivateRoute> <Clientes /> </PrivateRoute>} />
    <Route path="/productos/insumos" element={<PrivateRoute> <InsumosPanel /> </PrivateRoute>} />

    <Route path="/recetas" element={<PrivateRoute><RecetasMain /></PrivateRoute>} />
    <Route path="/recetas/crear" element={<PrivateRoute><CrearReceta /></PrivateRoute>} />
    <Route path="/recetas/editar/:id" element={<PrivateRoute><CrearReceta /></PrivateRoute>} />

    <Route path="/event-manager" element={<PrivateRoute><EventManager /></PrivateRoute>} />

    <Route path="/item-mass-import" element={<PrivateRoute><ItemMassImport /></PrivateRoute>} />
    
    <Route path="/register-client" element={<RegisterClient />} />
    <Route path="/contacto" element={<SectionContact />} />
    <Route path="/nosotros" element={<SectionNosotros />} />
    <Route path="/movimientos" element={<PrivateRoute><DashboardMovimientos /></PrivateRoute>} />
    <Route path="/user-profile" element={<PrivateRoute><UserProfile /></PrivateRoute>} />

    <Route path="/cierre-caja" element={<PrivateRoute> <CajaDashboard /></PrivateRoute>} />
  
    <Route path="/product" element={<BreadList />} />
    <Route path="/carrito" element={<CarrritoLista />} />

    <Route path="/egresos" element={<PrivateRoute><EgresosPanel /></PrivateRoute>} />
    <Route path="/ajustes-inventario-insumos" element={<PrivateRoute><AjustesInventarioInsumos /></PrivateRoute>} />

  </Routes>
);

export default AppRoutes;
