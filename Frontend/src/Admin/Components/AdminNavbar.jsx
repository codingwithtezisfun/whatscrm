import { useState, useEffect } from "react";
import { FaUserCircle, FaMoon, FaSun } from "react-icons/fa";
import "../Styles/navbar.css";
// import { UserData } from "../../UserData";



const AdminNavbar = () => {
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");
//   const { agentData, loading, error } = UserData();
  
    // if (loading) return <p>Loading...</p>;
    // if (error) return <p className="alert alert-danger">{error}</p>;
  

  // Toggle theme
  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    document.body.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme);
  };

  return (
    <nav className="navbar __admin-navbar">
      <span className="__username">
        Welcome, Admin
      </span>

      <div className="__navbar-right">
        <button className="__theme-toggle" onClick={toggleTheme}>
          {theme === "light" ? <FaMoon /> : <FaSun />}
        </button>
        <button className="__profile-icon">
          <FaUserCircle />
        </button>
      </div>
    </nav>
  );
};

export default AdminNavbar;
