import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import './LoginButton.css';
import { AuthContext } from './AuthContext'; // Ensure the correct import

const LoginButton = () => {
  const { isAuthenticated } = useContext(AuthContext); // Access global auth state

  return (
    <li>
      {isAuthenticated ? (
       <Link to="/account">
         <button className="login-button">My Account</button>
       </Link>
      ) : (
        <Link to="/login">
          <button className="login-button">Login / Signup</button>
        </Link>
      )}
    </li>
  );
};

export default LoginButton;