import { Routes, Route } from "react-router-dom";
import PrivateRoute from "../context/PrivateRoute";
import LoginUser from "../pages/login/LoginUser";
import { lazy } from "react";

const Inicio = lazy(() => import("../pages/inicio/Inicio"));

const RegisterUser = lazy(() => import("../pages/users/RegisterUser"));
const UserManagement = lazy(() => import("../pages/users/ListUser"));
const Horarios = lazy(() => import("../pages/horarios/Horarios"));

const Sucursales = lazy(() => import("../pages/Sucursales/Sucursales"));
const AddSucursal = lazy(() => import("../pages/Sucursales/AddSucursal"))
const Despachos = lazy(() => import("../pages/despachos/Despachos"));
const CrearDespacho = lazy(() => import("../components/forms/despachoForm/DespachoForm"))

const ItemForm = lazy(() => import("../components/forms/itemForm/ItemForm"));
const Productos = lazy(() => import("../pages/productos/Productos"));
const ProductosExternos = lazy (() => import("../pages/productos/ProductosExternos"));
const CarrritoLista = lazy(() => import("../pages/pedidos/CarritoLista"));
const ReservasTable = lazy(() => import("../pages/pedidos/ReservasTable"));

const ListVentas = lazy(() => import("../pages/facturacion/ListVentas"));
const Gastos = lazy(() => import("../pages/gastos/Gastos"));
const FacturaForm = lazy(() => import("../components/facturaForm/FacturaForm"));
const Facturacion = lazy(() => import("../pages/facturacion/Facturacion"));

const ClientForm = lazy(() => import("../components/forms/clientForm/ClientForm"));
const Clientes = lazy(() => import("../pages/clientes/Clientes"));
const LandingPage = lazy(() => import("../pages/landingPage/LandingPage"));
const BreadList = lazy(() => import("../pages/landingPage/BreadList"));
const Insumos = lazy(() => import("../pages/insumos/Insumos"));
const CrearInsumoPage = lazy(() => import("../pages/insumos/CrearInsumoPage"));
const EditarInsumo = lazy(() => import("../pages/insumos/EditarInsumo"));
const ListaRecetas = lazy(() => import("../pages/recetas/ListaRecetas"));
const CrearReceta = lazy(() => import("../pages/insumos/CrearReceta"));
const ProductosVentas = lazy(() => import("../pages/productos/ProdcutoVentas"));
const InsumosInactivos = lazy(() => import("../pages/insumos/InsumosInactivos"));
const EventForm = lazy(() => import("../pages/event/EventForm") )
const ListEvent = lazy(() => import("../pages/event/ListEvent") )
const EventManager = lazy(() => import("../pages/event/EventoManager") )
const ProduccionForm = lazy(() => import("../pages/insumos/ProduccionForm") )
const TopClients = lazy(() => import("../pages/clientes/TopClients") )
const ItemMassImport = lazy(() => import("../components/forms/itemForm/ItemMassImport") )
const FormFacturacion = lazy(() => import("../components/facturaForm/FormFacturacion") )
const RegisterClient = lazy(() => import("../components/forms/clientForm/RegisterClient"));
const SectionContact = lazy(() => import("../pages/landingPage/SectionContact"));
const SectionNosotros = lazy(() => import("../pages/landingPage/SectionNosotros"));
const CierreCaja = lazy(() => import("../pages/cajas/CierreCajaForm"));
import MyComponent from "../components/table/MyComponent";
const cajaEjemplo = {
    id: 1,
    nombre: "Caja Principal",
    montoInicial: 500.00
  };

  const usuarioEjemplo = {
    id: 1,
    nombre: "Juan Pérez"
  };


const AppRoutes = () => (
  
    <Routes>
        {/* Rutas públicas */}
        <Route path="/login" element={<LoginUser />} />

        {/* Rutas privadas */}
        <Route path="/home" element={<PrivateRoute><Inicio /></PrivateRoute>} />
        {/*Principal Sidebar*/ }
        <Route path="/users" element={<PrivateRoute><UserManagement /></PrivateRoute>} />
        <Route path="/registerUser" element={<PrivateRoute><RegisterUser/> </PrivateRoute>} />
        <Route path="/register" element={<RegisterUser/> } />
        <Route path="/editUser/:id" element={<PrivateRoute><RegisterUser/></PrivateRoute>} />
        <Route path="/horario" element={<PrivateRoute><Horarios/></PrivateRoute>} />

        <Route path="/sucursales" element={<PrivateRoute><Sucursales /></PrivateRoute>} />
        <Route path="/sucursales/addSucursal" element = {<PrivateRoute> <AddSucursal> </AddSucursal></PrivateRoute>} />
        <Route path="/editSucursal/:id" element ={<PrivateRoute> <AddSucursal/> </PrivateRoute>}/>
        <Route path="/despachos" element = {<PrivateRoute> <Despachos /> </PrivateRoute>}/>
        <Route path="/despachos/create" element = {<PrivateRoute> <CrearDespacho /> </PrivateRoute>}/>

        <Route path="/productos" element = {<PrivateRoute> <Productos/> </PrivateRoute>}/>
        <Route path="/addProduct" element = {<PrivateRoute> <ItemForm /> </PrivateRoute>}/>
        <Route path="/editProduct/:id" element = {<PrivateRoute>  <ItemForm/> </PrivateRoute>} />
        <Route path="/productos-externos" element = {<PrivateRoute> <ProductosExternos /> </PrivateRoute>}/>
        <Route path="/carrito" element = {<PrivateRoute> <CarrritoLista /></PrivateRoute>}/>
        <Route path="/reservas" element = {<PrivateRoute> <ReservasTable /></PrivateRoute>}/>
        <Route path="/product" element = {<BreadList /> }/>
        <Route path="/productos-ventas" element = {<PrivateRoute> <ProductosVentas /> </PrivateRoute>} />

        <Route path="/facturacion" element={<PrivateRoute><Facturacion /></PrivateRoute>} />
        <Route path="/ventas" element={<PrivateRoute><ListVentas /></PrivateRoute>} />
        <Route path="/gastos" element={<PrivateRoute><Gastos/></PrivateRoute>} />
        <Route path="/impuestos-form" element={<PrivateRoute> <FacturaForm/> </PrivateRoute>}/>

        <Route path="/clientes/crear-cliente" element = {<PrivateRoute> <ClientForm /> </PrivateRoute>}/>
        <Route path="/editClient/:id" element = {<PrivateRoute> <ClientForm /> </PrivateRoute>}/>
        <Route path="/clientes" element = {<PrivateRoute> <Clientes /> </PrivateRoute>}/>
        <Route path="/insumos" element = {<PrivateRoute> <Insumos /> </PrivateRoute>}/>
        {/* <Route path="/insumos/edit/:id" element = {<PrivateRoute> <ItemForm /> </PrivateRoute>}/> */}
        <Route path="/" element = {<LandingPage />}/>
        <Route path="/insumos/crear" element={<PrivateRoute><CrearInsumoPage /></PrivateRoute>} />
        <Route path="/insumos/inactivos" element={<PrivateRoute><InsumosInactivos /></PrivateRoute>} />
        <Route path="/insumos/edit/:id" element={<PrivateRoute><EditarInsumo /></PrivateRoute>} />
        <Route path="/insumos/produccion" element={<PrivateRoute><ProduccionForm/></PrivateRoute>} />

        <Route path="/recetas" element={<PrivateRoute><ListaRecetas /></PrivateRoute>} />
        <Route path="/recetas/crear" element={<PrivateRoute><CrearReceta /></PrivateRoute>} />


        <Route path="/evento" element={<PrivateRoute><EventForm/></PrivateRoute>}/>
        <Route path="/list-evento" element={<PrivateRoute><ListEvent/></PrivateRoute>} />
        <Route path="/event-manager" element={<PrivateRoute><EventManager/></PrivateRoute>} />
        
        <Route path="/top-clientes" element={<PrivateRoute><TopClients/></PrivateRoute>} />
        <Route path="/item-mass-import" element={<PrivateRoute><ItemMassImport/></PrivateRoute>} />
        <Route path="/impuestos-form1" element={<PrivateRoute><FormFacturacion/></PrivateRoute>} />
        <Route path="/register-client" element={<RegisterClient />} />
        <Route path="/contacto" element={<SectionContact />} />
        <Route path="/nosotros" element={<SectionNosotros />} />

<Route path= "/my-component" element={<PrivateRoute><MyComponent/></PrivateRoute>} />

<Route path="/cierre-caja" element={<PrivateRoute> <CierreCaja caja={cajaEjemplo} usuario={usuarioEjemplo}  /></PrivateRoute>} />

    </Routes>
);

export default AppRoutes;
