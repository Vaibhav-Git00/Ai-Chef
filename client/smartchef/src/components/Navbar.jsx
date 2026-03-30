import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import authService from "../services/authService";
import "../styles/navbar.css";

const Navbar = ({ user }) => {
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);

  const handleLogout = () => {
    authService.clearToken();
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-brand" onClick={() => navigate("/")}>
          <span className="logo">🍳</span>
          <span className="brand-name">SmartChef AI</span>
        </div>

        <div className="navbar-menu">
          <button className="nav-link" onClick={() => navigate("/")}>
            Home
          </button>
          {user && (
            <>
              <button className="nav-link" onClick={() => navigate("/history")}>
                History
              </button>
              <button className="nav-link" onClick={() => navigate("/mealplan")}>
                Meal Planner
              </button>
            </>
          )}
        </div>

        <div className="navbar-right">
          {user ? (
            <div className="user-menu">
              <button
                className="user-button"
                onClick={() => setShowDropdown(!showDropdown)}
              >
                <span className="user-avatar">👤</span>
                <span className="user-name">{user.name}</span>
              </button>

              {showDropdown && (
                <div className="dropdown-menu">
                  <button
                    className="dropdown-item"
                    onClick={() => {
                      navigate("/profile");
                      setShowDropdown(false);
                    }}
                  >
                    👤 Profile
                  </button>
                  <button
                    className="dropdown-item"
                    onClick={() => {
                      navigate("/preferences");
                      setShowDropdown(false);
                    }}
                  >
                    ⚙️ Preferences
                  </button>
                  <hr />
                  <button className="dropdown-item logout" onClick={handleLogout}>
                    🚪 Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="auth-buttons">
              <button
                className="btn btn-secondary"
                onClick={() => navigate("/login")}
              >
                Login
              </button>
              <button
                className="btn btn-primary"
                onClick={() => navigate("/signup")}
              >
                Signup
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
