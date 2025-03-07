import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import BASE_URL from "../../BaseUrl";
import "../Styles/assignTask.css"; // Ensure you create this CSS file

const AssignTask = () => {
  const [agents, setAgents] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    agent_uid: "",
  });
  const token = localStorage.getItem("userToken");

  // Fetch all agents when component mounts
  useEffect(() => {
    fetchAgents();
    fetchAgentTasks();
  }, []);

  // Fetch Agents
  const fetchAgents = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/agent/get_my_agents`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.success) setAgents(res.data.data);
    } catch (error) {
      Swal.fire({ icon: "error", title: "Error", text: "Failed to load agents" });
    }
  };

  // Fetch Agent Tasks
  const fetchAgentTasks = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/user/get_my_agent_tasks`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.success) {
        setTasks(res.data.data);
      } else {
        Swal.fire({ icon: "error", title: "Error", text: "Failed to load tasks" });
      }
    } catch (error) {
      Swal.fire({ icon: "error", title: "Error", text: "Failed to fetch tasks" });
    }
  };

  // Handle form input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Assign a Task to an Agent
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.description || !formData.agent_uid) {
      Swal.fire({ icon: "error", title: "Error", text: "All fields are required!" });
      return;
    }
    try {
      const res = await axios.post(
        `${BASE_URL}/api/user/add_task_for_agent`,
        { title: formData.title, des: formData.description, agent_uid: formData.agent_uid },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        Swal.fire("Success", "Task assigned successfully", "success");
        setFormData({ title: "", description: "", agent_uid: "" });
        fetchAgentTasks(); // Refresh task list
      } else {
        Swal.fire("Error", res.data.msg, "error");
      }
    } catch (error) {
      Swal.fire("Error", "Could not assign task", "error");
    }
  };

  // Delete Task
  const handleDeleteTask = async (taskId) => {
    Swal.fire({
      title: "Are you sure?",
      text: "This task will be permanently deleted.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await axios.post(
            `${BASE_URL}/api/user/del_task_for_agent`,
            { id: taskId },
            { headers: { Authorization: `Bearer ${token}` } }
          );
          if (res.data.success) {
            Swal.fire("Deleted!", "Task was removed successfully.", "success");
            fetchAgentTasks(); // Refresh task list
          } else {
            Swal.fire("Error", res.data.msg, "error");
          }
        } catch (error) {
          Swal.fire("Error", "Failed to delete task", "error");
        }
      }
    });
  };

  return (
    <div className="container assign-task-container mt-4">
      <h2>Assign Task to Agent</h2>
      <form onSubmit={handleSubmit} className="assign-task-form">
        <div className="form-group mb-3">
          <label htmlFor="title" className="form-label">Task Title</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="form-control"
            placeholder="Enter task title"
            required
          />
        </div>
        <div className="form-group mb-3">
          <label htmlFor="description" className="form-label">Task Description</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="form-control"
            placeholder="Enter task description"
            required
          />
        </div>
        <div className="form-group mb-3">
          <label htmlFor="agent_uid" className="form-label">Assign to Agent</label>
          <select
            id="agent_uid"
            name="agent_uid"
            value={formData.agent_uid}
            onChange={handleChange}
            className="form-select"
            required
          >
            <option value="">Select an agent</option>
            {agents.length > 0 ? (
              agents.map((agent) => (
                <option key={agent.uid} value={agent.uid}>
                  {agent.name} ({agent.email})
                </option>
              ))
            ) : (
              <option value="">No agents found</option>
            )}
          </select>
        </div>
        <button type="submit" className="btn btn-primary">Assign Task</button>
      </form>

      {/* Tasks Table */}
      <h3 className="mt-4">Assigned Tasks</h3>
      <table className="table table-bordered mt-3">
        <thead>
          <tr>
            <th>Agent Email</th>
            <th>Title</th>
            <th>Description</th>
            <th>Status</th>
            <th>Agent Comments</th>
            <th>Added On</th>
            <th>Delete</th>
          </tr>
        </thead>
        <tbody>
          {tasks.length > 0 ? (
            tasks.map((task) => (
              <tr key={task.id}>
                <td>{task.agent_email}</td>
                <td>{task.title}</td>
                <td>{task.description}</td>
                <td>{task.status}</td>
                <td>{task.agent_comments || "No comments"}</td>
                <td>{new Date(task.createdAt).toLocaleString()}</td>
                <td>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => handleDeleteTask(task.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="8" className="text-center">No tasks assigned yet.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default AssignTask;
