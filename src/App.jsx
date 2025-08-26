import { lazy, Suspense } from "react";
import { BrowserRouter } from "react-router-dom";
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from "./context/AuthContext";
import AppRoutes from "./routes/AppRoutes";
import './App.css'
import Navbar from "./components/sidebar/Navbar";
import { CarritoProvider } from "./context/CarritoContext";
import { UserDataProvider } from "./context/UserDataContext";

function App() {

  const LoadingComponent = () => <div className="loading-spinner">Cargando...</div>;

  return (
    <AuthProvider>
      <UserDataProvider>
        <ThemeProvider>
          <CarritoProvider>
            <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
              <Suspense fallback={<LoadingComponent />}>
                <AppRoutes />
              </Suspense>
            </BrowserRouter>
          </CarritoProvider>
        </ThemeProvider>
      </UserDataProvider>
    </AuthProvider>
  );
}
export default App;
