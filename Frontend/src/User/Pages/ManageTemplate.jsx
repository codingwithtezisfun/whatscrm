import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import BASE_URL from "../../BaseUrl";
import { FaCircleDot } from "react-icons/fa6";
import "../Styles/managetemplate.css";

export default function ManageTemplate() {
  const token = localStorage.getItem("userToken");

  // Table states
  const [templates, setTemplates] = useState([]);
  const [selectedTemplates, setSelectedTemplates] = useState([]);

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);

  // Form fields
  const [templateName, setTemplateName] = useState("");
  const [language, setLanguage] = useState("en");
  const [category, setCategory] = useState("Marketing");
  const [componentType, setComponentType] = useState("Body");
  const [mediaType, setMediaType] = useState("Image");
  const [componentText, setComponentText] = useState("");

  // Components array for emulator (each has type, text, mediaType, etc.)
  const [components, setComponents] = useState([]);
  // For file uploads (media attachments)
  const [uploadedFiles, setUploadedFiles] = useState([]);

  useEffect(() => {
    loadTemplates();
  }, []);

  // GET /get_templets
  const loadTemplates = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/templet/get_templets`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.success) {
        setTemplates(res.data.data || []);
      } else {
        setTemplates([]);
      }
    } catch (err) {
      console.error("Error fetching templates:", err);
      setTemplates([]);
    }
  };

  // "Add New Template" button
  const openAddModal = () => {
    setTemplateName("");
    setLanguage("en");
    setCategory("Marketing");
    setComponentType("Body");
    setMediaType("Image");
    setComponentText("");
    setComponents([]);
    setUploadedFiles([]);
    setShowAddModal(true);
  };
  const closeAddModal = () => {
    setShowAddModal(false);
  };

  // Add or update a component (if Body or Footer, update existing; otherwise add new)
  const handleAddComponent = () => {
    if (componentType === "Body" || componentType === "Footer") {
      const index = components.findIndex((c) => c.type === componentType);
      if (index !== -1) {
        let newComponents = [...components];
        newComponents[index].text = componentText;
        setComponents(newComponents);
      } else {
        setComponents([...components, { type: componentType, text: componentText, mediaType }]);
      }
    } else {
      // For Buttons (allowing multiple) and others (like Media when not using file upload)
      setComponents([...components, { type: componentType, text: componentText, mediaType }]);
    }
    setComponentText("");
  };

  // Handle file input change for Media (attachments)
  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    setUploadedFiles([...uploadedFiles, ...files]);
  };

  // POST /add_new including attachments (here we send file names as placeholders)
  const handleSendForReview = async () => {
    if (!templateName.trim()) {
      Swal.fire("Error", "Please provide a template name.", "error");
      return;
    }
    const content = {
      language,
      category,
      components,
      // Note: In a real upload scenario you might convert files or upload them separately.
      attachments: uploadedFiles.map((file) => file.name),
    };
    try {
      const res = await axios.post(
        `${BASE_URL}/api/templet/add_new`,
        {
          title: templateName,
          type: "meta",
          content,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        Swal.fire("Success", "Template was added!", "success");
        closeAddModal();
        loadTemplates();
      } else {
        Swal.fire("Error", res.data.msg || "Failed to add template.", "error");
      }
    } catch (err) {
      console.error("Error adding template:", err);
      Swal.fire("Error", "Something went wrong.", "error");
    }
  };

  // Multi-select table check
  const handleCheck = (id) => {
    if (selectedTemplates.includes(id)) {
      setSelectedTemplates(selectedTemplates.filter((sel) => sel !== id));
    } else {
      setSelectedTemplates([...selectedTemplates, id]);
    }
  };

  // POST /del_templets
  const handleDeleteSelected = async () => {
    if (selectedTemplates.length < 1) return;
    const confirm = await Swal.fire({
      title: "Delete selected templates?",
      text: "Are you sure you want to delete them?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete",
    });
    if (!confirm.isConfirmed) return;

    try {
      const res = await axios.post(
        `${BASE_URL}/api/templet/del_templets`,
        { selected: selectedTemplates },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        Swal.fire("Deleted!", "Templates were deleted.", "success");
        setTemplates((prev) =>
          prev.filter((t) => !selectedTemplates.includes(t.id))
        );
        setSelectedTemplates([]);
      } else {
        Swal.fire("Error", res.data.msg || "Failed to delete templates.", "error");
      }
    } catch (err) {
      console.error("Error deleting templates:", err);
      Swal.fire("Error", "Something went wrong.", "error");
    }
  };

  const renderTemplateView = () => {
    if (!viewingTemplate) return null;

    const { content } = viewingTemplate;
    const body = content?.components?.find((c) => c.type === "Body")?.text || "";
    const footer = content?.components?.find((c) => c.type === "Footer")?.text || "";
    const buttons = content?.components?.filter((c) => c.type === "Buttons") || [];
    const media = content?.attachments || [];
  }

  // For the bubble timestamp
  const getCurrentTime = () => {
    return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Render a single WhatsApp-style bubble with sections: Body, Attachments, Buttons, Footer, and Time.
  const renderPreview = () => {
    const bodyComp = components.find((c) => c.type === "Body");
    const footerComp = components.find((c) => c.type === "Footer");
    const buttonsComps = components.filter((c) => c.type === "Buttons");

    return (
      <div className="whatsapp-bubble">
        {/* Body Section */}
        {bodyComp && (
          <div className="bubble-section body-section">
            {bodyComp.text}
          </div>
        )}
        {/* Attachments Section */}
        {uploadedFiles.length > 0 && (
          <div className="bubble-section attachments-section">
            {uploadedFiles.map((file, index) => (
              <div key={index} className="attachment">
                {file.type.startsWith("image/") ? (
                  <img
                    src={URL.createObjectURL(file)}
                    alt={file.name}
                    className="attachment-thumbnail"
                  />
                ) : (
                  <span>{file.name}</span>
                )}
              </div>
            ))}
          </div>
        )}
        {/* Buttons Section */}
        {buttonsComps.length > 0 && (
          <div className="bubble-section buttons-section">
            {buttonsComps.map((btn, index) => (
              <button key={index} className="preview-button">
                {btn.text || "Button"}
              </button>
            ))}
          </div>
        )}
        {/* Footer Section */}
        {footerComp && (
          <div className="bubble-section footer-section">
            {footerComp.text}
          </div>
        )}
        {/* Timestamp */}
        <div className="bubble-section time-section">{getCurrentTime()}</div>
      </div>
    ); 
  };

  

  return (
    <div className="manage-template-container p-3">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>Manage Meta Templates</h2>
        <div>
          <button className="btn btn-outline-danger me-2" onClick={handleDeleteSelected}>
            Delete Selected
          </button>
          <button className="btn btn-primary" onClick={openAddModal}>
            + Add New Template
          </button>
        </div>
      </div>

      {/* Template Table */}
      <div className="table-responsive">
        <table className="table table-striped align-middle">
          <thead>
            <tr>
              <th>
                <input
                  type="checkbox"
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedTemplates(templates.map((t) => t.id));
                    } else {
                      setSelectedTemplates([]);
                    }
                  }}
                  checked={
                    templates.length > 0 &&
                    selectedTemplates.length === templates.length
                  }
                />
              </th>
              <th>ID</th>
              <th>Name</th>
              <th>Language</th>
              <th>Category</th>
              <th>Status</th>
              <th>View</th>
            </tr>
          </thead>
          <tbody>
            {templates.length > 0 ? (
              templates.map((tmpl) => (
                <tr key={tmpl.id}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedTemplates.includes(tmpl.id)}
                      onChange={() => handleCheck(tmpl.id)}
                    />
                  </td>
                  <td>{tmpl.id}</td>
                  <td>{tmpl.title}</td>
                  <td>{tmpl.content?.language || "en"}</td>
                  <td>{tmpl.content?.category || "Marketing"}</td>
                  <td>{tmpl.status || "Draft"}</td>
                  <td>
                    <button className="btn btn-sm btn-outline-info">View</button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7">No templates found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

     {/* Add Template Modal */}
    {showAddModal && (
    <div className="custom-modal-overlay">
        <div className="custom-modal-content">
        <h4 className="modal-title">Add new template</h4>

        {/* Two-column layout: left (form) and right (preview) */}
        <div className="custom-modal-body">
            {/* Left: Form using a 2-column grid with floating labels */}
            <div
            className="custom-form-side"
            >
            {/* Template Name (span 2 columns) */}
            <div className="custom-modal-row full-width">
                <div className="floating-label-group">
                <input
                    type="text"
                    value={templateName}
                    onChange={(e) => setTemplateName(e.target.value)}
                    className="floating-input-name"
                    placeholder=" "
                />
                <label className="floating-label">Template Name</label>
                </div>
            </div>
            {/* Language */}
            <div className="custom-modal-row">
                <div className="floating-label-group">
                <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="floating-input"
                >
                    <option value="en">English</option>
                </select>
                <label className="floating-label">Language</label>
                </div>
            </div>
            {/* Category */}
            <div className="custom-modal-row">
                <div className="floating-label-group">
                <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="floating-input"
                >
                    <option value="Marketing">Marketing</option>
                    <option value="Utility">Utility</option>
                </select>
                <label className="floating-label">Category</label>
                </div>
            </div>
            {/* Component Type */}
            <div className="custom-modal-row">
                <div className="floating-label-group">
                <select
                    value={componentType}
                    onChange={(e) => setComponentType(e.target.value)}
                    className="floating-input"
                >
                    <option value="Body">Body</option>
                    <option value="Footer">Footer</option>
                    <option value="Buttons">Buttons</option>
                    <option value="Media">Media</option>
                </select>
                <label className="floating-label">Component Type</label>
                </div>
            </div>
            {/* Media Options: only show if componentType is Media */}
            {componentType === "Media" && (
                <div className="custom-modal-row">
                <div className="floating-label-group">
                    <select
                    value={mediaType}
                    onChange={(e) => setMediaType(e.target.value)}
                    className="floating-input"
                    >
                    <option value="Image">Image</option>
                    <option value="Video">Video</option>
                    <option value="Document">Document</option>
                    </select>
                    <label className="floating-label">Media Type</label>
                </div>
                <input
                    type="file"
                    multiple
                    onChange={handleFileUpload}
                    className="file-input"
                />
                </div>
            )}
            {/* Component Text (span 2 columns) */}
            <div className="custom-modal-row full-width">
                <div className="floating-label-group">
                <textarea
                    value={componentText}
                    onChange={(e) => setComponentText(e.target.value)}
                    className="floating-input-name"
                    placeholder=" "
                />
                <label className="floating-label">Component Text</label>
                </div>
            </div>
            {/* Add/Update Component Button (span 2 columns) */}
            <div className="custom-modal-row full-width">
                <button className="btn btn-secondary" onClick={handleAddComponent}>
                Add/Update Component
                </button>
            </div>
            </div>

            {/* Right: Emulator Preview wrapped in a smartphone container */}
            <div className="custom-emulator-side">
            {/* <h5>Preview:</h5> */}
            <div className="smartphone-preview">
                <div className="preview-box">{renderPreview()}
                <FaCircleDot className="preview-box-camera"/>

                </div>
            </div>
            </div>
        </div>

        <div className="custom-modal-actions">
            <button className="btn btn-primary me-5" onClick={handleSendForReview}>
            Send Template For Review
            </button>
            <button
            className="btn btn-outline-secondary"
            onClick={() => setShowAddModal(false)}
            >
            Close
            </button>
        </div>
        </div>
    </div>
    )}
    </div>
  );
}
