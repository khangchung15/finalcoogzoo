import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../components/AuthContext"; // Import AuthContext for global state
import "./LoginPage.css";

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext); // Use login function from AuthContext

  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const authData = { email, password };

    try {
      const url = isSignUp
        ? "http://localhost:5000/signup"
        : "http://localhost:5000/login";

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

        // Set the login state in AuthContext
        login(data.user.role); // Pass the user role to login function

        // Redirect to the home page upon successful login
        navigate("/");
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
