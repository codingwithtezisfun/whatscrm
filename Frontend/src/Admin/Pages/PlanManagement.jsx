import React, { useState, useEffect } from "react";
import axios from "axios";
import BASE_URL from "../../BaseUrl";
import { FaPlus, FaListUl, FaCheck, FaTimes } from "react-icons/fa";
import "../Styles/planmanagement.css";
import Swal from "sweetalert2";

import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const PlanManagement = () => {
  const [plans, setPlans] = useState([]);
  const [token, setToken] = useState("");

  const [showAddModal, setShowAddModal] = useState(false);

  const [addForm, setAddForm] = useState({
    title: "",
    short_description: "",
    allow_tag: false,
    allow_note: false,
    allow_chatbot: false,
    allow_api: false,
    is_trial: false,
    contact_limit: "",
    price: "",
    price_strike: "",
    plan_duration_in_days: "",
  });

  useEffect(() => {
    const storedToken = localStorage.getItem("adminToken");
    if (!storedToken) {
      window.location.href = "/admin/login";
    } else {
      setToken(storedToken);
      fetchPlans();
    }

  }, []);

  // Fetch existing plans
  const fetchPlans = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/admin/get_plans`);
      if (res.data.success) {
        setPlans(res.data.data);
      }
    } catch (err) {
      console.error("Error fetching plans:", err);
    }
  };


  const handleToggle = (field) => {
    setAddForm((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const handleChange = (e) => {
    setAddForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  // Add Plan Submit
  const handleAddPlan = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        `${BASE_URL}/api/admin/add_plan`,
        {
          title: addForm.title,
          short_description: addForm.short_description,
          allow_tag: addForm.allow_tag,
          allow_note: addForm.allow_note,
          allow_chatbot: addForm.allow_chatbot,
          allow_api: addForm.allow_api,
          is_trial: addForm.is_trial,
          contact_limit: addForm.contact_limit,
          price: addForm.price,
          price_strike: addForm.price_strike,
          plan_duration_in_days: addForm.plan_duration_in_days,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (res.data.success) {
        Swal.fire({
          icon: "success",
          title: "Plan Created",
          text: "Plan has been created successfully!",
          timer: 2000,
          showConfirmButton: false,
        });
        // Refresh plans
        fetchPlans();
        // Reset form
        setAddForm({
          title: "",
          short_description: "",
          allow_tag: false,
          allow_note: false,
          allow_chatbot: false,
          allow_api: false,
          is_trial: false,
          contact_limit: "",
          price: "",
          price_strike: "",
          plan_duration_in_days: "",
        });
        setShowAddModal(false);
      } else {
        Swal.fire({
          icon: "error",
          title: "Failed to add plan",
          text: res.data.msg || "Failed to add plan",
        });
      }
    } catch (error) {
      console.error("Error adding plan:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Something went wrong while adding plan",
      });
    }
  };

  // Delete a plan
  const handleDeletePlanById = async (id) => {
    try {
      const res = await axios.post(
        `${BASE_URL}/api/admin/del_plan`,
        { id },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (res.data.success) {
        Swal.fire({
          icon: "success",
          title: "Plan Deleted",
          text: "Plan has been deleted!",
          timer: 2000,
          showConfirmButton: false,
        });
        fetchPlans();
      } else {
        Swal.fire({
          icon: "error",
          title: "Deletion Failed",
          text: res.data.msg || "Failed to delete plan",
        });
      }
    } catch (error) {
      console.error("Error deleting plan:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Something went wrong while deleting plan",
      });
    }
  };

  // Slick slider settings
  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 3,   
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    responsive: [
      {
        breakpoint: 1024, 
        settings: {
          slidesToShow: 2,
        },
      },
      {
        breakpoint: 600, 
        settings: {
          slidesToShow: 1,
        },
      },
    ],
  };

  return (
    <div className="__plan-management-container">
      {/* Header Section */}
      <div className="__plan-management-header">
        <h2>Plan Management</h2>
        <div className="__buttons">
          <button className="__icon-btn" onClick={() => setShowAddModal(true)}>
            <FaPlus /> Add Plan
          </button>
          {/* <button className="__icon-btn">
            <FaListUl /> All Plans
          </button> */}
        </div>
      </div>

      {/* Plan Slider */}
      <div className="__plan-list">
        {plans.length === 0 ? (
          <p>No plans found.</p>
        ) : (
          <div className="plan-slider">
            <Slider {...sliderSettings}>
              {plans.map((plan) => (
                <div className="plan-card" key={plan.id}>
                  <h3>{plan.title}</h3>
                  <p className="plan-desc">{plan.short_description}</p>

                  {/* Price section */}
                  <div className="plan-price">
                    {plan.price_strike && (
                      <span className="strike">
                        ${plan.price_strike}
                      </span>
                    )}
                    <span className="current-price">${plan.price}</span>
                    <span className="plan-duration">
                      / {plan.plan_duration_in_days} days
                    </span>
                  </div>

                  {/* Feature list  */}
                  <ul className="plan-features">
                    <li>
                      {plan.allow_tag ? <FaCheck /> : <FaTimes />} Chat tags
                    </li>
                    <li>
                      {plan.allow_note ? <FaCheck /> : <FaTimes />} Chat note
                    </li>
                    <li>
                      {plan.allow_chatbot ? <FaCheck /> : <FaTimes />} Auto chat
                    </li>
                    <li>
                      {plan.allow_api ? <FaCheck /> : <FaTimes />} Cloud API
                    </li>
                  </ul>

                  <button
                    className="delete-plan-btn"
                    onClick={() => handleDeletePlanById(plan.id)}
                  >
                    Delete plan
                  </button>
                </div>
              ))}
            </Slider>
          </div>
        )}
      </div>

      {/* Add Plan Modal */}
      {showAddModal && (
        <div className="modal-overlay _modal-overlay">
          <div className="modal-content _modal-content">
            <h3>Add Plan</h3>
            <form onSubmit={handleAddPlan}>
              <div className="__group-container">
                <div className="__form-group">
                  <label>Plan Title</label>
                  <input
                    name="title"
                    value={addForm.title}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="__form-group">
                  <label>Phonebook Contacts Limit</label>
                  <input
                    type="number"
                    name="contact_limit"
                    value={addForm.contact_limit}
                    onChange={handleChange}
                  />
                </div>
                <div className="__form-group">
                  <label>Plan Price</label>
                  <input
                    type="number"
                    name="price"
                    value={addForm.price}
                    onChange={handleChange}
                  />
                </div>
                <div className="__form-group">
                  <label>Price price crossed</label>
                  <input
                    type="number"
                    name="price_strike"
                    value={addForm.price_strike}
                    onChange={handleChange}
                  />
                </div>
                <div className="__form-group">
                  <label>Plan Duration (days)</label>
                  <input
                    type="number"
                    name="plan_duration_in_days"
                    value={addForm.plan_duration_in_days}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="__form-group">
                  <label>Plan Short Description</label>
                  <textarea
                    name="short_description"
                    value={addForm.short_description}
                    onChange={handleChange}
                    required
                    rows="2"
                    placeholder="Enter a detailed description here..."
                  />
                </div>
              </div>

              {/* Toggles for boolean fields */}
              <div className="__group-container">
                <div className="__toggle-group">
                  <label>Allow to add chat tags</label>
                  <button
                    type="button"
                    className={
                      addForm.allow_tag ? "__toggle-btn on" : "__toggle-btn off"
                    }
                    onClick={() => handleToggle("allow_tag")}
                  >
                    {addForm.allow_tag ? "Yes" : "No"}
                  </button>
                </div>
                <div className="__toggle-group">
                  <label>Allow add chat note</label>
                  <button
                    type="button"
                    className={
                      addForm.allow_note
                        ? "__toggle-btn on"
                        : "__toggle-btn off"
                    }
                    onClick={() => handleToggle("allow_note")}
                  >
                    {addForm.allow_note ? "Yes" : "No"}
                  </button>
                </div>
                <div className="__toggle-group">
                  <label>Allow wa Chatbot</label>
                  <button
                    type="button"
                    className={
                      addForm.allow_chatbot
                        ? "__toggle-btn on"
                        : "__toggle-btn off"
                    }
                    onClick={() => handleToggle("allow_chatbot")}
                  >
                    {addForm.allow_chatbot ? "Yes" : "No"}
                  </button>
                </div>
                <div className="__toggle-group">
                  <label>Allow Cloud API</label>
                  <button
                    type="button"
                    className={
                      addForm.allow_api ? "__toggle-btn on" : "__toggle-btn off"
                    }
                    onClick={() => handleToggle("allow_api")}
                  >
                    {addForm.allow_api ? "Yes" : "No"}
                  </button>
                </div>
                <div className="__toggle-group">
                  <label>Is this a trial plan?</label>
                  <button
                    type="button"
                    className={
                      addForm.is_trial ? "__toggle-btn on" : "__toggle-btn off"
                    }
                    onClick={() => handleToggle("is_trial")}
                  >
                    {addForm.is_trial ? "Yes" : "No"}
                  </button>
                </div>
              </div>

              <div className="__form-actions">
                <button type="submit" className="__submit-btn">
                  Save Plan
                </button>
                <button
                  type="button"
                  className="__cancel-btn mx-5"
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlanManagement;
