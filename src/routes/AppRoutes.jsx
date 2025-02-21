import { Routes, Route } from "react-router-dom";
import PrivateRoute from "../context/PrivateRoute";
import LoginUser from "../pages/login/LoginUser";
import { lazy } from "react";

const Inicio = lazy(() => import("../pages/inicio/Inicio"));
const Sucursales = lazy(() => import("../pages/Sucursales/Sucursales"));
const Facturacion = lazy(() => import("../pages/facturacion/Facturacion"));
const Horarios = lazy(() => import("../pages/horarios/Horarios"));
const Productos = lazy(() => import("../pages/productos/Productos"));
const FacturaForm = lazy(() => import("../components/facturaForm/FacturaForm"));
const AddProduct = lazy(() => import("../pages/productos/AddProduct"))
const AddSucursal = lazy(() => import("../pages/Sucursales/AddSucursal"))
const ClientForm = lazy(() => import("../components/forms/clientForm/ClientForm"));
const Clientes = lazy(() => import("../pages/clientes/Clientes"));
const RegisterUser = lazy(() => import("../pages/users/RegisterUser"));
const UserManagement = lazy(() => import("../pages/users/ListUser"));
const ListVentas = lazy(() => import("../pages/facturacion/ListVentas"));
const Despachos = lazy(() => import("../pages/despachos/Despachos"));
const CrearDespacho = lazy(() => import("../components/forms/despachoForm/DespachoForm"))
const Gastos = lazy(() => import("../pages/gastos/Gastos"));
const AppRoutes = () => (
    <Routes>
        {/* Rutas públicas */}
        <Route path="/" element={<LoginUser />} />
        {/* Rutas privadas */}
        <Route path="/home" element={<PrivateRoute><Inicio /></PrivateRoute>} />
        <Route path="/sucursales" element={<PrivateRoute><Sucursales /></PrivateRoute>} />
        <Route path="/users" element={<PrivateRoute><UserManagement /></PrivateRoute>} />
        <Route path="/sucursales/addSucursal" element = {<PrivateRoute> <AddSucursal> </AddSucursal></PrivateRoute>} />
        <Route path="/horario" element={<PrivateRoute><Horarios/></PrivateRoute>} />
        <Route path="/facturacion" element={<PrivateRoute><Facturacion /></PrivateRoute>} />
        <Route path="/ventas" element={<PrivateRoute><ListVentas /></PrivateRoute>} />
        <Route path="/registerUser" element={<PrivateRoute><RegisterUser/> </PrivateRoute>} />
        <Route path="/editUser/:id" element={<PrivateRoute><RegisterUser/></PrivateRoute>} />
        <Route path="/gastos" element={<PrivateRoute><Gastos/></PrivateRoute>} />
        <Route path="/productos" element = {<PrivateRoute> <Productos/> </PrivateRoute>}/>
        <Route path="/impuestos-form" element={<PrivateRoute> <FacturaForm/> </PrivateRoute>}/>
        <Route path="/productos/addProduct" element = {<PrivateRoute> <AddProduct /> </PrivateRoute>}/>
        <Route path="/clientes/crear-cliente" element = {<PrivateRoute> <ClientForm /> </PrivateRoute>}/>
        <Route path="/clientes" element = {<PrivateRoute> <Clientes /> </PrivateRoute>}/>
        <Route path="/despachos" element = {<PrivateRoute> <Despachos /> </PrivateRoute>}/>
        <Route path="/despachos/create" element = {<PrivateRoute> <CrearDespacho /> </PrivateRoute>}/>

    </Routes>
);

export default AppRoutes;
