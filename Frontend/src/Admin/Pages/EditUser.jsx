import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import BASE_URL from "../../BaseUrl";
import "../Styles/edituser.css";

const EditUser = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = location.state || {}; // Retrieve user details from state

  const [formData, setFormData] = useState({
    uid: user?.uid || "",
    name: user?.name || "",
    email: user?.email || "",
    mobile_with_country_code: user?.mobile_with_country_code || "",
    plan: user?.plan ? JSON.parse(user.plan).id : "",
    newPassword: "",
  });

  const [plans, setPlans] = useState([]);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const token = localStorage.getItem("adminToken"); // Get token from localStorage
      const res = await axios.get(`${BASE_URL}/api/admin/get_plans`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.data.success) {
        setPlans(res.data.data);
      }
    } catch (error) {
      console.error("Error fetching plans:", error);
    }
  };

  const updatePlan = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      const planRes = await axios.post(
        `${BASE_URL}/api/admin/update_plan`,
        { plan: { id: formData.plan }, uid: formData.uid },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!planRes.data.success) {
        Swal.fire("Error!", planRes.data.msg, "error");
        return false;
      }
      return true;
    } catch (error) {
      console.error("Error updating plan:", error);
      Swal.fire("Error!", "Something went wrong updating the plan.", "error");
      return false;
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("adminToken");
      const res = await axios.post(`${BASE_URL}/api/admin/update_user`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.data.success) {
        // Update Plan After User Update
        const planUpdated = await updatePlan();
        if (planUpdated) {
          Swal.fire("Success!", "User and Plan updated successfully!", "success");
          navigate("/admin/dashboard/user-management");
        }
      } else {
        Swal.fire("Error!", res.data.msg, "error");
      }
    } catch (error) {
      Swal.fire("Error!", "Something went wrong.", "error");
    }
  };

  return (
    <div className="edit-user-container">
      <h2>Edit User</h2>
      <form onSubmit={handleSubmit} className="edit-user-form">
        <input type="hidden" name="uid" value={formData.uid} />
        <div className="form-group-container">
          <div className="form-group">
            <label>Name:</label>
            <input type="text" name="name" value={formData.name} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label>Email:</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label>Mobile:</label>
            <input type="text" name="mobile_with_country_code" value={formData.mobile_with_country_code} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label>New Password (Optional):</label>
            <input type="password" name="newPassword" value={formData.newPassword} onChange={handleChange} />
          </div>
        </div>

        <h3>Select Plan:</h3>
        <div className="plans-container">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`plan-card ${formData.plan === plan.id ? "selected" : ""}`}
              onClick={() => setFormData({ ...formData, plan: plan.id })}
            >
              <h4>{plan.title}</h4>
              <p>{plan.short_description}</p>
              <span>Duration: {plan.plan_duration_in_days} days</span>
            </div>
          ))}
        </div>

        <button type="submit" className="submit-btn mt-3">Update User</button>
      </form>
    </div>
  );
};

export default EditUser;
