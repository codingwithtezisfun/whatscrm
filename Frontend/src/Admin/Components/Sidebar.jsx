import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaUser,
  FaWallet,
  FaFileContract,
  FaQuestionCircle,
  FaCog,
  FaBars,
  FaBuilding,
  FaSignOutAlt,
  FaUsers,
  FaQuoteRight,
  FaShoppingCart,
  FaLink,
  FaPalette,
  FaUserPlus,
  FaEnvelopeOpen,
  FaLanguage,
  FaSyncAlt,
} from "react-icons/fa";
import { MdDashboard } from "react-icons/md";
import "../Styles/sidebar.css";
import logo from "../../assets/download.png";

const Sidebar = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isLargeScreen, setIsLargeScreen] = useState(window.innerWidth >= 1024);
  const navigate = useNavigate();

  // Detect screen size to enable hover expand only for large screens
  useEffect(() => {
    const handleResize = () => {
      setIsLargeScreen(window.innerWidth >= 1024);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleSidebar = () => {
    setIsMobileOpen(!isMobileOpen);
  };

  const handleLinkClick = () => {
    setIsMobileOpen(false);
    setIsExpanded(false);
  };

  const handleLogout = () => {
    navigate("/logout"); // or wherever you need to redirect on logout
  };

  const sidebarItems = [
    { to: "home", icon: <MdDashboard />, label: "Dashboard" },
    { to: "plan-management", icon: <FaBuilding />, label: "Manage Plan" },
    { to: "user-management", icon: <FaUser />, label: "Manage User" },
    { to: "payment-gateways", icon: <FaWallet />, label: "Payment Gateways" },
    { to: "partners", icon: <FaUsers />, label: "Front Partner" },
    { to: "faqs", icon: <FaQuestionCircle />, label: "FAQs" },
    { to: "manage-page", icon: <FaFileContract />, label: "Manage Page" },
    { to: "testimonials", icon: <FaQuoteRight />, label: "Testimonial" },
    { to: "order", icon: <FaShoppingCart />, label: "Order" },
    { to: "wa-links", icon: <FaLink />, label: "Wa Links Data" },
    { to: "theme-colors", icon: <FaPalette />, label: "Theme Colors" },
    { to: "social-login", icon: <FaUserPlus />, label: "Social Login" },
    { to: "app-config", icon: <FaCog />, label: "App Config" },
    { to: "smtp-settings", icon: <FaEnvelopeOpen />, label: "SMTP Settings" },
    { to: "web-translation", icon: <FaLanguage />, label: "Web Translation" },
    { to: "update-app", icon: <FaSyncAlt />, label: "Update App" },
    { to: "logout", icon: <FaSignOutAlt />, label: "Logout", onClick: handleLogout },
  ];

  return (
    <>
      {isMobileOpen && <div className="__sidebar-overlay" onClick={toggleSidebar}></div>}

      <div
        className={`__sidebar ${isExpanded || isMobileOpen ? "__expanded" : ""}`}
        onMouseEnter={() => isLargeScreen && setIsExpanded(true)}
        onMouseLeave={() => isLargeScreen && setIsExpanded(false)}
      >
        <button className="__sidebar-toggle d-lg-none" onClick={toggleSidebar}>
          <FaBars />
        </button>

        <div className="d-flex align-items-center __logo-container">
          <img src={logo} alt="logo" className="__logo" /> 
          <label className="__label __logo-label" htmlFor="logo">WhatsCRM</label>
          </div>

        <ul className="__sidebar-list">
          {sidebarItems.map(({ to, icon, label, onClick }) => (
            <li key={to}>
              <Link to={to} onClick={() => { handleLinkClick(); onClick && onClick(); }}>
                <span className="__icon">{icon}</span>
                <span className="__label">{label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
};

export default Sidebar;
