import React, { useState } from "react";
import { Link } from "react-router-dom";
import { 
  FaBars, FaTimes, FaHome, FaEnvelope, FaComments, FaAddressBook, 
  FaBullhorn, FaKey, FaEllipsisH, FaMoon, FaSun, FaUserCircle , FaRobot
} from "react-icons/fa";
import "../Styles/usernavbar.css";

const UserNavbar = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleTheme = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    document.body.setAttribute("data-theme", newMode ? "dark" : "");
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
          <Link to="userhome" className="_agent-nav-link">
            <FaHome className="user-icons" />
            <span>Dashboard</span>
          </Link>
          <Link to="chat-component" className="_agent-nav-link">
            <FaEnvelope className="user-icons" />
            <span>Inbox</span>
          </Link>
          <Link to="/user/dashboard/chatbot" className="_agent-nav-link">
           <FaRobot className="user-icons" />
            <span>Chatbot Bot</span>
          </Link>
          <Link to="/user/dashboard/chat-flow" className="_agent-nav-link">
            <FaComments className="user-icons" />
            <span>Chatbot Flow</span>
          </Link>
          <Link to="phonebook" className="_agent-nav-link">
            <FaAddressBook className="user-icons" />
            <span>Phonebook</span>
          </Link>
          <Link to="manage-template" className="_agent-nav-link">
            <FaBullhorn className="user-icons" />
            <span>Broadcast</span>
          </Link>
          <Link to="/api-access" className="_agent-nav-link">
            <FaKey className="user-icons" />
            <span>API Access</span>
          </Link>
          <Link to="/more-features" className="_agent-nav-link">
            <FaEllipsisH className="user-icons" />
            <span>More Features</span>
          </Link>
        </nav>

        {/* Right Section: Theme Toggler + User Avatar */}
        <div className="_agent-navbar-right">
          <div className="_agent-theme-toggle" onClick={toggleTheme}>
            {darkMode ? <FaMoon /> : <FaSun />}
          </div>
          <div className="_agent-user-avatar">
            <FaUserCircle />
          </div>
        </div>
      </header>

      {/* Sidebar for Small Screens */}
      <div className={`_agent-sidebar ${sidebarOpen ? "_agent-sidebar-open" : ""}`}>
        <div className="_agent-sidebar-close" onClick={() => setSidebarOpen(false)}>
          <FaTimes />
        </div>
        <nav className="_agent-sidebar-links">
          <Link to="/dashboard" className="_agent-nav-link" onClick={() => setSidebarOpen(false)}>
            <FaHome className="user-icons" />
            <span>Dashboard</span>
          </Link>
          <Link to="/inbox" className="_agent-nav-link" onClick={() => setSidebarOpen(false)}>
            <FaEnvelope className="user-icons" />
            <span>Inbox</span>
          </Link>
          <Link to="/chatbot-flow" className="_agent-nav-link" onClick={() => setSidebarOpen(false)}>
            <FaComments className="user-icons" />
            <span>Chatbot Flow</span>
          </Link>
          <Link to="/phonebook" className="_agent-nav-link" onClick={() => setSidebarOpen(false)}>
            <FaAddressBook className="user-icons" />
            <span>Phonebook</span>
          </Link>
          <Link to="/broadcast" className="_agent-nav-link" onClick={() => setSidebarOpen(false)}>
            <FaBullhorn className="user-icons" />
            <span>Broadcast</span>
          </Link>
          <Link to="/api-access" className="_agent-nav-link" onClick={() => setSidebarOpen(false)}>
            <FaKey className="user-icons" />
            <span>API Access</span>
          </Link>
          <Link to="/more-features" className="_agent-nav-link" onClick={() => setSidebarOpen(false)}>
            <FaEllipsisH className="user-icons" />
            <span>More Features</span>
          </Link>
        </nav>
      </div>

      {/* Overlay for Sidebar */}
      {sidebarOpen && <div className="_agent-overlay" onClick={() => setSidebarOpen(false)}></div>}
    </>
  );
};

export default UserNavbar;
