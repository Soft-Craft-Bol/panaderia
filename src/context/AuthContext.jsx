import React, { createContext, useContext, useEffect, useState } from "react";
import { getToken, getUser } from "../utils/authFunctions";
import { isTokenValid } from "../utils/Auth";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [tokenValid, setTokenValid] = useState(false);

  useEffect(() => {
    const token = getToken();
    if (token && isTokenValid(token)) {
      setTokenValid(true);
      setCurrentUser(getUser());
    }
  }, []);

  const logout = () => {
    setTokenValid(false);
    setCurrentUser(null);
  };

  return (
    <AuthContext.Provider value={{ currentUser, tokenValid, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
