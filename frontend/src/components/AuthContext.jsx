import React, { createContext, useContext, useState } from 'react';

// Create the context
export const AuthContext = createContext();

// Hook to use the AuthContext in components
export const useAuth = () => useContext(AuthContext);

// Provide the context to the application
export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null);

  // Function to update login status and role
  const login = (role) => {
    setIsAuthenticated(true);
    setUserRole(role);
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUserRole(null);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, userRole, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};