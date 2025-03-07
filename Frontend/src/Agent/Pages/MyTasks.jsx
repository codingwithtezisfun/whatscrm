import React, { useState, useEffect } from "react";
import axios from "axios";
import BASE_URL from "../../BaseUrl"; // adjust the path as needed
import Swal from "sweetalert2";
import "../Styles/mytasks.css"; // Ensure you create this CSS file

const MyTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const tasksPerPage = 6;
  const token = localStorage.getItem("agentToken");

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/api/agent/get_my_task`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.data.success) {
          setTasks(response.data.data);
        } else {
          Swal.fire({ icon: "error", title: "Error", text: response.data.msg });
        }
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Error fetching tasks",
          text: error.message,
        });
      }
    };
    fetchTasks();
  }, [token]);

  // Mark Task as Completed
  const markTaskAsCompleted = async (taskId) => {
    const { value: comment } = await Swal.fire({
      title: "Complete Task",
      input: "text",
      inputLabel: "Add a comment (required)",
      inputPlaceholder: "Enter your comments...",
      showCancelButton: true,
      inputValidator: (value) => {
        if (!value) return "You must enter a comment!";
      },
    });

    if (comment) {
      try {
        const response = await axios.post(
          `${BASE_URL}/api/agent/mark_task_complete`,
          { id: taskId, comment },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (response.data.success) {
          Swal.fire("Success", "Task marked as completed", "success");
          setTasks((prevTasks) =>
            prevTasks.map((task) =>
              task.id === taskId
                ? { ...task, status: "COMPLETED", agent_comments: comment }
                : task
            )
          );
        } else {
          Swal.fire("Error", response.data.msg, "error");
        }
      } catch (error) {
        Swal.fire("Error", "Could not update task", "error");
      }
    }
  };

  // Pagination logic
  const indexOfLastTask = currentPage * tasksPerPage;
  const indexOfFirstTask = indexOfLastTask - tasksPerPage;
  const currentTasks = tasks.slice(indexOfFirstTask, indexOfLastTask);
  const totalPages = Math.ceil(tasks.length / tasksPerPage);

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  };

  return (
    <div className="container mytasks-container mt-4">
      <h2>My Tasks</h2>
      <div className="tasks-grid">
        {currentTasks.length > 0 ? (
          currentTasks.map((task) => (
            <div key={task.id} className="task-card">
              <h4>{task.title}</h4>
              <p>{task.description}</p>
              <p><strong>Status:</strong> {task.status}</p>
              {task.agent_comments && (
                <p><strong>Comments:</strong> {task.agent_comments}</p>
              )}
              <p className="task-date">{new Date(task.createdAt).toLocaleString()}</p>

              {/* Checkbox for marking task as completed */}
              {task.status !== "COMPLETED" && (
                <div className="task-complete-checkbox">
                  <label>
                    <input
                      type="checkbox"
                      onChange={() => markTaskAsCompleted(task.id)}
                    />{" "}
                    Mark as Completed
                  </label>
                </div>
              )}
            </div>
          ))
        ) : (
          <p>No tasks available.</p>
        )}
      </div>
      <div className="pagination">
        <button onClick={handlePrevPage} disabled={currentPage === 1}>
          Prev
        </button>
        <span>
          Page {currentPage} of {totalPages}
        </span>
        <button onClick={handleNextPage} disabled={currentPage === totalPages}>
          Next
        </button>
      </div>
    </div>
  );
};

export default MyTasks;
