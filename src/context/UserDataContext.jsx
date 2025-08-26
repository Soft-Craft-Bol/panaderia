import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { getUser, saveUser } from "../utils/authFunctions";

const UserDataContext = createContext();

export const UserDataProvider = ({ children }) => {
  const [userData, setUserData] = useState(null);

  // Cargar datos guardados en cookies al iniciar
  useEffect(() => {
    const storedUser = getUser();
    if (storedUser) {
      setUserData(storedUser);
    }
  }, []);

  const updateUserData = useCallback((newData) => {
    setUserData(newData);
    saveUser(newData);
  }, []);

  const clearUserData = useCallback(() => {
    setUserData(null);
    saveUser({}); // O eliminar cookie
  }, []);

  const hasPermission = useCallback(
    (perm) => userData?.permissions?.includes(perm) ?? false,
    [userData]
  );

  return (
    <UserDataContext.Provider
      value={{
        userData,
        updateUserData,
        clearUserData,
        hasPermission
      }}
    >
      {children}
    </UserDataContext.Provider>
  );
};

export const useUserData = () => useContext(UserDataContext);
