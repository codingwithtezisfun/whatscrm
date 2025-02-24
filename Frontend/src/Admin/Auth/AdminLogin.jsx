import React, { useState } from "react";
import axios from "axios";
import { FaEnvelope, FaLock } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import BASE_URL from "../../BaseUrl"; 
import "../Styles/adminlogin.css";

const AdminLogin = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);

  // Handle Input Change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle Form Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post(`${BASE_URL}/api/admin/login`, formData);
      setLoading(false);

      if (response.data.success) {
        Swal.fire({
          icon: "success",
          title: "Login Successful",
          text: "Redirecting to dashboard...",
          timer: 2000,
          showConfirmButton: false,
        });

        // Store token & redirect
        localStorage.setItem("adminToken", response.data.token);
        navigate("/admin/dashboard");
      } else {
        Swal.fire({
          icon: "error",
          title: "Login Failed",
          text: response.data.msg,
        });
      }
    } catch (error) {
      setLoading(false);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Something went wrong. Please try again.",
      });
    }
  };

  return (
    <div className="admin-login-container">
      <form className="admin-login-form" onSubmit={handleSubmit}>
        <h2>Admin Login</h2>

        {/* Email Field */}
        <div className="input-group">
          <FaEnvelope className="input-icon" />
          <input
            type="email"
            name="email"
            placeholder=" "
            value={formData.email}
            onChange={handleChange}
            required
          />
          <label>Email</label>
        </div>

        {/* Password Field */}
        <div className="input-group">
          <FaLock className="input-icon" />
          <input
            type="password"
            name="password"
            placeholder=" "
            value={formData.password}
            onChange={handleChange}
            required
          />
          <label>Password</label>
        </div>

        {/* Submit Button */}
        <button type="submit" className="login-btn" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
};

export default AdminLogin;
