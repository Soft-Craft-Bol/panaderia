import React, { useState } from "react";
import { isTokenValid } from "../utils/Auth";
import { getToken } from "../utils/authFunctions";
import { Navigate } from 'react-router-dom';
import { Sidebar } from "../components/sidebar/Sid";
import Navbar from "../components/sidebar/Navbar";
import NoPermission from "../components/NoPermission";
import usePermissions from "../hooks/usePermissions";

const PrivateRoute = ({ children, requiredPermissions = [] }) => {
  const token = getToken();
  const tokenExistAndStillValid = token && isTokenValid(token);
  const { hasPermission } = usePermissions();
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  if (!tokenExistAndStillValid) {
    return <Navigate to="/" />;
  }

  if (!hasPermission(requiredPermissions)) {
    return (
      <div className={`app-layout ${isSidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
        <Navbar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
        <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
        <main className="main-content">
          <NoPermission />
        </main>
      </div>
    );
  }

  return (
    <div className={`app-layout ${isSidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
      <Navbar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      <main className="main-content">
        {children}
      </main>
    </div>
  );
};

export default PrivateRoute;