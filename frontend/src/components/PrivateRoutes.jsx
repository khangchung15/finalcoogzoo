import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';

const PrivateRoutes = () => {
  // Example authentication check (in real case, you'd check for a valid JWT token)
  let auth = { token: false }; 

  if (!auth.token) {
<<<<<<< HEAD
=======
    // Show alert message to the user before redirecting
   // alert('You must login first!');
>>>>>>> 1312919196c92138b74eecc07af68be707381564
    return <Navigate to="/login" />;
  }

  return <Outlet />;  // Render the protected routes if authenticated
};

export default PrivateRoutes;
