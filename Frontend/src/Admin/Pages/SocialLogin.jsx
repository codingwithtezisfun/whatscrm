import React, { useState, useEffect } from "react";
import axios from "axios";
import "../Styles/sociallogin.css"; 
import { FaSave } from "react-icons/fa";

const SocialLogin = () => {
  const [formData, setFormData] = useState({
    googleActive: false,
    googleClientId: "",
    facebookActive: false,
    facebookAppId: "",
    facebookSecret: "",
  });


  useEffect(() => {
    axios
      .get("social.json") 
      .then((res) => {
        setFormData(res.data);
      })
      .catch((err) => console.error("Error fetching social login data:", err));
  }, []);

  // Toggle handler
  const handleToggle = (field) => {
    setFormData((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  // Input change handler
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Save handler (replace '/api/save-social' with my actual endpoint)
  const handleSave = () => {
    axios
      .post("/api/save-social", formData)
      .then(() => {
        alert("Social login settings saved!");
      })
      .catch((err) => {
        console.error("Error saving social login data:", err);
        alert("Failed to save social login settings.");
      });
  };

  return (
    <div className="social-login-container">
      <div className="header-section">
        <h2>Social Login</h2>
        <p>Enable social login for faster login</p>
        <button className="save-btn" onClick={handleSave}>
          <FaSave /> Save
        </button>
      </div>

      {/* Google Login Section */}
      <div className="social-section">
        <div className="section-header">
          <h3>Google login</h3>
          <div
            className={`toggle-switch ${formData.googleActive ? "on" : "off"}`}
            onClick={() => handleToggle("googleActive")}
          >
            <div className="toggle-handle" />
          </div>
        </div>
        <label>ID</label>
        <input
          type="text"
          name="googleClientId"
          value={formData.googleClientId}
          onChange={handleChange}
          placeholder="Enter Google Client ID"
          disabled={!formData.googleActive}
        />
      </div>

      {/* Facebook Login Section */}
      <div className="social-section">
        <div className="section-header">
          <h3>Login with facebook</h3>
          <div
            className={`toggle-switch ${
              formData.facebookActive ? "on" : "off"
            }`}
            onClick={() => handleToggle("facebookActive")}
          >
            <div className="toggle-handle" />
          </div>
        </div>
        <label>App ID</label>
        <input
          type="text"
          name="facebookAppId"
          value={formData.facebookAppId}
          onChange={handleChange}
          placeholder="Enter Facebook App ID"
          disabled={!formData.facebookActive}
        />

        <label>Secret</label>
        <input
          type="text"
          name="facebookSecret"
          value={formData.facebookSecret}
          onChange={handleChange}
          placeholder="Enter Facebook Secret"
          disabled={!formData.facebookActive}
        />
      </div>
    </div>
  );
};

export default SocialLogin;
