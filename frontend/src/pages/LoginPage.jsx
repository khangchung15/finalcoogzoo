import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import "./LoginPage.css";

const LoginPage = () => {
  const navigate = useNavigate(); // Initialize useNavigate
  const [isSignUp, setIsSignUp] = useState(false); // Toggle between Sign In and Sign Up
  const [email, setEmail] = useState(""); // Use email instead of username
  const [password, setPassword] = useState("");
  const [error, setError] = useState(""); // Error messages
  const [loading, setLoading] = useState(false); // Loading state for form submission

  // Handle form submission for both Sign In and Sign Up
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const authData = isSignUp
      ? { email, password } // Use email and password for Sign Up
      : { email, password }; // Use email and password for Sign In

    try {
      const url = isSignUp
        ? "http://localhost:5000/signup" // Replace with your actual Sign Up API endpoint
        : "http://localhost:5000/login"; // Replace with your actual Login API endpoint

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
        // Redirect to home page upon successful login
        navigate("/"); // Adjust this path as necessary
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
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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