import React, { createContext, useContext, useState, useEffect } from "react";
import Cookies from "js-cookie";
import { getMe } from "../api/auth.js";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setAuth] = useState(false);
  const [authLoading, setAuthLoading] = useState(true); // ⭐ prevents login flash

  useEffect(() => {
    const token = Cookies.get("access_token");
    if (token) fetchUser();
    else setAuthLoading(false);
  }, []);

  const fetchUser = async () => {
    try {
      const userData = await getMe();
      setUser(userData);
      setAuth(true);
    } catch {
      setAuth(false);
      setUser(null);
    }
    setAuthLoading(false); // ⭐ stop loading
  };

  const login = (token, userObj) => {
    setAuth(true);
    setUser(userObj);
  };

  const logout = () => {
    Cookies.remove("access_token");
    setAuth(false);
    setUser(null);
  };

  const updateUser = (partialUser) => {
    setUser((prev) => (prev ? { ...prev, ...partialUser } : prev));
  };

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated, authLoading, login, logout, updateUser }}
    >
      {!authLoading && children} 
      {/* ⭐ children render ONLY after auth check */}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
