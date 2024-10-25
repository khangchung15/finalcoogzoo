import React, { useContext } from 'react'; // Import useContext
import { Outlet, Navigate } from 'react-router-dom';
import { AuthContext } from './AuthContext'; // Import the AuthContext

const PrivateRoutes = () => {
  const { isAuthenticated } = useContext(AuthContext); // Access global authentication state
  
  if (!isAuthenticated) {
    // Show alert message to the user before redirecting (optional)
    // alert('You must login first!');
    return <Navigate to="/login" />; // Redirect to login if not authenticated
  }

  return <Outlet />;  // Render the protected routes if authenticated
};

export default PrivateRoutes;