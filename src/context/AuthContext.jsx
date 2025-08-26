import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { getToken, getUser, saveUser } from "../utils/authFunctions";
import { isTokenValid } from "../utils/Auth";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [tokenValid, setTokenValid] = useState(false);

  // Cargar datos al iniciar
  useEffect(() => {
    const token = getToken();
    const storedUser = getUser();
    
    if (token && isTokenValid(token) && storedUser) {
      setTokenValid(true);
      setCurrentUser(storedUser);
    }
  }, []);

  // Actualizar usuario y persistir datos
  const updateUserData = useCallback((newData) => {
    setCurrentUser(newData);
    saveUser(newData);
    setTokenValid(true);
  }, []);

  // Limpiar datos (logout)
  const logout = useCallback(() => {
    setCurrentUser(null);
    setTokenValid(false);
  }, []);

  // Verificar permisos
  const hasPermission = useCallback(
    (perm) => currentUser?.permissions?.includes(perm) ?? false,
    [currentUser]
  );

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        tokenValid,
        updateUserData,
        logout,
        hasPermission
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);