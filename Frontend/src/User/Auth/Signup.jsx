import { useState } from "react";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { FaUser, FaEnvelope, FaLock } from "react-icons/fa";
import Swal from "sweetalert2";
import axios from "axios";
import BASE_URL from "../../BaseUrl";
import "../Styles/Signup.css";
import { Link } from 'react-router-dom';
import Promotion from "../Pages/Promotion";

const Signup = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    mobile_with_country_code: "",
    acceptPolicy: false,
  });

  const [phoneError, setPhoneError] = useState("");

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handlePhoneChange = (value) => {
    if (!value) {
      setFormData({ ...formData, mobile_with_country_code: '' });
      setPhoneError('Phone number is required.');
      return;
    }

    // Normalize: Remove '+' if present, and if number starts with '0', replace with '254'
    let normalized = value;
    if (normalized.startsWith('+')) {
      normalized = normalized.slice(1);
    }
    if (normalized.startsWith('0')) {
      normalized = '254' + normalized.slice(1);
    }

    // Validate that the number is either 2547xxxxxxxx or 2541xxxxxxxx (12 digits total)
    if (/^(2547|2541)\d{8}$/.test(normalized)) {
      setFormData({ ...formData, mobile_with_country_code: normalized });
      setPhoneError('');
    } else {
      setPhoneError("+2547 or +2541, followed by exactly 8 digits.");
      setFormData({ ...formData, mobile_with_country_code: '' });
    }
  };

  const handleAcceptPolicy = (e) => {
    e.preventDefault();
    setFormData({ ...formData, acceptPolicy: true });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Client-side validation for all fields
    if (
      !formData.name ||
      !formData.email ||
      !formData.password ||
      !formData.mobile_with_country_code ||
      !formData.acceptPolicy
    ) {
      Swal.fire({
        icon: "error",
        title: "Please fill all the details",
      });
      return;
    }

    if (phoneError) {
      Swal.fire({
        icon: "error",
        title: "Invalid Phone Number",
        text: phoneError,
      });
      return;
    }

    try {
      const response = await axios.post(`${BASE_URL}/api/user/signup`, formData);
      console.log("Submitted data:", formData);
      
      Swal.fire({
        icon: response.data.success ? "success" : "error",
        title: response.data.msg,
      });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Something went wrong",
        text: error.response?.data?.msg || error.message,
      });
    }
  };

  return (
    <div className="signup-wrapper">
      <div className="signup-left">
       <Promotion />
      </div>
      <div className="signup-right">
        <form onSubmit={handleSubmit} className="custom-form">
          <div className="input-container">
            <FaUser className="input-icon" color="gray" />
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="custom-input"
              required
            />
            <label htmlFor="name" className="floating-label">Full Name</label>
          </div>
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
          
          <div className="input-container phone-container">
            <PhoneInput
              country={"ke"}
              value={formData.mobile_with_country_code ? `+${formData.mobile_with_country_code}` : ''}
              onChange={handlePhoneChange}
              inputStyle={{ background: "black", color: "white", borderColor: "gray", width: "100%", padding: "27px",paddingLeft:"50px" }}
              containerClass="phone-input-container"
            //   className="form-control"
              inputClass="phone-input"
            />
            <label className="floating-label phone-label">Phone Number</label>
            {phoneError && <small className="text-danger">{phoneError}</small>}
          </div>

            <div className="form-check mt-3">
                <input
                    type="checkbox"
                    name="acceptPolicy"
                    checked={formData.acceptPolicy}
                    onChange={handleChange}
                    className="form-check-input"
                    id="acceptPolicy"
                />
                <label htmlFor="acceptPolicy" className="form-check-label ">
                    I accept{" "}
                    <Link to="/privacy" onClick={handleAcceptPolicy} className="privacy-link">
                        Privacy &amp; Terms
                    </Link>
                </label>
            </div>
            <button type="submit" className="submit-btn">Sign Up</button>
            <p className="login-link">
                Already have an account? <Link to="/user/login">Login</Link>
            </p>
        </form>
      </div>
    </div>
  );
};

export default Signup;