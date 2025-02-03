import { useState } from 'react'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css'
import Sidebar from './components/sidebar/Sidebar';
import Inicio from './pages/inicio/Inicio';
import Sucursales from './pages/Sucursales/Sucursales'
import Usuarios from './pages/usuarios/usuarios';
import Horarios from './pages/horarios/Horarios';
import Facturacion from './pages/facturacion/Facturacion';


function App() {
  const [count, setCount] = useState(0);

  return (
    <Router>
      <div> 
        <Sidebar />
        <div >
          <Routes>
            <Route path="/" element={<Inicio />} />
            <Route path="/sucursales" element={<Sucursales />} />
            <Route path="/users" element={<Usuarios/>} />
            <Route path="/horario" element={<Horarios/>} />
            <Route path="/facturacion" element={<Facturacion />} />
            <Route path="/punto-de-venta" element={<h1>Punto de Venta</h1>} />
            <Route path="/contaduria" element={<h1>Contaduría</h1>} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
