import React from 'react';
import { Link } from 'react-router-dom';
import './LoginButton.css';

const LoginButton = () => {
  return (
    <Link to="/login">
      <button className="login-button">Login / Signup</button>
    </Link>
  );
};

export default LoginButton;