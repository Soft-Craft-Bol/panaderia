import { Routes, Route } from "react-router-dom";
import PrivateRoute from "../context/PrivateRoute";
import LoginUser from "../pages/login/LoginUser";
import { lazy } from "react";
import AddProduct from "../pages/productos/AddProduct";

const Inicio = lazy(() => import("../pages/inicio/Inicio"));
const Sucursales = lazy(() => import("../pages/Sucursales/Sucursales"));
const Usuarios = lazy(() => import("../pages/usuarios/usuarios"));
const Facturacion = lazy(() => import("../pages/facturacion/Facturacion"));
const Horarios = lazy(() => import("../pages/horarios/Horarios"));
const Productos = lazy(() => import("../pages/productos/Productos"));
const FacturaForm = lazy(() => import("../components/facturaForm/FacturaForm"));
const AddProductos = lazy(() => import("../pages/productos/AddProduct"))
const ClientForm = lazy(() => import("../components/forms/clientForm/ClientForm"));
const Clientes = lazy(() => import("../pages/clientes/Clientes"));
const RegisterUser = lazy(() => import("../pages/users/RegisterUser"));


const AppRoutes = () => (
    <Routes>
        {/* Rutas públicas */}
        <Route path="/" element={<LoginUser />} />
        {/* Rutas privadas */}
        <Route path="/home" element={<PrivateRoute><Inicio /></PrivateRoute>} />
        <Route path="/sucursales" element={<PrivateRoute><Sucursales /></PrivateRoute>} />
        <Route path="/users" element={<PrivateRoute><Usuarios /></PrivateRoute>} />
        <Route path="/horario" element={<PrivateRoute><Horarios/></PrivateRoute>} />
        <Route path="/facturacion" element={<PrivateRoute><Facturacion /></PrivateRoute>} />
        <Route path="/registerUser" element={<PrivateRoute><RegisterUser/> </PrivateRoute>} />
        <Route path="/punto-de-venta" element={<PrivateRoute><h1>Punto de Venta</h1></PrivateRoute>} />
        <Route path="/contaduria" element={<h1>Contaduría</h1>} />
        <Route path="/productos" element = {<PrivateRoute> <Productos/> </PrivateRoute>}/>
        <Route path="/impuestos-form" element={<PrivateRoute> <FacturaForm/> </PrivateRoute>}/>
        <Route path="/productos/addProduct" element = {<PrivateRoute> <AddProduct /> </PrivateRoute>}/>
        <Route path="/clientes/crear-cliente" element = {<PrivateRoute> <ClientForm /> </PrivateRoute>}/>
        <Route path="/clientes" element = {<PrivateRoute> <Clientes /> </PrivateRoute>}/>
    </Routes>
);

export default AppRoutes;
