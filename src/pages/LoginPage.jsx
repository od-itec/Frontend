import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import mascotIcon from "../assets/testimoniale-icon.svg";
import "./LoginPage.css";

function EyeIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="password-toggle-icon"
    >
      <path
        d="M2 12s3.6-6 10-6 10 6 10 6-3.6 6-10 6S2 12 2 12Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle
        cx="12"
        cy="12"
        r="3"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="password-toggle-icon"
    >
      <path
        d="M3 3l18 18"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M10.6 6.2A10.7 10.7 0 0 1 12 6c6.4 0 10 6 10 6a18.4 18.4 0 0 1-3.2 3.9"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M6.7 6.8C4 8.2 2 12 2 12a18.8 18.8 0 0 0 10 6c1.6 0 3-.3 4.2-.8"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9.9 9.9A3 3 0 0 0 14.1 14.1"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function SunIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="theme-icon">
      <circle cx="12" cy="12" r="4.5" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M12 2.5v2.5M12 19v2.5M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M2.5 12H5M19 12h2.5M4.9 19.1l1.8-1.8M17.3 6.7l1.8-1.8"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="theme-icon">
      <path
        d="M20 14.4A8.8 8.8 0 1 1 9.6 4a7.1 7.1 0 0 0 10.4 10.4Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [theme, setTheme] = useState("sky");

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Email:", email);
    console.log("Password:", password);
    navigate("/workspace");
  };

  return (
    <div className={`login-page theme-${theme}`}>
      <div className="login-theme-toggle" role="group" aria-label="Theme switcher">
        <button
          type="button"
          className={`theme-option ${theme === "sky" ? "is-active" : ""}`}
          onClick={() => setTheme("sky")}
          aria-label="Switch to light theme"
          aria-pressed={theme === "sky"}
        >
          <SunIcon />
        </button>
        <button
          type="button"
          className={`theme-option ${theme === "graphite" ? "is-active" : ""}`}
          onClick={() => setTheme("graphite")}
          aria-label="Switch to dark theme"
          aria-pressed={theme === "graphite"}
        >
          <MoonIcon />
        </button>
      </div>

      <div className="login-card">
        <div className="login-mascot-shell" aria-hidden="true">
          <img
            src={mascotIcon}
            alt=""
            className="login-mascot-image"
          />
        </div>

        <h2 className="login-title">Welcome Back</h2>
        <p className="login-subtitle">Log in to your account</p>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="input-group">
            <label>Email</label>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <label>Password</label>
            <div className="password-field">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword((visible) => !visible)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                aria-pressed={showPassword}
              >
                {showPassword ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>
          </div>

          <button type="submit" className="login-btn">
            Login
          </button>
        </form>

        <p className="login-footer">
          Don't have an account? <span>Register</span>
        </p>
      </div>
    </div>
  );
}
