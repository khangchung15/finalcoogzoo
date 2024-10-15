import React, { useState } from 'react';
import './LoginPage.css'; // Import the styles

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    // Implement login logic here (e.g., API call)

    //Change from username to email
    //Check employee table for matching Email
    //If employee, get ID associated with email and check if that corresponding id has the same password as user entry
    //If so, check role of employee and give token permissions based on that

    //If not employee, Check customers table for email and repeat process


    console.log('Login:', { username, password });
  };

  const handleSignup = () => {
    // Implement sign-up logic here (e.g., redirect to sign-up page)
    console.log('Redirecting to signup...');
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>Have an Existing Account? Login Here</h2>
        <form onSubmit={handleLogin}>
          <div className="input-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="input-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="login-btn">Login</button>
        </form>
        <p className="signup-text">
          Don't have an account? <span onClick={handleSignup}>Sign Up</span>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;