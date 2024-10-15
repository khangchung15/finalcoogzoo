import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';

const PrivateRoutes = () => {
  // Example authentication check (in real case, you'd check for a valid JWT token)
  let auth = { token: false }; 

  if (!auth.token) {
    // Show alert message to the user before redirecting
   // alert('You must login first!');
    return <Navigate to="/login" />;
  }

  return <Outlet />;  // Render the protected routes if authenticated
};

export default PrivateRoutes;
