import React, { useState } from "react";
import "./LoginPage.css";

const LoginPage = () => {
  const [isSignUp, setIsSignUp] = useState(false); // Toggle between Sign In and Sign Up
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState(""); // Only for Sign Up
  const [error, setError] = useState(""); // Error messages
  const [loading, setLoading] = useState(false); // Loading state for form submission

  // Handle form submission for both Sign In and Sign Up
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const authData = isSignUp
      ? { username, email, password }
      : { username, password }; // Collect data based on form type

    try {
      const url = isSignUp
        ? "https://yourapi.com/signup" // Replace with Sign Up API
        : "https://yourapi.com/login"; // Replace with Sign In API

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(authData),
      });

      const data = await response.json();

      if (response.ok) {
        console.log(isSignUp ? "Sign Up successful" : "Login successful", data);
      } else {
        setError(data.message || "An error occurred. Please try again.");
      }
    } catch (error) {
      console.error("Error during authentication:", error);
      setError("An error occurred. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <h2>{isSignUp ? "Sign Up" : "Sign In"}</h2>
      <form onSubmit={handleSubmit}>
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

        {isSignUp && (
          <div className="input-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
        )}

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

        {error && <p className="error">{error}</p>}

        <div className="input-group">
          <button type="submit" className="btn" disabled={loading}>
            {loading
              ? isSignUp
                ? "Signing up..."
                : "Logging in..."
              : isSignUp
              ? "Sign Up"
              : "Sign In"}
          </button>
        </div>

        <div className="toggle-group">
          <p>
            {isSignUp ? "Already have an account?" : "Don't have an account?"}
            <button
              type="button"
              className="link-button"
              onClick={() => setIsSignUp(!isSignUp)}
            >
              {isSignUp ? "Sign In" : "Sign Up"}
            </button>
          </p>
        </div>
      </form>
    </div>
  );
};

export default LoginPage;
