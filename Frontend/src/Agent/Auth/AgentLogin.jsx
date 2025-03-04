import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import BASE_URL from "../../BaseUrl";

const AgentLogin = () => {
  const [agents, setAgents] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    mobile: '',
    comments: ''
  });

  const fetchAgents = async () => {
    try {
      const token = localStorage.getItem("userToken");
      const response = await axios.get(`${BASE_URL}/api/agent/get_my_agents`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        // If you want to fetch the number of assigned chats, you can do so here
        // e.g. you could map each agent to { ...agent, chats: <count> } if your backend returns it
        setAgents(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching agents", error);
    }
  };

  useEffect(() => {
    fetchAgents();
  }, []);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleAddAgent = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("userToken");
    try {
      const response = await axios.post(`${BASE_URL}/api/agent/add_agent`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        Swal.fire("Success", response.data.msg, "success");
        setShowModal(false);
        setFormData({ name: '', email: '', password: '', mobile: '', comments: '' });
        fetchAgents();
      } else {
        Swal.fire("Error", response.data.msg || "Failed to add agent", "error");
      }
    } catch (error) {
      console.error("Error adding agent", error);
      Swal.fire("Error", error.message || "Something went wrong", "error");
    }
  };

  const handleDeleteAgent = async (agentUid) => {
    const confirmResult = await Swal.fire({
      title: 'Are you sure?',
      text: "This action cannot be undone!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!'
    });
    if (confirmResult.isConfirmed) {
      const token = localStorage.getItem("userToken");
      try {
        const response = await axios.post('/api/agent/del_agent', { uid: agentUid }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (response.data.success) {
          Swal.fire("Deleted!", response.data.msg, "success");
          fetchAgents();
        } else {
          Swal.fire("Error", response.data.msg || "Failed to delete agent", "error");
        }
      } catch (error) {
        console.error("Error deleting agent", error);
        Swal.fire("Error", error.message || "Something went wrong", "error");
      }
    }
  };

  const handleAutoLogin = async (agentUid) => {
    const token = localStorage.getItem("userToken");
    try {
      const response = await axios.post(`${BASE_URL}/api/user/auto_agent_login`, { uid: agentUid }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        Swal.fire("Auto Login Successful", "Agent auto logged in", "success");
        localStorage.setItem('agentToken', response.data.token);
        window.location.href = "/agent/dashboard";
      } else {
        Swal.fire("Error", response.data.msg || "Auto login failed", "error");
      }
    } catch (error) {
      console.error("Error in auto agent login", error);
      Swal.fire("Error", error.message || "Something went wrong", "error");
    }
  };

  return (
    <div className="agent-login-container">
      <h2>Agents</h2>
      <p>Add or remove an agent account. An agent is someone to whom you can assign chats.</p>
      <button className="add-agent-btn" onClick={() => setShowModal(true)}>
        + Add Agent
      </button>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Add New Agent</h3>
            <form onSubmit={handleAddAgent}>
              <div className="form-group">
                <label>Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Password</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Mobile</label>
                <input
                  type="text"
                  name="mobile"
                  value={formData.mobile}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Comments</label>
                <input
                  type="text"
                  name="comments"
                  value={formData.comments}
                  onChange={handleInputChange}
                />
              </div>
              <div className="modal-actions">
                <button type="submit" className="add-agent-btn">Add Agent</button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowModal(false)}
                >
                  Close
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="agents-table-container">
        <table className="agents-table">
          <thead>
            <tr>
              <th>Auto-Login</th>
              <th>Name</th>
              <th>Email</th>
              <th>Mobile</th>
              <th>Comments</th>
              <th>Is Active?</th>
              <th>Chats</th>
              <th>Delete</th>
            </tr>
          </thead>
          <tbody>
            {agents.map((agent) => (
              <tr key={agent.uid}>
                <td>
                  <button
                    className="btn btn-warning btn-sm"
                    onClick={() => handleAutoLogin(agent.uid)}
                  >
                    Auto Login
                  </button>
                </td>
                <td>{agent.name}</td>
                <td>{agent.email}</td>
                <td>{agent.mobile}</td>
                <td>{agent.comments || "N/A"}</td>
                <td>{agent.is_active === 1 ? "Yes" : "No"}</td>
                <td>
                  {
                    // If your backend returns a 'chats' count, you can display it here
                    agent.chats ? agent.chats : "0"
                  }
                </td>
                <td>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => handleDeleteAgent(agent.uid)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {agents.length === 0 && (
              <tr>
                <td colSpan="8">No agents found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AgentLogin;
