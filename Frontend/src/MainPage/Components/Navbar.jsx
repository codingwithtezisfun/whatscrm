import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaBars, FaTimes, FaUserCircle, FaMoon, FaSun } from "react-icons/fa";
import "../Styles/navbar.css";

const Navbar = () => {
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <>
      {/* Navbar */}
      <nav className="navbar sticky-top">
        <div className="container-fluid">
          <div className="navbar-logo">
            <Link to="/">LOGO</Link>
          </div>

          {/* Middle Links */}
          <ul className="navbar-links">
            <li><Link to="/privacy">Privacy Policy</Link></li>
            <li><Link to="/terms">Terms & Conditions</Link></li>
            <li><Link to="/contact">Contact Us</Link></li>
          </ul>

          {/* Right Side */}
          <div className="navbar-icons">
            <button onClick={toggleTheme} className="theme-toggler">
              {theme === "light" ? <FaMoon /> : <FaSun />}
            </button>
            <Link to="/admin/dashboard">
              <FaUserCircle className="user-icon" />
            </Link>
            <button className="sidebar-toggle" onClick={toggleSidebar}>
              <FaBars />
            </button>
          </div>
        </div>
      </nav>

      {/* Sidebar for small screens */}
      <div className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        <button className="close-btn" onClick={toggleSidebar}>
          <FaTimes />
        </button>
        <ul>
          <li><Link to="/privacy" onClick={toggleSidebar}>Privacy Policy</Link></li>
          <li><Link to="/terms" onClick={toggleSidebar}>Terms & Conditions</Link></li>
          <li><Link to="/contact" onClick={toggleSidebar}>Contact Us</Link></li>
          <li><Link to="/dashboard" onClick={toggleSidebar}>Dashboard</Link></li>
          <li>
            <button onClick={toggleTheme} className="theme-toggler">
              {theme === "light" ? <FaMoon /> : <FaSun />} Toggle Theme
            </button>
          </li>
        </ul>
      </div>
    </>
  );
};

export default Navbar;
