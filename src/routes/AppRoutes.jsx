import { Routes, Route } from "react-router-dom";
import PrivateRoute from "../context/PrivateRoute";
import LoginUser from "../pages/login/LoginUser";
import { lazy } from "react";

const Inicio = lazy(() => import("../pages/inicio/Inicio"));
const Sucursales = lazy(() => import("../pages/Sucursales/Sucursales"));
const Usuarios = lazy(() => import("../pages/usuarios/usuarios"));
const Facturacion = lazy(() => import("../pages/facturacion/Facturacion"));
const Horarios = lazy(() => import("../pages/horarios/Horarios"));


const AppRoutes = () => (
    <Routes>
        {/* Rutas públicas */}
        <Route path="/" element={<LoginUser />} />

        {/* Rutas privadas */}
        <Route path="/home" element={<Inicio/>} />
        <Route path="/sucursales" element={<Sucursales />} />
        <Route path="/users" element={<Usuarios />} />
        <Route path="/horario" element={<Horarios/>} />
        <Route path="/facturacion" element={<Facturacion />} />
        <Route path="/punto-de-venta" element={<h1>Punto de Venta</h1>} />
        <Route path="/contaduria" element={<h1>Contaduría</h1>} />
    </Routes>
);

export default AppRoutes;
