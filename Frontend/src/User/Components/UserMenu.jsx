import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import TimezoneSelect from "react-timezone-select";
import { FaUserCircle, FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import BASE_URL from "../../BaseUrl";
import "../Styles/usermenu.css";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";

export default function UserMenu() {
  const token = localStorage.getItem("userToken");
  const navigate = useNavigate();

  // Dropdown state
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Which modal is open: "meta", "profile", or "subscription"
  const [openModal, setOpenModal] = useState(null);

  // Entire user object from DB
  const [user, setUser] = useState({});
  const [password, setPassword] = useState("");

  // Profile fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [timezone, setTimezone] = useState("Asia/Kolkata");

  // Meta API Keys fields
  const [webhookUri, setWebhookUri] = useState("https://localhost:3010/api/inbound");
  const [wabaId, setWabaId] = useState("");
  const [businessAccountId, setBusinessAccountId] = useState("");
  const [accessToken, setAccessToken] = useState("");
  const [permanentToken, setPermanentToken] = useState("");
  const [businessPhoneNumberId, setBusinessPhoneNumberId] = useState("");
  const [appId, setAppId] = useState("");

  // Plan object from user.plan, plus computed remaining days
  const [plan, setPlan] = useState(null);
  const [remainingDays, setRemainingDays] = useState(0);

  useEffect(() => {
    fetchUser();
    fetchMetaKeys();
  }, []);

  // -------------------------------
  //  Fetch user (including plan JSON)
  // -------------------------------
  const fetchUser = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/user/get_me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.success && res.data.data) {
        const userData = res.data.data;
        setUser(userData);

        // Populate profile fields
        setName(userData.name || "");
        setEmail(userData.email || "");
        setMobile(userData.mobile_with_country_code || "");
        setTimezone(userData.timezone || "Asia/Kolkata");
      }
    } catch (err) {
      console.error("Error fetching user info:", err);
    }
  };

  // -------------------------------
  //  Fetch Meta Keys
  // -------------------------------
  const fetchMetaKeys = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/user/get_meta_keys`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.success && res.data.data) {
        const meta = res.data.data;
        setWabaId(meta.waba_id || "");
        setBusinessAccountId(meta.business_account_id || "");
        setAccessToken(meta.access_token || "");
        setBusinessPhoneNumberId(meta.business_phone_number_id || "");
        setAppId(meta.app_id || "");
        // permanentToken and webhookUri are not stored in DB, keep them local
      }
    } catch (err) {
      console.error("Error fetching meta keys:", err);
    }
  };

// -------------------------------
//  Save Profile
// -------------------------------
const saveProfile = async () => {
  try {
    const payload = {
      newPassword: password || "",
      name,
      mobile_with_country_code: mobile,
      email,
      timezone,
    };
    const res = await axios.post(`${BASE_URL}/api/user/update_profile`, payload, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (res.data.success) {
      Swal.fire({
        icon: "success",
        title: "Profile Updated",
        text: res.data.msg,
      });
      closeModal();
    } else {
      Swal.fire({
        icon: "warning",
        title: "Update Failed",
        text: res.data.msg,
      });
    }
  } catch (err) {
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "Something went wrong while updating the profile.",
    });
    console.error("Error saving profile:", err);
  }
};

// -------------------------------
//  Save Meta Keys
// -------------------------------
const saveMetaKeys = async () => {
  try {
    const payload = {
      waba_id: wabaId,
      business_account_id: businessAccountId,
      access_token: accessToken,
      business_phone_number_id: businessPhoneNumberId,
      app_id: appId,
    };
    const res = await axios.post(`${BASE_URL}/api/user/update_meta`, payload, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (res.data.success) {
      Swal.fire({
        icon: "success",
        title: "Meta Keys Updated",
        text: res.data.msg,
      });
      closeModal();
    } else {
      Swal.fire({
        icon: "warning",
        title: "Update Failed",
        text: res.data.msg,
      });
    }
  } catch (err) {
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "Something went wrong while updating meta keys.",
    });
    console.error("Error saving meta keys:", err);
  }
};


  // -------------------------------
  //  Show Subscription
  //  Parse user.plan JSON, compute remaining days
  // -------------------------------
  const handleSubscription = () => {
    if (!user.plan) {
      // No plan in user table
      setPlan(null);
      setRemainingDays(0);
    } else {
      let planObj = null;
      try {
        planObj = JSON.parse(user.plan);
      } catch (err) {
        console.error("Error parsing user.plan JSON:", err);
      }
      if (planObj) {
        setPlan(planObj);

        // Calculate how many days have passed since user created account
        const userCreatedAt = new Date(user.createdAt); // from DB
        const now = new Date();
        const diffInMs = now - userCreatedAt;
        const usedDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

        const planDuration = parseInt(planObj.plan_duration_in_days || "0", 10);
        const remain = planDuration - usedDays;
        setRemainingDays(remain < 0 ? 0 : remain);
      }
    }
    setOpenModal("subscription");
    setDropdownOpen(false);
  };

  // Toggle user dropdown
  const handleToggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  // Close modals
  const closeModal = () => {
    setOpenModal(null);
  };

  // Logout => remove token
  const handleLogout = () => {
    localStorage.removeItem("userToken");
    navigate("/user/login");
  };

  // Helper to render check or cross
  const renderCheck = (boolVal) => {
    return boolVal
      ? <FaCheckCircle className="text-success me-2" />
      : <FaTimesCircle className="text-danger me-2" />;
  };

  return (
    <div className="position-relative d-inline-block usermenu-container">
      {/* User Icon */}
      <button
        className="btn btn-light d-flex align-items-center"
        onClick={handleToggleDropdown}
      >
        <FaUserCircle size={24} />
      </button>

      {/* Dropdown Menu */}
      {dropdownOpen && (
        <div className="dropdown-menu show end-0 mt-2 custom-dropdown-menu">
          <button
            className="dropdown-item"
            onClick={() => {
              setOpenModal("meta");
              setDropdownOpen(false);
            }}
          >
            Meta API keys
          </button>
          <button
            className="dropdown-item"
            onClick={() => {
              setOpenModal("profile");
              setDropdownOpen(false);
            }}
          >
            Profile
          </button>
          <button className="dropdown-item" onClick={handleSubscription}>
            Subscription
          </button>
          <div className="dropdown-divider"></div>
          <button
            className="dropdown-item text-danger"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      )}

      {/* -----------------------------
          META API KEYS MODAL
      ----------------------------- */}
      {openModal === "meta" && (
        <>
          <div className="modal-backdrop fade show"></div>
          <div className="modal fade show" style={{ display: "block" }} role="dialog">
            <div className="modal-dialog modal-dialog-centered d-flex align-items-center justify-content-center" role="document">
              <div className="modal-content custom-modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Meta API keys</h5>
                  <button type="button" className="btn-close" onClick={closeModal}>
                    <span>&times;</span>
                  </button>
                </div>
                <div className="modal-body">
                  {/* 2-column grid */}
                  <div className="two-column-grid">
                    {/* Webhook URI */}
                    <div className="mb-3 input-cons">
                      <label className="form-label">Your webhook URI</label>
                      <input
                        type="text"
                        className="form-control"
                        value={webhookUri}
                        onChange={(e) => setWebhookUri(e.target.value)}
                      />
                    </div>

                    <div className="mb-3 input-cons">
                      <label className="form-label">WhatsApp account ID</label>
                      <input
                        type="text"
                        className="form-control"
                        value={wabaId}
                        onChange={(e) => setWabaId(e.target.value)}
                      />
                    </div>

                    <div className="mb-3 input-cons">
                      <label className="form-label">Business account ID</label>
                      <input
                        type="text"
                        className="form-control"
                        value={businessAccountId}
                        onChange={(e) => setBusinessAccountId(e.target.value)}
                      />
                    </div>

                    <div className="mb-3 input-cons">
                      <label className="form-label">Metaccess Token</label>
                      <input
                        type="text"
                        className="form-control"
                        value={accessToken}
                        onChange={(e) => setAccessToken(e.target.value)}
                      />
                    </div>

                    <div className="mb-3 input-cons">
                      <label className="form-label">Permanent token recommended</label>
                      <input
                        type="text"
                        className="form-control"
                        value={permanentToken}
                        onChange={(e) => setPermanentToken(e.target.value)}
                      />
                    </div>

                    <div className="mb-3 input-cons">
                      <label className="form-label">WhatsApp phone ID</label>
                      <input
                        type="text"
                        className="form-control"
                        value={businessPhoneNumberId}
                        onChange={(e) => setBusinessPhoneNumberId(e.target.value)}
                      />
                    </div>

                    <div className="mb-3 input-cons">
                      <label className="form-label">App ID</label>
                      <input
                        type="text"
                        className="form-control"
                        value={appId}
                        onChange={(e) => setAppId(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
                <div className="modal-footer d-flex justify-content-between">
                  <button className="btn btn-success w-100" onClick={saveMetaKeys}>
                    Save
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* -----------------------------
          PROFILE MODAL
      ----------------------------- */}
      {openModal === "profile" && (
        <>
          <div className="modal-backdrop fade show"></div>
          <div className="modal fade show" style={{ display: "block" }} role="dialog">
            <div className="modal-dialog modal-dialog-centered d-flex align-items-center justify-content-center" role="document">
              <div className="modal-content custom-modal-content ">
                <div className="modal-header">
                  <h5 className="modal-title">Profile</h5>
                  <button type="button" className="btn-close" onClick={closeModal}>
                    <span>&times;</span>
                  </button>
                </div>
                <div className="modal-body">
                  {/* 2-column grid */}
                  <div className="two-column-grid">
                    {/* Name */}
                    <div className="mb-3 input-cons">
                      <label className="form-label">Name</label>
                      <input
                        type="text"
                        className="form-control"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                      />
                    </div>
                    {/* Email */}
                    <div className="mb-3 input-cons">
                      <label className="form-label">Email</label>
                      <input
                        type="email"
                        className="form-control"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                    {/* Mobile */}
                    <div className="mb-3 input-cons">
                      <label className="form-label">Your mobile number</label>
                      <input
                        type="text"
                        className="form-control"
                        value={mobile}
                        onChange={(e) => setMobile(e.target.value)}
                      />
                    </div>
                    {/* Password */}
                    <div className="mb-3 input-cons">
                      <label className="form-label">Password</label>
                      <input
                        type="password"
                        className="form-control"
                        placeholder="Ignore if you do not want to change the password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                    </div>
                    {/* Timezone */}
                    <div className="mb-3 input-con-timezone">
                      <label className="form-label">Select your timezone</label>
                      <TimezoneSelect
                        value={timezone}
                        onChange={(tz) => setTimezone(tz.value)}
                        className="form-control timezone-select"
                      />
                    </div>
                    
                  </div>
                </div>
                <div className="modal-footer d-flex justify-content-between">
                  <button className="btn btn-success w-100" onClick={saveProfile}>
                    Save
                  </button>
                  <Link to="/plans" className="btn btn-primary w-100">Check Plans</Link>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* -----------------------------
          SUBSCRIPTION MODAL
      ----------------------------- */}
      {openModal === "subscription" && (
        <>
          <div className="modal-backdrop fade show"></div>
          <div className="modal fade show" style={{ display: "block" }} role="dialog">
            <div className="modal-dialog modal-dialog-centered d-flex align-items-center justify-content-center" role="document">
              <div className="modal-content custom-modal-content ">
                <div className="modal-header">
                  <h5 className="modal-title">Subscription</h5>
                  <button type="button" className="btn-close" onClick={closeModal}>
                    <span>&times;</span>
                  </button>
                </div>
                <div className="modal-body">
                  {plan ? (
                    <>
                      <p className="fw-bold mb-3">
                        You have subscribed to <span className="text-success">{plan.title} plan</span>
                      </p>
                      <ul className="list-unstyled">
                        <li className="mb-2">
                          {renderCheck(plan.allow_tag)}Chat tags
                        </li>
                        <li className="mb-2">
                          {renderCheck(plan.allow_note)}Chat notes
                        </li>
                        <li className="mb-2">
                          {renderCheck(plan.allow_chatbot)}Auto chatbot
                        </li>
                        <li className="mb-2">
                          {renderCheck(plan.allow_api)}API access
                        </li>
                        <li className="mb-2">
                          <FaCheckCircle className="text-success me-2" />
                          Phonebook contacts limit {user.contact || 0}/{plan.contact_limit}
                        </li>
                        <li className="mb-2">
                          <FaCheckCircle className="text-success me-2" />
                          Plan duration {plan.plan_duration_in_days} days
                        </li>
                        <li className="mb-2">
                          <FaCheckCircle className="text-success me-2" />
                          Plan expiring in <span className="text-danger">{remainingDays} days</span>
                        </li>
                      </ul>
                    </>
                  ) : (
                    <p>You do not have an active subscription.</p>
                  )}
                </div>
                <div className="modal-footer d-flex justify-content-center">
                  <Link to="/plans" className="btn btn-primary w-100">Check Plans</Link>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
