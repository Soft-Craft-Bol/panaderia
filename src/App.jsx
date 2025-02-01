import { useState } from 'react'
import reactLogo from './assets/react.svg'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import viteLogo from '/vite.svg'
import './App.css'
import Sidebar from './components/sidebar/Sidebar';



function App() {
  const [count, setCount] = useState(0);

  return (
    <Router>
      <div> 
        <Sidebar />
        <div style={{ flex: 1, padding: '20px' }}>
          <Routes>
            <Route path="/" element={<h1>Inicio</h1>} />
            <Route path="/sucursales" element={<h1>Sucursales</h1>} />
            <Route path="/usuarios" element={<h1>Usuarios</h1>} />
            <Route path="/facturacion" element={<h1>Facturación</h1>} />
            <Route path="/punto-de-venta" element={<h1>Punto de Venta</h1>} />
            <Route path="/contaduria" element={<h1>Contaduría</h1>} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
