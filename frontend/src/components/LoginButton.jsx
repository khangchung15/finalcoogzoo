import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import './LoginButton.css';
import { AuthContext } from './AuthContext';

const LoginButton = () => {
  const { isAuthenticated } = useContext(AuthContext);
  
  return (
    <>
      {isAuthenticated ? (
        <Link to="/account">
          <button className="login-button">My Account</button>
        </Link>
      ) : (
        <Link to="/login">
          <button className="login-button">Login / Signup</button>
        </Link>
      )}
    </>
  );
};

export default LoginButton;