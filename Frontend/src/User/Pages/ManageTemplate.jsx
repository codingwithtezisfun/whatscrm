import React, { useState } from "react";
import "../Styles/managetemplate.css"; 

const ManageTemplate = () => {
  // Sidebar state
  const [activeTab, setActiveTab] = useState("meta"); 

  // Template table data (placeholder)
  const [templates, setTemplates] = useState([
    // { id: 1, name: "Template 1", language: "en", category: "Marketing", status: "Draft" },
  ]);

  // Modal state
  const [showAddModal, setShowAddModal] = useState(false);

  // Form fields for new template
  const [templateName, setTemplateName] = useState("");
  const [language, setLanguage] = useState("en");
  const [category, setCategory] = useState("Marketing");
  const [componentType, setComponentType] = useState("Body");
  const [mediaType, setMediaType] = useState("Image");
  const [messagePreview, setMessagePreview] = useState("Hello, World!");

  // Toggle modal
  const openAddModal = () => {
    setShowAddModal(true);
  };
  const closeAddModal = () => {
    setShowAddModal(false);
    // Clear fields if desired
  };

  // Save or send template
  const handleSendForReview = () => {
    // Minimal placeholder: just close & add row
    const newId = templates.length + 1;
    const newTemplate = {
      id: newId,
      name: templateName || `Template ${newId}`,
      language,
      category,
      status: "Draft",
    };
    setTemplates([...templates, newTemplate]);
    closeAddModal();
  };

  // Add a component to the message
  const handleAddComponent = () => {
    // Minimal approach: just append to preview
    setMessagePreview((prev) => prev + `\n[+ ${componentType}]`);
  };

  return (
    <div className="manage-template-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <div
          className={`sidebar-item ${activeTab === "meta" ? "active" : ""}`}
          onClick={() => setActiveTab("meta")}
        >
          Manage meta template
        </div>
        <div
          className={`sidebar-item ${activeTab === "broadcast" ? "active" : ""}`}
          onClick={() => setActiveTab("broadcast")}
        >
          Send broadcast
        </div>
      </aside>

      {/* Main Content */}
      <div className="main-content">
        {activeTab === "meta" && (
          <>
            {/* Top section with button */}
            <div className="template-top-bar">
              <h2>Message meta template</h2>
              <button className="btn btn-primary" onClick={openAddModal}>
                + Add New Template
              </button>
            </div>

            {/* Table of Templates */}
            <div className="template-table-container">
              <table className="template-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Language</th>
                    <th>Category</th>
                    <th>Status</th>
                    <th>View</th>
                    <th>Delete</th>
                  </tr>
                </thead>
                <tbody>
                  {templates.length > 0 ? (
                    templates.map((tmpl) => (
                      <tr key={tmpl.id}>
                        <td>{tmpl.id}</td>
                        <td>{tmpl.name}</td>
                        <td>{tmpl.language}</td>
                        <td>{tmpl.category}</td>
                        <td>{tmpl.status}</td>
                        <td>
                          <button className="btn-sm">View</button>
                        </td>
                        <td>
                          <button className="btn-sm btn-danger">Delete</button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7">No items</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}

        {activeTab === "broadcast" && (
          <div className="broadcast-placeholder">
            <h2>Send broadcast</h2>
            <p>Broadcast logic goes here.</p>
          </div>
        )}
      </div>

      {/* Add Template Modal */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h4>Add new template</h4>
            <div className="modal-row">
              <label>Template name</label>
              <input
                type="text"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                placeholder="Enter template name"
              />
            </div>
            <div className="modal-row">
              <label>Language</label>
              <select value={language} onChange={(e) => setLanguage(e.target.value)}>
                <option value="en">English</option>
                <option value="es">Spanish</option>
                {/* Add more as needed */}
              </select>
            </div>
            <div className="modal-row">
              <label>Category</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)}>
                <option value="Marketing">Marketing</option>
                <option value="Utility">Utility</option>
              </select>
            </div>

            <div className="modal-row">
              <label>Component Type</label>
              <select
                value={componentType}
                onChange={(e) => setComponentType(e.target.value)}
              >
                <option value="Body">Body</option>
                <option value="Footer">Footer</option>
                <option value="Buttons">Buttons</option>
                <option value="Media">Media</option>
              </select>
            </div>

            {/* If user selects 'Media', show media type */}
            {componentType === "Media" && (
              <div className="modal-row">
                <label>Media type</label>
                <select
                  value={mediaType}
                  onChange={(e) => setMediaType(e.target.value)}
                >
                  <option value="Image">Image</option>
                  <option value="Video">Video</option>
                  <option value="Document">Document</option>
                </select>
                <button className="btn-sm">Upload Media</button>
              </div>
            )}

            <button className="btn btn-secondary" onClick={handleAddComponent}>
              Add Component to Message
            </button>

            {/* Preview on the right */}
            <div className="emulator-preview">
              <h5>Preview:</h5>
              <div className="preview-box">
                {messagePreview}
                <div className="timestamp">10:54 AM</div>
              </div>
            </div>

            <div className="modal-actions">
              <button className="btn btn-primary" onClick={handleSendForReview}>
                Send Template For Review
              </button>
              <button className="btn btn-outline-secondary" onClick={closeAddModal}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageTemplate;
