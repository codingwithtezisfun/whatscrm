"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { FaPlus, FaTrash, FaEdit, FaPaperPlane } from "react-icons/fa";
import "../Styles/templatemanager.css";
import BASE_URL from "../../BaseUrl";

const TemplateManager = () => {
  const token = localStorage.getItem("userToken");

  // State for DB templates and Meta templates
  const [dbTemplates, setDbTemplates] = useState([]);
  const [metaTemplates, setMetaTemplates] = useState([]);
  
  // State for modal (for adding/updating DB templates)
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    type: "text",
    content: {},
  });

  // Fetch DB templates (for review, update, deletion, and sending for review)
  const fetchDbTemplates = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/templet/get_templets`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.success) {
        setDbTemplates(res.data.data);
      }
    } catch (err) {
      console.error("Error fetching DB templates:", err);
    }
  };

  // Fetch Meta templates (read-only, can only delete from Meta)
  const fetchMetaTemplates = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/user/get_my_meta_templets`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.success) {
        setMetaTemplates(res.data.data);
      }
    } catch (err) {
      console.error("Error fetching Meta templates:", err);
    }
  };

  useEffect(() => {
    fetchDbTemplates();
    fetchMetaTemplates();
  }, []);

  // Handlers for DB template actions
  const handleAddNew = () => {
    setFormData({ title: "", type: "text", content: {} });
    setShowModal(true);
  };

  const handleDeleteDbTemplate = async (id) => {
    try {
      await axios.post(
        `${BASE_URL}/api/templet/del_templets`,
        { selected: [id] },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchDbTemplates();
      Swal.fire("Deleted!", "Template has been deleted from DB.", "success");
    } catch (err) {
      console.error("Error deleting DB template:", err);
      Swal.fire("Error!", "Failed to delete template from DB.", "error");
    }
  };

  const handleSendForReview = async (template) => {
    // Example: call your backend to send this DB template for Meta review
    try {
      const res = await axios.post(
        `${BASE_URL}/api/templet/send_for_review`,
        { template },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        Swal.fire("Submitted!", "Template submitted for review.", "success");
        fetchDbTemplates();
      } else {
        Swal.fire("Error!", res.data.msg || "Failed to submit template.", "error");
      }
    } catch (err) {
      console.error("Error sending template for review:", err);
      Swal.fire("Error!", "Failed to send template for review.", "error");
    }
  };

  // Handlers for Meta template actions
  const handleDeleteMetaTemplate = async (templateName) => {
    // Assuming endpoint expects a template name
    try {
      const res = await axios.post(
        `${BASE_URL}/api/templet/del_meta_templets`,
        { name: templateName },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        Swal.fire("Deleted!", "Template has been deleted from Meta.", "success");
        fetchMetaTemplates();
      } else {
        Swal.fire("Error!", res.data.msg || "Failed to delete template from Meta.", "error");
      }
    } catch (err) {
      console.error("Error deleting Meta template:", err);
      Swal.fire("Error!", "Failed to delete template from Meta.", "error");
    }
  };

  // Handler for modal form changes and submission (for DB templates)
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleContentChange = (e) => {
    try {
      const content = JSON.parse(e.target.value);
      setFormData((prev) => ({ ...prev, content }));
    } catch (error) {
      console.error("JSON parse error:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${BASE_URL}/api/templet/add_new`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchDbTemplates();
      setShowModal(false);
      Swal.fire("Success!", "Template added to DB successfully.", "success");
    } catch (err) {
      console.error("Error saving DB template:", err);
      Swal.fire("Error!", "Failed to save template.", "error");
    }
  };

  return (
    <div className="template-manager-container">
      <h3>Template Manager</h3>

      <div className="mb-4">
        <h4>DB Templates</h4>
        <div className="d-flex justify-content-end mb-2">
          <button className="btn btn-primary me-2" onClick={handleAddNew}>
            <FaPlus /> Add New Template
          </button>
        </div>
        <table className="table table-striped table-hover">
          <thead className="table-dark">
            <tr>
              <th>ID</th>
              <th>Title</th>
              <th>Type</th>
              <th>Content</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {dbTemplates.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center">No DB templates available</td>
              </tr>
            ) : (
              dbTemplates.map((template) => (
                <tr key={template.id}>
                  <td>{template.id}</td>
                  <td>{template.title}</td>
                  <td>{template.type}</td>
                  <td>
                    <pre className="mb-0">{JSON.stringify(JSON.parse(template.content), null, 2)}</pre>
                  </td>
                  <td>{template.status || "N/A"}</td>
                  <td>
                    <button className="btn btn-sm btn-outline-secondary me-1">
                      <FaEdit /> Edit
                    </button>
                    <button
                      className="btn btn-sm btn-outline-danger me-1"
                      onClick={() => handleDeleteDbTemplate(template.id)}
                    >
                      <FaTrash /> Delete
                    </button>
                    <button
                      className="btn btn-sm btn-outline-primary"
                      onClick={() => handleSendForReview(template)}
                    >
                      <FaPaperPlane /> Send for Review
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="mb-4">
        <h4>Meta Templates</h4>
        <table className="table table-striped table-hover">
          <thead className="table-dark">
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Status</th>
              <th>Category</th>
              <th>Language</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {metaTemplates.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center">No Meta templates available</td>
              </tr>
            ) : (
              metaTemplates.map((tmpl) => (
                <tr key={tmpl.id}>
                  <td>{tmpl.id}</td>
                  <td>{tmpl.name}</td>
                  <td>{tmpl.status}</td>
                  <td>{tmpl.category}</td>
                  <td>{tmpl.language}</td>
                  <td>
                    <button
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => handleDeleteMetaTemplate(tmpl.name)}
                    >
                      <FaTrash /> Delete from Meta
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal for adding/updating DB Template */}
      {showModal && (
        <div className="modal fade show d-block" tabIndex="-1">
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Add New Template</h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <div className="modal-body">
                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label className="form-label">Title</label>
                    <input
                      type="text"
                      className="form-control"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Type</label>
                    <select
                      className="form-select"
                      name="type"
                      value={formData.type}
                      onChange={handleChange}
                      required
                    >
                      <option value="text">Text</option>
                      <option value="flow">Flow</option>
                      <option value="response">Response</option>
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Content (JSON Format)</label>
                    <textarea
                      className="form-control"
                      rows="5"
                      placeholder="Enter template content as JSON"
                      value={JSON.stringify(formData.content, null, 2)}
                      onChange={handleContentChange}
                      required
                    />
                    <small className="text-muted">Ensure valid JSON format</small>
                  </div>
                  <div className="text-end">
                    <button type="button" className="btn btn-secondary me-2" onClick={() => setShowModal(false)}>
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary">
                      Save Template
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TemplateManager;
