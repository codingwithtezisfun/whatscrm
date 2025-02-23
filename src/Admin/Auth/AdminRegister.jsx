import React, { useState } from "react";
import axios from "axios";
import { FaEnvelope, FaLock, FaUser } from "react-icons/fa";
import Swal from "sweetalert2";
import BASE_URL from "../../BaseUrl";
import "../Styles/adminregister.css";

const AdminRegister = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      return Swal.fire({
        icon: "error",
        title: "Passwords do not match!",
      });
    }

    setLoading(true);

    try {
      const response = await axios.post(`${BASE_URL}/api/admin/register`, {
        email: formData.email,
        password: formData.password,
      });

      setLoading(false);

      if (response.data.success) {
        Swal.fire({
          icon: "success",
          title: "Admin Registered Successfully",
          text: "You can now login.",
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Registration Failed",
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
    <div className="admin-register-container">
      <form className="admin-register-form" onSubmit={handleSubmit}>
        <h2>Register Admin</h2>

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

        {/* Confirm Password Field */}
        <div className="input-group">
          <FaLock className="input-icon" />
          <input
            type="password"
            name="confirmPassword"
            placeholder=" "
            value={formData.confirmPassword}
            onChange={handleChange}
            required
          />
          <label>Confirm Password</label>
        </div>

        {/* Submit Button */}
        <button type="submit" className="register-btn" disabled={loading}>
          {loading ? "Registering..." : "Register"}
        </button>
      </form>
    </div>
  );
};

export default AdminRegister;
