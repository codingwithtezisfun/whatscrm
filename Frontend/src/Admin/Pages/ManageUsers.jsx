import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { FaSignInAlt, FaTrash, FaEdit } from "react-icons/fa";
import BASE_URL from "../../BaseUrl";
import Swal from "sweetalert2";
import "../Styles/manageuser.css";

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const navigate = useNavigate();
  // Get the admin token once from localStorage
  const token = localStorage.getItem("adminToken");

  useEffect(() => {
    fetchUsers();
  }, []);

  // Fetch users; backend returns data in "data" property
  const fetchUsers = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/admin/get_users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.success) {
        // Ensure we set users as an array from res.data.data
        setUsers(res.data.data || []);
      } else {
        console.error("Failed to fetch users:", res.data.msg);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  // Delete user (or plan) logic (adjust endpoint as needed)
  const handleDelete = async (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "This action cannot be undone!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.post(
            `${BASE_URL}/api/admin/del_plan`,
            { id },
            { headers: { Authorization: `Bearer ${token}` } }
          );
          Swal.fire("Deleted!", "User has been deleted.", "success");
          fetchUsers();
        } catch (error) {
          Swal.fire("Error!", "Something went wrong.", "error");
        }
      }
    });
  };

  // Auto-login: using the user's UID and skipping the password check.
  const handleAutoLogin = async (uid) => {
    try {
      const res = await axios.post(
        `${BASE_URL}/api/auto_agent_login`,
        { uid },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        localStorage.setItem("userToken", res.data.token);
        navigate("/user/dashboard");
      } else {
        Swal.fire("Error!", res.data.msg || "Auto login failed", "error");
      }
    } catch (error) {
      Swal.fire("Error!", "Something went wrong.", "error");
    }
  };

  return (
    <div className="manage-users-container">
      <h2>Manage Users</h2>
      <table className="manage-users-table">
        <thead>
          <tr>
            <th>Auto Login</th>
            <th>Name</th>
            <th>Email</th>
            <th>Mobile</th>
            <th>Plan</th>
            <th>Plan Expire</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {Array.isArray(users) && users.length > 0 ? (
            users.map((user) => (
              <tr key={user.id}>
                <td style={{ textAlign: "center" }}>
                  <FaSignInAlt
                    style={{ cursor: "pointer", color: "gray" }}
                    onClick={() => handleAutoLogin(user.uid)}
                  />
                </td>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>{user.mobile_with_country_code}</td>
                <td>{user.plan ? JSON.parse(user.plan).title : "No Plan"}</td>
                <td>{user.plan_expire && !isNaN(new Date(user.plan_expire).getTime()) ? new Date(user.plan_expire).toISOString().split("T")[0] : "N/A"}</td>
                <td style={{ textAlign: "center" }}>
                <Link
                to={{
                    pathname: `/admin/dashboard/update-user`,
                }}
                state={{ user }}
                >
                <FaEdit style={{ color: "blue", marginRight: "10px" }} />
                </Link>

                  <FaTrash
                    style={{ cursor: "pointer", color: "red" }}
                    onClick={() => handleDelete(user.id)}
                  />
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5" style={{ textAlign: "center" }}>
                No users found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ManageUsers;
