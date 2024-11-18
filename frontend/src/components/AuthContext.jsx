import React, { createContext, useContext, useState, useEffect } from 'react';

// Create the context
export const AuthContext = createContext();

// Hook to use the AuthContext in components
export const useAuth = () => useContext(AuthContext);

// Provide the context to the application
export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState('Customer'); // Default to 'Customer'
  const [userEmail, setUserEmail] = useState(null); // Add userEmail state

  // Load authentication state from localStorage on app load
  useEffect(() => {
    const storedAuth = JSON.parse(localStorage.getItem('authState'));
    if (storedAuth?.isAuthenticated) {
      setIsAuthenticated(storedAuth.isAuthenticated);
      setUserRole(storedAuth.userRole || 'Customer');
      setUserEmail(storedAuth.userEmail);
    }
  }, []);

  // Function to update login status, role, and email
  const login = (role, email) => {
    const authState = {
      isAuthenticated: true,
      userRole: role || 'Customer',
      userEmail: email,
    };
    setIsAuthenticated(true);
    setUserRole(role || 'Customer');
    setUserEmail(email);
    localStorage.setItem('authState', JSON.stringify(authState)); // Save to localStorage
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUserRole('Customer'); // Reset to default role on logout
    setUserEmail(null); // Clear the user's email on logout
    localStorage.removeItem('authState'); // Remove from localStorage
  };

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, userRole, userEmail, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};