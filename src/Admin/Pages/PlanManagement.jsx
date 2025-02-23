import React, { useState, useEffect } from "react";
import axios from "axios";
import BASE_URL from "../../BaseUrl"; 
import { FaPlus, FaTrash,FaListUl } from "react-icons/fa";
import "../Styles/planmanagement.css";

const PlanManagement = () => {
  const [plans, setPlans] = useState([]);
  const [view, setView] = useState("list"); 
  const [token, setToken] = useState("");

    // Fetch Token Once on Mount
    useEffect(() => {
      const storedToken = localStorage.getItem("adminToken");
      if (!storedToken) {
        window.location.href = "/admin/login"; 
      } else {
        setToken(storedToken);
        fetchPlans(storedToken); 
      }
    }, []);
  

  // ADD PLAN FORM DATA
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

  // DELETE PLAN FORM DATA
  const [deletePlanId, setDeletePlanId] = useState("");

  // Fetch existing plans on mount
  useEffect(() => {
    fetchPlans();
  }, []);

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

  // Handle toggle for boolean fields (ON/OFF)
  const handleToggle = (field) => {
    setAddForm((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  // Handle text fields
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
        alert("Plan has been created sucessfully!");
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
        // Return to list view
        setView("list");
      } else {
        alert(res.data.msg || "Failed to add plan");
      }
    } catch (error) {
      console.error("Error adding plan:", error);
      alert("Something went wrong while adding plan");
    }
  };

  // Delete Plan Submit
  const handleDeletePlan = async (e) => {
    e.preventDefault();
    if (!deletePlanId) return alert("Please select a plan to delete");
    try {
      const res = await axios.post(
        `${BASE_URL}/api/admin/del_plan`,
        { id: deletePlanId },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (res.data.success) {
        alert("Plan has been deleted!");
        fetchPlans();
        setDeletePlanId("");
        setView("list");
      } else {
        alert(res.data.msg || "Failed to delete plan");
      }
    } catch (error) {
      console.error("Error deleting plan:", error);
      alert("Something went wrong while deleting plan");
    }
  };

  return (
    <div className="__plan-management-container">
      {/* Top Section */}
      <div className="__plan-management-header">
        <h2>Plan Management</h2>
        <div className="__buttons">
          {/* Add Plan Button */}
          <button className="__icon-btn" onClick={() => setView("add")}>
            <FaPlus /> Add Plan
          </button>
          {/* Delete Plan Button */}
          <button className="__icon-btn" onClick={() => setView("delete")}>
            <FaTrash /> Delete Plan
          </button>
          {/* All Plan Button */}
          <button className="__icon-btn" onClick={() => setView("list")}>
            <FaListUl /> All Plans
          </button>
        </div>
      </div>

      {/* By default, show the plan list */}
      {view === "list" && (
        <div className="__plan-list">
          <h3>Available Plans</h3>
          {plans.length === 0 ? (
            <p>No plans found.</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Trial?</th>
                  <th>Price</th>
                  <th>Duration (days)</th>
                </tr>
              </thead>
              <tbody>
                {plans.map((plan) => (
                  <tr key={plan.id}>
                    <td>{plan.title}</td>
                    <td>{plan.is_trial ? "Yes" : "No"}</td>
                    <td>{plan.price}</td>
                    <td>{plan.plan_duration_in_days}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Add Plan Form */}
      {view === "add" && (
        <div className="__form-container">
          <h3>Add Plan</h3>
          <form onSubmit={handleAddPlan}>
            <div className="__group-container">
            <div className="__form-group">
              <label>Title</label>
              <input
                name="title"
                value={addForm.title}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="__form-group">
              <label>Contact Limit</label>
              <input
                type="number"
                name="contact_limit"
                value={addForm.contact_limit}
                onChange={handleChange}
              />
            </div>
            <div className="__form-group">
              <label>Price</label>
              <input
                type="number"
                name="price"
                value={addForm.price}
                onChange={handleChange}
              />
            </div>
            <div className="__form-group">
              <label>Price Strike</label>
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
              <label>Short Description</label>
               <textarea
                    name="description"
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
                className={addForm.allow_tag ? "__toggle-btn on" : "__toggle-btn off"}
                onClick={() => handleToggle("allow_tag")}
              >
                {addForm.allow_tag ? "Yes" : "No"}
              </button>
            </div>
            <div className="__toggle-group">
              <label>Allow add chat note</label>
              <button
                type="button"
                className={addForm.allow_note ? "__toggle-btn on" : "__toggle-btn off"}
                onClick={() => handleToggle("allow_note")}
              >
                {addForm.allow_note ? "Yes" : "No"}
              </button>
            </div>
            <div className="__toggle-group">
              <label>Allow wa Chatbot</label>
              <button
                type="button"
                className={addForm.allow_chatbot ? "__toggle-btn on" : "__toggle-btn off"}
                onClick={() => handleToggle("allow_chatbot")}
              >
                {addForm.allow_chatbot ? "Yes" : "No"}
              </button>
            </div>
            <div className="__toggle-group">
              <label>Allow Cloud API</label>
              <button
                type="button"
                className={addForm.allow_api ? "__toggle-btn on" : "__toggle-btn off"}
                onClick={() => handleToggle("allow_api")}
              >
                {addForm.allow_api ? "Yes" : "No"}
              </button>
            </div>
            <div className="__toggle-group">
              <label>Is this a trial plan?</label>
              <button
                type="button"
                className={addForm.is_trial ? "__toggle-btn on" : "__toggle-btn off"}
                onClick={() => handleToggle("is_trial")}
              >
                {addForm.is_trial ? "Yes" : "No"}
              </button>
            </div>
            </div>

            <div className="__form-actions">
              <button type="submit" className="__submit-btn">Save Plan</button>
              <button type="button" className="__cancel-btn mx-5" onClick={() => setView("list")}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Delete Plan Form */}
      {view === "delete" && (
        <div className="__form-container">
          <h3>Delete Plan</h3>
          <form onSubmit={handleDeletePlan}>
            <div className="__form-group">
              <label>Select Plan to Delete</label>
              <select
                value={deletePlanId}
                onChange={(e) => setDeletePlanId(e.target.value)}
                required
              >
                <option value="">-- Select Plan --</option>
                {plans.map((plan) => (
                  <option key={plan.id} value={plan.id}>
                    {plan.title} (ID: {plan.id})
                  </option>
                ))}
              </select>
            </div>
            <div className="form-actions">
              <button type="submit" className="__delete-btn">Delete</button>
              <button type="button" className="__cancel-btn mx-5" onClick={() => setView("list")}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default PlanManagement;
