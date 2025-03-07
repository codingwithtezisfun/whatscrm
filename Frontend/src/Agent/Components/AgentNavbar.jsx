import React, { useState,useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  FaBars, FaTimes, FaHome, FaEnvelope, FaComments, FaAddressBook, 
  FaBullhorn, FaKey, FaEllipsisH, FaMoon, FaSun, FaUserCircle , FaRobot
} from "react-icons/fa";
import "../../User/Styles/usernavbar.css";

const AgentNavbar = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);

  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("theme") === "dark";
  });

  useEffect(() => {
    document.body.setAttribute("data-theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  const toggleTheme = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem("theme", newMode ? "dark" : "light");
    document.body.setAttribute("data-theme", newMode ? "dark" : "light");
  };

  return (
    <>
      <header className="_agent-navbar-container">
        <div>
          {/* Menu Toggler for Small Screens */}
          <div className="_agent-menu-icon" onClick={() => setSidebarOpen(true)}>
            <FaBars />
          </div>

          {/* Logo Section */}
          <div className="_agent-navbar-logo">
            <div className="_agent-logo-placeholder">LOGO</div>
          </div>
        </div>

        {/* Navigation Links (Hidden on Small Screens) */}
        <nav className="_agent-navbar-links">
          <Link to="chat-component" className="_agent-nav-link">
            <FaEnvelope className="user-icons" />
            <span>Chats</span>
          </Link>
          <Link to="my-tasks" className="_agent-nav-link">
            <FaHome className="user-icons" />
            <span>My Tasks</span>
          </Link>
        </nav>

        {/* Right Section: Theme Toggler + User Avatar */}
        <div className="_agent-navbar-right">
          <div className="_agent-theme-toggle" onClick={toggleTheme}>
            {darkMode ? <FaMoon /> : <FaSun />}
          </div>
          <Link to="more-features" className="_agent-nav-link">
            <FaEllipsisH className="user-icons" />
            <span>Logout</span>
          </Link>
        </div>
      </header>

      {/* Sidebar for Small Screens */}
      <div className={`_agent-sidebar ${sidebarOpen ? "_agent-sidebar-open" : ""}`}>
        <div className="_agent-sidebar-close" onClick={() => setSidebarOpen(false)}>
          <FaTimes />
        </div>
        <nav className="_agent-sidebar-links">
          <Link to="userhome" className="_agent-nav-link" onClick={() => setSidebarOpen(false)}>
            <FaHome className="user-icons" />
            <span>My Tasks</span>
          </Link>
          <Link to="chat-component" className="_agent-nav-link" onClick={() => setSidebarOpen(false)}>
            <FaEnvelope className="user-icons" />
            <span>Chats</span>
          </Link>
          <Link to="chatbot" className="_agent-nav-link" onClick={() => setSidebarOpen(false)}>
            <FaComments className="user-icons" />
            <span>Logout</span>
          </Link>
        </nav>
      </div>

      {/* Overlay for Sidebar */}
      {sidebarOpen && <div className="_agent-overlay" onClick={() => setSidebarOpen(false)}></div>}
    </>
  );
};

export default AgentNavbar;
