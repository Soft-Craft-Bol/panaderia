import { lazy, Suspense } from "react";
import { BrowserRouter } from "react-router-dom";
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from "./context/AuthContext";
import AppRoutes from "./routes/AppRoutes";
import './App.css'
import Navbar from "./components/sidebar/Navbar";


function App() {

  const LoadingComponent = () => <div className="loading-spinner">Cargando...</div>;

  return (
    <AuthProvider>
    <ThemeProvider>
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Navbar />
          <Suspense fallback={<LoadingComponent />}>
            <AppRoutes />
          </Suspense>
        </BrowserRouter>
    </ThemeProvider>
  </AuthProvider>
  );
}
export default App;
