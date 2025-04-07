import React, { useState } from "react";
import { isTokenValid } from "../utils/Auth";
import { getToken } from "../utils/authFunctions";
import { Navigate } from 'react-router-dom';
import { Sidebar } from "../components/sidebar/Sid";
import Navbar from "../components/sidebar/Navbar";

const PrivateRoute = ({ children }) => {
  const token = getToken();
  const tokenExistAndStillValid = token && isTokenValid(token);
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return tokenExistAndStillValid ? (
    <div className={`app-layout ${isSidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
      <Navbar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      
      <main className="main-content">
        {children}
      </main>
    </div>
  ) : (
    <Navigate to="/" />
  );
};

export default PrivateRoute;