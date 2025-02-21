import { useState } from "react";
import { FaEnvelope, FaLock } from "react-icons/fa";
import Swal from "sweetalert2";
import axios from "axios";
import BASE_URL from "../../BaseUrl";
import "../Styles/login.css";
import { Link, useNavigate } from "react-router-dom";
import Promotion from "../Pages/Promotion";

const UserLogin = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      Swal.fire({ icon: "error", title: "Please fill all the details" });
      return;
    }

    try {
      const response = await axios.post(`${BASE_URL}/api/user/login`, formData);
      if (response.data.success) {
        localStorage.setItem("token", response.data.token);
        Swal.fire({ icon: "success", title: "Login successful" });
        navigate("/dashboard");
      } else {
        Swal.fire({ icon: "error", title: response.data.msg });
      }
    } catch (error) {
      Swal.fire({ icon: "error", title: "Something went wrong", text: error.response?.data?.msg || error.message });
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-left">
        <Promotion />
      </div>
      <div className="login-right">
        <form onSubmit={handleSubmit} className="custom-form">
          <div className="input-container">
            <FaEnvelope className="input-icon" color="gray" />
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="custom-input"
              required
            />
            <label htmlFor="email" className="floating-label">Email</label>
          </div>
          <div className="input-container">
            <FaLock className="input-icon" color="gray" />
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="custom-input"
              required
            />
            <label htmlFor="password" className="floating-label">Password</label>
          </div>
          <button type="submit" className="submit-btn">Login</button>
          <p className="signup-link mt-4">
            Don't have an account? <Link to="/user/signup">Sign Up</Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default UserLogin;
