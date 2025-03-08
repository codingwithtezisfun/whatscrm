import React, { useState } from "react";
import { Handle, Position } from "reactflow";
import axios from "axios";
import Swal from "sweetalert2";
import "../Styles/nodes.css";
import { IoIosCloseCircle } from "react-icons/io";
import { IoSaveSharp } from "react-icons/io5";
import { MdDelete } from "react-icons/md";

// Example helper to call the backend templet API
const saveTemplate = async (nodeType, nodeName, content) => {
  try {
    const payload = {
      title: nodeName || "Untitled",
      type: nodeType,
      content,
    };
    const response = await axios.post("/api/templet/add_new", payload);
    if (response.data.success) {
      Swal.fire("Template saved", "Node has been saved as a template", "success");
    } else {
      Swal.fire("Error", response.data.msg || "Could not save template", "error");
    }
  } catch (err) {
    Swal.fire("Error", err.message || "Unexpected error", "error");
  }
};

export const SimpleTextNode = ({ data, isConnectable, id }) => {
  // Sub-options array
  const initialOptions = Array.isArray(data.options) ? data.options : [];
  // Local state for new sub-option text
  const [newOptionText, setNewOptionText] = useState("");

  // Update the node's data (only the 'message' field remains)
  const handleChange = (e) => {
    data.onChange({ ...data, message: e.target.value });
  };

  // Remove the entire node
  const handleRemoveNode = () => {
    if (data.onRemove) data.onRemove(id);
  };

  // Save this node as a template (example logic)
  const handleSaveTemplate = () => {
    const content = {
      message: data.message || "",
      options: data.options || [],
    };
    saveTemplate("simpleText", "SimpleTextNode", content);
  };

  // Add a new sub-option
  const handleAddOption = () => {
    if (!newOptionText.trim()) return;

    const updatedOptions = [...initialOptions, { text: newOptionText }];
    data.onChange({ ...data, options: updatedOptions });
    setNewOptionText("");
  };

  // Remove a sub-option
  const handleRemoveOption = (index) => {
    const updatedOptions = [...initialOptions];
    updatedOptions.splice(index, 1);
    data.onChange({ ...data, options: updatedOptions });
  };

  return (
    <div className="node-container simple-text-node" style={{ position: "relative" }}>
      {/* Node Header */}
      <div className="node-header node-header-1 d-flex justify-content-between align-items-center">
        <span>Simple text</span>
        <div>
          
        <MdDelete onClick={handleRemoveNode} className="node-close-btn" />
          <IoSaveSharp onClick={handleSaveTemplate} className="node-save-btn" />
        </div>
      </div>

      {/* Node Body */}
      <div className="node-body">
        <label>Message:</label>
        <input
          className="form-control"
          placeholder="Enter main message..."
          value={data.message || ""}
          onChange={handleChange}
        />

        {/* Sub-options */}
        <div className="options-container mt-3">
          <label>Add option:</label>
          <div className="d-flex mb-2">
            <input
              type="text"
              className="form-control me-2"
              placeholder="Option text"
              value={newOptionText}
              onChange={(e) => setNewOptionText(e.target.value)}
            />
            <button className="btn btn-primary" onClick={handleAddOption}>
              +
            </button>
          </div>

          {/* List of sub-options, each with its own handle */}
          {initialOptions.map((opt, idx) => (
            <div
              key={idx}
              className="option-row d-flex align-items-center mb-2"
              style={{ position: "relative" }}
            >
              {/* Dynamic handle for each sub-option */}
              <Handle
                type="source"
                position={Position.Right}
                // Each handle needs a unique ID; "option-idx" ensures that
                id={`option-${idx}`}
                style={{
                  position: "absolute",
                  top: "50%",
                  transform: "translateY(-50%)",
                  right: "-10px",
                  background: "#555",
                }}
                isConnectable={isConnectable}
              />
              <span>{opt.text}</span>
              <button
                className="delete-option-btn"
                onClick={() => handleRemoveOption(idx)}
              >
                <MdDelete />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Input handle (if needed) */}
      <Handle
        type="target"
        position={Position.Left}
        isConnectable={isConnectable}
        style={{ background: "#555" }}
      />
    </div>
  );
};

// ----------------- Image Message Node -----------------
export const ImageMessageNode = ({ data, isConnectable, id }) => {
  // Ensure sub-captions array exists
  const subCaptions = Array.isArray(data.subCaptions) ? data.subCaptions : [];

  // Placeholder for uploading an image
  const handleFileUpload = async (e) => {
    if (!e.target.files[0]) return;
    const file = e.target.files[0];
    try {
      // Example: use FormData to send file to your backend
      // const formData = new FormData();
      // formData.append("file", file);
      // const res = await axios.post("/api/upload", formData);
      // data.onChange({ ...data, imageUrl: res.data.url });

      // Temporary approach (no actual upload):
      data.onChange({ ...data, imageUrl: URL.createObjectURL(file) });
    } catch (err) {
      console.error("Image upload failed:", err);
      // Optionally show an alert or toast
    }
  };

  // Handle main caption change
  const handleCaptionChange = (e) => {
    data.onChange({ ...data, caption: e.target.value });
  };

  // Add a new sub-caption
  const [newSubCaption, setNewSubCaption] = React.useState("");
  const handleAddSubCaption = () => {
    if (!newSubCaption.trim()) return;
    const updated = [...subCaptions, newSubCaption.trim()];
    data.onChange({ ...data, subCaptions: updated });
    setNewSubCaption("");
  };

  // Remove a sub-caption
  const handleRemoveSubCaption = (idx) => {
    const updated = [...subCaptions];
    updated.splice(idx, 1);
    data.onChange({ ...data, subCaptions: updated });
  };

  // Remove node
  const handleRemoveNode = () => {
    if (data.onRemove) data.onRemove(id);
  };

  // Save node as a template
  const handleSaveTemplate = () => {
    const content = {
      imageUrl: data.imageUrl || "",
      caption: data.caption || "",
      subCaptions: data.subCaptions || [],
    };
    saveTemplate("imageMessage", data.caption || "Image Template", content);
  };

  return (
    <div className="node-container image-message-node" style={{ position: "relative" }}>
      <div className="node-header node-header-2 d-flex justify-content-between align-items-center">
        <span>Image message</span>
        <div>
          <IoIosCloseCircle onClick={handleRemoveNode} className="node-close-btn" />
          <IoSaveSharp onClick={handleSaveTemplate} className="node-save-btn" />
        </div>
      </div>
      <div className="node-body">
        {/* File Upload */}
        <label>+ upload image</label>
        <input type="file" accept="image/*" onChange={handleFileUpload} className="form-control mb-2" />

        {/* Main caption */}
        <label>Caption (optional):</label>
        <input
          type="text"
          className="form-control"
          placeholder="Caption"
          value={data.caption || ""}
          onChange={handleCaptionChange}
        />

        {/* Sub-captions */}
        <div className="options-container mt-3">
          <label>Add option:</label>
          <div className="d-flex mb-2">
            <input
              type="text"
              className="form-control me-2"
              placeholder="Additional caption"
              value={newSubCaption}
              onChange={(e) => setNewSubCaption(e.target.value)}
            />
            <button className="btn btn-primary" onClick={handleAddSubCaption}>
              +
            </button>
          </div>

          {/* Display sub-captions, each with a handle */}
          {subCaptions.map((sc, idx) => (
            <div key={idx} className="option-row d-flex align-items-center mb-2" style={{ position: "relative" }}>
              <Handle
                type="source"
                position={Position.Right}
                id={`subcap-${idx}`}
                style={{
                  position: "absolute",
                  top: "50%",
                  transform: "translateY(-50%)",
                  right: "-10px",
                  background: "#555",
                }}
                isConnectable={isConnectable}
              />
              <span>{sc}</span>
              <button className="delete-option-btn" onClick={() => handleRemoveSubCaption(idx)}>
              <MdDelete />
              </button>
            </div>
          ))}
        </div>
      </div>
      {/* Input handle */}
      <Handle type="target" position={Position.Left} isConnectable={isConnectable} style={{ background: "#555" }} />
    </div>
  );
};

// ----------------- Audio Message Node -----------------
export const AudioMessageNode = ({ data, isConnectable, id }) => {
  // subCaptions array
  const subCaptions = Array.isArray(data.subCaptions) ? data.subCaptions : [];
  const [newSubCaption, setNewSubCaption] = React.useState("");

  // Upload audio
  const handleFileUpload = async (e) => {
    if (!e.target.files[0]) return;
    const file = e.target.files[0];
    try {
      // Example approach, replace with your actual API logic
      // const formData = new FormData();
      // formData.append("file", file);
      // const res = await axios.post("/api/upload", formData);
      // data.onChange({ ...data, audioUrl: res.data.url });

      data.onChange({ ...data, audioUrl: URL.createObjectURL(file) });
    } catch (err) {
      console.error("Audio upload failed:", err);
    }
  };

  // Add main caption
  const handleCaptionChange = (e) => {
    data.onChange({ ...data, caption: e.target.value });
  };

  // Add sub-caption
  const handleAddSubCaption = () => {
    if (!newSubCaption.trim()) return;
    const updated = [...subCaptions, newSubCaption.trim()];
    data.onChange({ ...data, subCaptions: updated });
    setNewSubCaption("");
  };

  // Remove sub-caption
  const handleRemoveSubCaption = (idx) => {
    const updated = [...subCaptions];
    updated.splice(idx, 1);
    data.onChange({ ...data, subCaptions: updated });
  };

  // Remove node
  const handleRemoveNode = () => {
    if (data.onRemove) data.onRemove(id);
  };

  // Save node as template
  const handleSaveTemplate = () => {
    const content = {
      audioUrl: data.audioUrl || "",
      caption: data.caption || "",
      subCaptions: data.subCaptions || [],
    };
    saveTemplate("audioMessage", "Audio Template", content);
  };

  return (
    <div className="node-container audio-message-node" style={{ position: "relative" }}>
      <div className="node-header node-header-3 d-flex justify-content-between align-items-center">
        <span>Audio message</span>
        <div>
          <IoIosCloseCircle onClick={handleRemoveNode} className="node-close-btn" />
          <IoSaveSharp onClick={handleSaveTemplate} className="node-save-btn" />
        </div>
      </div>
      <div className="node-body">
        {/* Audio upload */}
        <label>+ upload audio</label>
        <input type="file" accept="audio/*" onChange={handleFileUpload} className="form-control mb-2" />

        {/* Main caption */}
        <label>Caption (optional):</label>
        <input
          type="text"
          className="form-control"
          placeholder="Caption"
          value={data.caption || ""}
          onChange={handleCaptionChange}
        />

        {/* Sub-captions */}
        <div className="options-container mt-3">
          <label>Add option:</label>
          <div className="d-flex mb-2">
            <input
              type="text"
              className="form-control me-2"
              placeholder="Additional caption"
              value={newSubCaption}
              onChange={(e) => setNewSubCaption(e.target.value)}
            />
            <button className="btn btn-primary" onClick={handleAddSubCaption}>
              +
            </button>
          </div>

          {subCaptions.map((sc, idx) => (
            <div key={idx} className="option-row d-flex align-items-center mb-2" style={{ position: "relative" }}>
              <Handle
                type="source"
                position={Position.Right}
                id={`subcap-audio-${idx}`}
                style={{
                  position: "absolute",
                  top: "50%",
                  transform: "translateY(-50%)",
                  right: "-10px",
                  background: "#555",
                }}
                isConnectable={isConnectable}
              />
              <span>{sc}</span>
              <button className="delete-option-btn" onClick={() => handleRemoveSubCaption(idx)}>
              <MdDelete />
              </button>
            </div>
          ))}
        </div>
      </div>
      <Handle type="target" position={Position.Left} isConnectable={isConnectable} style={{ background: "#555" }} />
    </div>
  );
};

// ----------------- Video Message Node -----------------
export const VideoMessageNode = ({ data, isConnectable, id }) => {
  // subCaptions array
  const subCaptions = Array.isArray(data.subCaptions) ? data.subCaptions : [];
  const [newSubCaption, setNewSubCaption] = React.useState("");

  // Upload video
  const handleFileUpload = async (e) => {
    if (!e.target.files[0]) return;
    const file = e.target.files[0];
    try {
      // Example approach, replace with your actual API logic
      // const formData = new FormData();
      // formData.append("file", file);
      // const res = await axios.post("/api/upload", formData);
      // data.onChange({ ...data, videoUrl: res.data.url });

      data.onChange({ ...data, videoUrl: URL.createObjectURL(file) });
    } catch (err) {
      console.error("Video upload failed:", err);
    }
  };

  // Main caption
  const handleCaptionChange = (e) => {
    data.onChange({ ...data, caption: e.target.value });
  };

  // Add sub-caption
  const handleAddSubCaption = () => {
    if (!newSubCaption.trim()) return;
    const updated = [...subCaptions, newSubCaption.trim()];
    data.onChange({ ...data, subCaptions: updated });
    setNewSubCaption("");
  };

  // Remove sub-caption
  const handleRemoveSubCaption = (idx) => {
    const updated = [...subCaptions];
    updated.splice(idx, 1);
    data.onChange({ ...data, subCaptions: updated });
  };

  // Remove node
  const handleRemoveNode = () => {
    if (data.onRemove) data.onRemove(id);
  };

  // Save node as template
  const handleSaveTemplate = () => {
    const content = {
      videoUrl: data.videoUrl || "",
      caption: data.caption || "",
      subCaptions: data.subCaptions || [],
    };
    saveTemplate("videoMessage", "Video Template", content);
  };

  return (
    <div className="node-container video-message-node" style={{ position: "relative" }}>
      <div className="node-header node-header-4 d-flex justify-content-between align-items-center">
        <span>Video message</span>
        <div>
          <IoIosCloseCircle onClick={handleRemoveNode} className="node-close-btn" />
          <IoSaveSharp onClick={handleSaveTemplate} className="node-save-btn" />
        </div>
      </div>
      <div className="node-body">
        {/* Video upload */}
        <label>+ upload video</label>
        <input type="file" accept="video/*" onChange={handleFileUpload} className="form-control mb-2" />

        {/* Main caption */}
        <label>Caption (optional):</label>
        <input
          type="text"
          className="form-control"
          placeholder="Caption"
          value={data.caption || ""}
          onChange={handleCaptionChange}
        />

        {/* Sub-captions */}
        <div className="options-container mt-3">
          <label>Add option:</label>
          <div className="d-flex mb-2">
            <input
              type="text"
              className="form-control me-2"
              placeholder="Additional caption"
              value={newSubCaption}
              onChange={(e) => setNewSubCaption(e.target.value)}
            />
            <button className="btn btn-primary" onClick={handleAddSubCaption}>
              +
            </button>
          </div>

          {subCaptions.map((sc, idx) => (
            <div key={idx} className="option-row d-flex align-items-center mb-2" style={{ position: "relative" }}>
              <Handle
                type="source"
                position={Position.Right}
                id={`subcap-video-${idx}`}
                style={{
                  position: "absolute",
                  top: "50%",
                  transform: "translateY(-50%)",
                  right: "-10px",
                  background: "#555",
                }}
                isConnectable={isConnectable}
              />
              <span>{sc}</span>
              <button className="delete-option-btn" onClick={() => handleRemoveSubCaption(idx)}>
              <MdDelete />
              </button>
            </div>
          ))}
        </div>
      </div>
      <Handle type="target" position={Position.Left} isConnectable={isConnectable} style={{ background: "#555" }} />
    </div>
  );
};

// ----------------- Document Message Node -----------------
export const DocumentMessageNode = ({ data, isConnectable, id }) => {
  // subCaptions array
  const subCaptions = Array.isArray(data.subCaptions) ? data.subCaptions : [];
  const [newSubCaption, setNewSubCaption] = React.useState("");

  // Upload doc
  const handleFileUpload = async (e) => {
    if (!e.target.files[0]) return;
    const file = e.target.files[0];
    try {
      // Example approach, replace with your actual API logic
      // const formData = new FormData();
      // formData.append("file", file);
      // const res = await axios.post("/api/upload", formData);
      // data.onChange({ ...data, docUrl: res.data.url });

      data.onChange({ ...data, docUrl: URL.createObjectURL(file) });
    } catch (err) {
      console.error("Doc upload failed:", err);
    }
  };

  // Main caption
  const handleCaptionChange = (e) => {
    data.onChange({ ...data, caption: e.target.value });
  };

  // Add sub-caption
  const handleAddSubCaption = () => {
    if (!newSubCaption.trim()) return;
    const updated = [...subCaptions, newSubCaption.trim()];
    data.onChange({ ...data, subCaptions: updated });
    setNewSubCaption("");
  };

  // Remove sub-caption
  const handleRemoveSubCaption = (idx) => {
    const updated = [...subCaptions];
    updated.splice(idx, 1);
    data.onChange({ ...data, subCaptions: updated });
  };

  // Remove node
  const handleRemoveNode = () => {
    if (data.onRemove) data.onRemove(id);
  };

  // Save node as template
  const handleSaveTemplate = () => {
    const content = {
      docUrl: data.docUrl || "",
      caption: data.caption || "",
      subCaptions: data.subCaptions || [],
    };
    saveTemplate("documentMessage", "Document Template", content);
  };

  return (
    <div className="node-container document-message-node" style={{ position: "relative" }}>
      <div className="node-header-5 node-header d-flex justify-content-between align-items-center">
        <span>Document message</span>
        <div>
          <IoIosCloseCircle onClick={handleRemoveNode} className="node-close-btn" />
          <IoSaveSharp onClick={handleSaveTemplate} className="node-save-btn" />
        </div>
      </div>
      <div className="node-body">
        {/* Doc upload */}
        <label>+ upload doc</label>
        <input type="file" onChange={handleFileUpload} className="form-control mb-2" />

        {/* Main caption */}
        <label>Caption (optional):</label>
        <input
          type="text"
          className="form-control"
          placeholder="Caption"
          value={data.caption || ""}
          onChange={handleCaptionChange}
        />

        {/* Sub-captions */}
        <div className="options-container mt-3">
          <label>Add option:</label>
          <div className="d-flex mb-2">
            <input
              type="text"
              className="form-control me-2"
              placeholder="Additional caption"
              value={newSubCaption}
              onChange={(e) => setNewSubCaption(e.target.value)}
            />
            <button className="btn btn-primary" onClick={handleAddSubCaption}>
              +
            </button>
          </div>

          {subCaptions.map((sc, idx) => (
            <div key={idx} className="option-row d-flex align-items-center mb-2" style={{ position: "relative" }}>
              <Handle
                type="source"
                position={Position.Right}
                id={`subcap-doc-${idx}`}
                style={{
                  position: "absolute",
                  top: "50%",
                  transform: "translateY(-50%)",
                  right: "-10px",
                  background: "#555",
                }}
                isConnectable={isConnectable}
              />
              <span>{sc}</span>
              <button className="delete-option-btn" onClick={() => handleRemoveSubCaption(idx)}>
              <MdDelete />
              </button>
            </div>
          ))}
        </div>
      </div>
      <Handle type="target" position={Position.Left} isConnectable={isConnectable} style={{ background: "#555" }} />
    </div>
  );
};

// ----------------- Button Message Node -----------------
export const ButtonMessageNode = ({ data, isConnectable, id }) => {
  // Sub-buttons array
  const initialButtons = Array.isArray(data.buttons) ? data.buttons : [];
  // Local state for new sub-button text
  const [newButtonText, setNewButtonText] = useState("");

  // Update the node's data (main button text)
  const handleChange = (e) => {
    data.onChange({ ...data, buttonText: e.target.value });
  };

  // Remove the entire node
  const handleRemoveNode = () => {
    if (data.onRemove) data.onRemove(id);
  };

  // Save this node as a template (example logic)
  const handleSaveTemplate = () => {
    const content = {
      buttonText: data.buttonText || "",
      buttons: data.buttons || [],
    };
    saveTemplate("buttonMessage", "Button Template", content);
  };

  // Add a new sub-button (max 20 chars)
  const handleAddButton = () => {
    const trimmedText = newButtonText.trim();
    if (!trimmedText) return;
    if (trimmedText.length > 20) {
      Swal.fire("Error", "Button text cannot exceed 20 characters.", "error");
      return;
    }

    const updatedButtons = [...initialButtons, { text: trimmedText }];
    data.onChange({ ...data, buttons: updatedButtons });
    setNewButtonText("");
  };

  // Remove a sub-button
  const handleRemoveButton = (index) => {
    const updatedButtons = [...initialButtons];
    updatedButtons.splice(index, 1);
    data.onChange({ ...data, buttons: updatedButtons });
  };

  return (
    <div className="node-container button-message-node" style={{ position: "relative" }}>
      {/* Node Header */}
      <div className="node-header node-header-6 d-flex justify-content-between align-items-center">
        <span>Button message</span>
        <div>
          <IoIosCloseCircle onClick={handleRemoveNode} className="node-close-btn" />
          <IoSaveSharp onClick={handleSaveTemplate} className="node-save-btn" />
        </div>
      </div>

      {/* Node Body */}
      <div className="node-body">
        <label>Main Button:</label>
        <input
          className="form-control"
          placeholder="main button"
          value={data.buttonText || ""}
          onChange={handleChange}
        />

        {/* Sub-buttons */}
        <div className="options-container mt-3">
          <label>Add button (20 ch. max):</label>
          <div className="d-flex mb-2">
            <input
              type="text"
              className="form-control me-2"
              placeholder="Button text"
              value={newButtonText}
              onChange={(e) => setNewButtonText(e.target.value)}
            />
            <button className="btn btn-primary" onClick={handleAddButton}>
              +
            </button>
          </div>

          {/* List of sub-buttons, each with its own handle */}
          {initialButtons.map((btn, idx) => (
            <div
              key={idx}
              className="option-row d-flex align-items-center mb-2"
              style={{ position: "relative" }}
            >
              {/* Dynamic handle for each sub-button */}
              <Handle
                type="source"
                position={Position.Right}
                id={`button-${idx}`}
                style={{
                  position: "absolute",
                  top: "50%",
                  transform: "translateY(-50%)",
                  right: "-10px",
                  background: "#555",
                }}
                isConnectable={isConnectable}
              />
              <span>{btn.text}</span>
              <button
                className="delete-option-btn"
                onClick={() => handleRemoveButton(idx)}
              >
                <MdDelete />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Left handle for incoming connections (if needed) */}
      <Handle
        type="target"
        position={Position.Left}
        isConnectable={isConnectable}
        style={{ background: "#555" }}
      />
    </div>
  );
};
// ----------------- List Message Node -----------------
export const ListMessageNode = ({ data, isConnectable, id }) => {
  // Ensure we have sections array
  const sections = Array.isArray(data.sections) ? data.sections : [];

  // Local states for new section + item
  const [newSectionTitle, setNewSectionTitle] = React.useState("");
  const [newItemText, setNewItemText] = React.useState("");
  const [selectedSectionIndex, setSelectedSectionIndex] = React.useState(null);

  // Basic fields: header, body, footer, menuButtonText
  const handleChange = (e) => {
    const { name, value } = e.target;
    data.onChange({ ...data, [name]: value });
  };

  // Remove the node
  const handleRemoveNode = () => {
    if (data.onRemove) data.onRemove(id);
  };

  // Save template logic (example)
  const handleSaveTemplate = () => {
    const content = {
      header: data.header || "",
      body: data.body || "",
      footer: data.footer || "",
      menuButtonText: data.menuButtonText || "",
      sections: data.sections || [],
    };
    saveTemplate("listMessage", data.header || "List Template", content);
  };

  // Add a new section
  const handleAddSection = () => {
    if (!newSectionTitle.trim()) return;
    const updated = [
      ...sections,
      { sectionTitle: newSectionTitle.trim(), items: [] },
    ];
    data.onChange({ ...data, sections: updated });
    setNewSectionTitle("");
  };

  // Remove a section
  const handleRemoveSection = (secIndex) => {
    const updated = [...sections];
    updated.splice(secIndex, 1);
    data.onChange({ ...data, sections: updated });
  };

  // Select a section to add items to
  const handleSelectSection = (secIndex) => {
    setSelectedSectionIndex(secIndex);
    setNewItemText("");
  };

  // Add an item (row) to the currently selected section
  const handleAddItem = () => {
    if (
      selectedSectionIndex === null ||
      selectedSectionIndex >= sections.length
    )
      return;
    const trimmed = newItemText.trim();
    if (!trimmed) return;
    if (trimmed.length > 24) {
      Swal.fire("Error", "Max 24 characters allowed for item text", "error");
      return;
    }
    const updated = [...sections];
    updated[selectedSectionIndex].items.push({ label: trimmed });
    data.onChange({ ...data, sections: updated });
    setNewItemText("");
  };

  // Remove an item from a specific section
  const handleRemoveItem = (secIndex, itemIndex) => {
    const updated = [...sections];
    updated[secIndex].items.splice(itemIndex, 1);
    data.onChange({ ...data, sections: updated });
  };

  return (
    <div className="node-container list-message-node" style={{ position: "relative" }}>
      <div className="node-header node-header-7 d-flex justify-content-between align-items-center">
        <span>List message</span>
        <div>
          <IoIosCloseCircle onClick={handleRemoveNode} className="node-close-btn" />
          <IoSaveSharp onClick={handleSaveTemplate} className="node-save-btn" />
        </div>
      </div>

      <div className="node-body">
        {/* Basic fields */}
        <label>Header:</label>
        <input
          name="header"
          value={data.header || ""}
          onChange={handleChange}
          className="form-control"
        />

        <label>Body:</label>
        <textarea
          name="body"
          value={data.body || ""}
          onChange={handleChange}
          className="form-control"
        />

        <label>Footer:</label>
        <input
          name="footer"
          value={data.footer || ""}
          onChange={handleChange}
          className="form-control"
        />

        <label>Menu button text:</label>
        <input
          name="menuButtonText"
          value={data.menuButtonText || ""}
          onChange={handleChange}
          className="form-control"
        />

        {/* Add section */}
        <div className="mt-3">
          <label>Add section (max 8):</label>
          <div className="d-flex mb-2">
            <input
              type="text"
              className="form-control me-2"
              placeholder="Section title"
              value={newSectionTitle}
              onChange={(e) => setNewSectionTitle(e.target.value)}
            />
            <button className="btn btn-primary" onClick={handleAddSection}>
              + Add
            </button>
          </div>

          {/* Show existing sections */}
          {sections.map((sec, secIndex) => (
            <div
              key={secIndex}
              className="mb-3 p-2 border"
              style={{ position: "relative" }}
            >
              <div className="d-flex justify-content-between align-items-center">
                <strong>{sec.sectionTitle}</strong>
                <button
                  className="delete-option-btn"
                  onClick={() => handleRemoveSection(secIndex)}
                >
                  <MdDelete />
                </button>
              </div>

              {/* Items in this section */}
              <div className="mt-2">
                {sec.items.map((item, itemIndex) => (
                  <div
                    key={itemIndex}
                    className="d-flex align-items-center mb-1"
                    style={{ position: "relative" }}
                  >
                    {/* Each row can have a handle if needed */}
                    <Handle
                      type="source"
                      position={Position.Right}
                      id={`sec-${secIndex}-item-${itemIndex}`}
                      style={{
                        position: "absolute",
                        top: "50%",
                        transform: "translateY(-50%)",
                        right: "-10px",
                        background: "#555",
                      }}
                      isConnectable={isConnectable}
                    />
                    <span>{item.label}</span>
                    <button
                      className="delete-option-btn"
                      onClick={() => handleRemoveItem(secIndex, itemIndex)}
                    >
                      <MdDelete />
                    </button>
                  </div>
                ))}
              </div>

              {/* Add item to this section */}
              {selectedSectionIndex === secIndex && (
                <div className="mt-2">
                  <input
                    type="text"
                    className="form-control me-2 mb-1"
                    placeholder="Enter item (max 24 chars)"
                    value={newItemText}
                    onChange={(e) => setNewItemText(e.target.value)}
                  />
                  <button className="btn btn-primary btn-sm" onClick={handleAddItem}>
                    + Add item
                  </button>
                </div>
              )}

              <button
                className="btn btn-secondary btn-sm mt-2"
                onClick={() => handleSelectSection(secIndex)}
              >
                {selectedSectionIndex === secIndex ? "Done" : "Add options"}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* React Flow Handles */}
      <Handle
        type="target"
        position={Position.Left}
        isConnectable={isConnectable}
        style={{ background: "#555" }}
      />
      <Handle
        type="source"
        position={Position.Right}
        isConnectable={isConnectable}
        style={{ background: "#555" }}
      />
    </div>
  );
};

// ----------------- Send Location Node -----------------
export const SendLocationNode = ({ data, isConnectable, id }) => {
  // For "Name", "Address", "Latitude", "Longitude"
  const handleChange = (e) => {
    const { name, value } = e.target;
    data.onChange({ ...data, [name]: value });
  };

  const handleRemoveNode = () => {
    if (data.onRemove) data.onRemove(id);
  };

  const handleSaveTemplate = () => {
    const content = {
      name: data.name || "",
      address: data.address || "",
      latitude: data.latitude || "",
      longitude: data.longitude || "",
    };
    saveTemplate("sendLocation", data.name || "Location Template", content);
  };

  return (
    <div className="node-container send-location-node" style={{ position: "relative" }}>
      <div className="node-header node-header-8 d-flex justify-content-between align-items-center">
        <span>Send location</span>
        <div>
          <IoIosCloseCircle onClick={handleRemoveNode} className="node-close-btn" />
          <IoSaveSharp onClick={handleSaveTemplate} className="node-save-btn" />
        </div>
      </div>
      <div className="node-body">
        <label>Name:</label>
        <input
          name="name"
          value={data.name || ""}
          onChange={handleChange}
          className="form-control mb-2"
          placeholder="Name"
        />
        <label>Address:</label>
        <input
          name="address"
          value={data.address || ""}
          onChange={handleChange}
          className="form-control mb-2"
          placeholder="Address"
        />
        <label>Latitude:</label>
        <input
          name="latitude"
          value={data.latitude || ""}
          onChange={handleChange}
          className="form-control mb-2"
          placeholder="e.g. 25.1972"
        />
        <label>Longitude:</label>
        <input
          name="longitude"
          value={data.longitude || ""}
          onChange={handleChange}
          className="form-control"
          placeholder="e.g. 55.2744"
        />
      </div>
      <Handle
        type="target"
        position={Position.Left}
        isConnectable={isConnectable}
        style={{ background: "#555" }}
      />
      <Handle
        type="source"
        position={Position.Right}
        isConnectable={isConnectable}
        style={{ background: "#555" }}
      />
    </div>
  );
};

// ----------------- Assign Chat to Agent Node -----------------
export const AssignChatToAgentNode = ({ data, isConnectable, id }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    data.onChange({ ...data, [name]: value });
  };

  const handleRemoveNode = () => {
    if (data.onRemove) data.onRemove(id);
  };

  const handleSaveTemplate = () => {
    const content = { agentId: data.agentId };
    saveTemplate("assignChatToAgent", "Assign Chat Template", content);
  };

  return (
    <div className="node-container assign-chat-agent-node">
      <div className="node-header node-header-9 d-flex justify-content-between align-items-center">
        <span>Assign Chat to Agent</span>
        <div>
         <IoIosCloseCircle onClick={handleRemoveNode} className="node-close-btn"/>
         <IoSaveSharp onClick={handleSaveTemplate} className="node-save-btn" />
        </div>
      </div>
      <div className="node-body">
        <label>Agent Name/ID:</label>
        <input name="agentId" value={data.agentId || ""} onChange={handleChange} className="form-control" />
      </div>
      <Handle type="source" position={Position.Right} isConnectable={isConnectable} />
      <Handle type="target" position={Position.Left} isConnectable={isConnectable} />
    </div>
  );
};

// ----------------- Disable Chatbot Node -----------------
export const DisableChatbotNode = ({ data, isConnectable, id }) => {
  const handleRemoveNode = () => {
    if (data.onRemove) data.onRemove(id);
  };

  const handleSaveTemplate = () => {
    const content = { info: "Disable Chatbot" };
    saveTemplate("disableChatbot", "Disable Chatbot Template", content);
  };

  return (
    <div className="node-container disable-chatbot-node">
      <div className="node-header node-header-10 d-flex justify-content-between align-items-center">
        <span>Disable Chatbot</span>
        <div>
         <IoIosCloseCircle onClick={handleRemoveNode} className="node-close-btn"/>
         <IoSaveSharp onClick={handleSaveTemplate} className="node-save-btn" />
        </div>
      </div>
      <div className="node-body">
        <p>This node will disable the chatbot.</p>
      </div>
      <Handle type="source" position={Position.Right} isConnectable={isConnectable} />
      <Handle type="target" position={Position.Left} isConnectable={isConnectable} />
    </div>
  );
};

// ----------------- Receive API Node -----------------
export const ReceiveApiNode = ({ data, isConnectable, id }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    data.onChange({ ...data, [name]: value });
  };

  const handleRemoveNode = () => {
    if (data.onRemove) data.onRemove(id);
  };

  const handleSaveTemplate = () => {
    const content = { endpoint: data.endpoint, method: data.method };
    saveTemplate("receiveApi", "Receive API Template", content);
  };

  return (
    <div className="node-container receive-api-node">
      <div className="node-header node-header-11 d-flex justify-content-between align-items-center">
        <span>Receive API</span>
        <div>
         <IoIosCloseCircle onClick={handleRemoveNode} className="node-close-btn"/>
         <IoSaveSharp onClick={handleSaveTemplate} className="node-save-btn" />
        </div>
      </div>
      <div className="node-body">
        <label>Endpoint:</label>
        <input name="endpoint" value={data.endpoint || ""} onChange={handleChange} className="form-control" />
        <label>Method:</label>
        <select name="method" value={data.method || "GET"} onChange={handleChange} className="form-control">
          <option>GET</option>
          <option>POST</option>
          <option>PUT</option>
          <option>DELETE</option>
        </select>
      </div>
      <Handle type="source" position={Position.Right} isConnectable={isConnectable} />
      <Handle type="target" position={Position.Left} isConnectable={isConnectable} />
    </div>
  );
};

// ----------------- Take Input Node -----------------
export const TakeInputNode = ({ data, isConnectable, id }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    data.onChange({ ...data, [name]: value });
  };

  const handleRemoveNode = () => {
    if (data.onRemove) data.onRemove(id);
  };

  const handleSaveTemplate = () => {
    const content = { prompt: data.prompt };
    saveTemplate("takeInput", "Take Input Template", content);
  };

  return (
    <div className="node-container take-input-node">
      <div className="node-header node-header-12 d-flex justify-content-between align-items-center">
        <span>Take Input</span>
        <div>
         <IoIosCloseCircle onClick={handleRemoveNode} className="node-close-btn"/>
         <IoSaveSharp onClick={handleSaveTemplate} className="node-save-btn" />
        </div>
      </div>
      <div className="node-body">
        <label>Prompt:</label>
        <input name="prompt" value={data.prompt || ""} onChange={handleChange} className="form-control" />
      </div>
      <Handle type="source" position={Position.Right} isConnectable={isConnectable} />
      <Handle type="target" position={Position.Left} isConnectable={isConnectable} />
    </div>
  );
};

// ----------------- Condition Node -----------------
export const ConditionNode = ({ data, isConnectable, id }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    data.onChange({ ...data, [name]: value });
  };

  const handleRemoveNode = () => {
    if (data.onRemove) data.onRemove(id);
  };

  const handleSaveTemplate = () => {
    const content = { condition: data.condition, if: data.if, then: data.then };
    saveTemplate("condition", "Condition Template", content);
  };

  return (
    <div className="node-container condition-node">
      <div className="node-header node-header-13 d-flex justify-content-between align-items-center">
        <span>Condition</span>
        <div>
         <IoIosCloseCircle onClick={handleRemoveNode} className="node-close-btn"/>
         <IoSaveSharp onClick={handleSaveTemplate} className="node-save-btn" />
        </div>
      </div>
      <div className="node-body">
        <label>Condition:</label>
        <input name="condition" value={data.condition || ""} onChange={handleChange} className="form-control" />
        <label>If:</label>
        <input name="if" value={data.if || ""} onChange={handleChange} className="form-control" />
        <label>Then:</label>
        <input name="then" value={data.then || ""} onChange={handleChange} className="form-control" />
      </div>
      <Handle type="source" position={Position.Right} isConnectable={isConnectable} />
      <Handle type="target" position={Position.Left} isConnectable={isConnectable} />
    </div>
  );
};

// ----------------- Set Variable Node -----------------
export const SetVariableNode = ({ data, isConnectable, id }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    data.onChange({ ...data, [name]: value });
  };

  const handleRemoveNode = () => {
    if (data.onRemove) data.onRemove(id);
  };

  const handleSaveTemplate = () => {
    const content = { variableName: data.variableName, value: data.value };
    saveTemplate("setVariable", "Set Variable Template", content);
  };

  return (
    <div className="node-container set-variable-node">
      <div className="node-header node-header-14 d-flex justify-content-between align-items-center">
        <span>Set Variable</span>
        <div>
         <IoIosCloseCircle onClick={handleRemoveNode} className="node-close-btn"/>
         <IoSaveSharp onClick={handleSaveTemplate} className="node-save-btn" />
        </div>
      </div>
      <div className="node-body">
        <label>Variable Name:</label>
        <input name="variableName" value={data.variableName || ""} onChange={handleChange} className="form-control" />
        <label>Value:</label>
        <input name="value" value={data.value || ""} onChange={handleChange} className="form-control" />
      </div>
      <Handle type="source" position={Position.Right} isConnectable={isConnectable} />
      <Handle type="target" position={Position.Left} isConnectable={isConnectable} />
    </div>
  );
};

// ----------------- Close Chat Node -----------------
export const CloseChatNode = ({ data, isConnectable, id }) => {
  const handleRemoveNode = () => {
    if (data.onRemove) data.onRemove(id);
  };

  const handleSaveTemplate = () => {
    const content = { info: "Close Chat" };
    saveTemplate("closeChat", "Close Chat Template", content);
  };

  return (
    <div className="node-container close-chat-node">
      <div className="node-header node-header-15 d-flex justify-content-between align-items-center">
        <span>Close Chat</span>
        <div>
         <IoIosCloseCircle onClick={handleRemoveNode} className="node-close-btn"/>
         <IoSaveSharp onClick={handleSaveTemplate} className="node-save-btn" />
        </div>
      </div>
      <div className="node-body">
        <p>This node will close the chat.</p>
      </div>
      <Handle type="source" position={Position.Right} isConnectable={isConnectable} />
      <Handle type="target" position={Position.Left} isConnectable={isConnectable} />
    </div>
  );
};

// ----------------- OpenAI Node -----------------
export const OpenAiNode = ({ data, isConnectable, id }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    data.onChange({ ...data, [name]: value });
  };
  
  const handleRemoveNode = () => {
    if (data.onRemove) data.onRemove(id);
  };

  const handleSaveTemplate = () => {
    const content = { prompt: data.prompt, settings: data.settings };
    saveTemplate("openAi", "OpenAI Template", content);
  };

  return (
    <div className="node-container openai-node">
      <div className="node-header node-header-16 d-flex justify-content-between align-items-center">
        <span>OpenAI</span>
        <div>
         <IoIosCloseCircle onClick={handleRemoveNode} className="node-close-btn"/>
         <IoSaveSharp onClick={handleSaveTemplate} className="node-save-btn" />
        </div>
      </div>
      <div className="node-body">
        <label>Prompt:</label>
        <input name="prompt" value={data.prompt || ""} onChange={handleChange} className="form-control" />
        <label>Settings:</label>
        <input name="settings" value={data.settings || ""} onChange={handleChange} className="form-control" />
      </div>
      <Handle type="source" position={Position.Right} isConnectable={isConnectable} />
      <Handle type="target" position={Position.Left} isConnectable={isConnectable} />
    </div>
  );
};

// ----------------- GPT-4 Node -----------------
export const Gpt4Node = ({ data, isConnectable, id }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    data.onChange({ ...data, [name]: value });
  };

  const handleRemoveNode = () => {
    if (data.onRemove) data.onRemove(id);
  };

  const handleSaveTemplate = () => {
    const content = { prompt: data.prompt, settings: data.settings };
    saveTemplate("gpt4", "GPT-4 Template", content);
  };

  return (
    <div className="node-container gpt4-node">
      <div className="node-header node-header-17 d-flex justify-content-between align-items-center">
        <span>GPT-4</span>
        <div>
         <IoIosCloseCircle onClick={handleRemoveNode} className="node-close-btn"/>
         <IoSaveSharp onClick={handleSaveTemplate} className="node-save-btn" />
        </div>
      </div>
      <div className="node-body">
        <label>Prompt:</label>
        <input name="prompt" value={data.prompt || ""} onChange={handleChange} className="form-control" />
        <label>Settings:</label>
        <input name="settings" value={data.settings || ""} onChange={handleChange} className="form-control" />
      </div>
      <Handle type="source" position={Position.Right} isConnectable={isConnectable} />
      <Handle type="target" position={Position.Left} isConnectable={isConnectable} />
    </div>
  );
};

// ----------------- Add Message History Node -----------------
export const AddMsgHistoryNode = ({ data, isConnectable, id }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    data.onChange({ ...data, [name]: value });
  };

  const handleRemoveNode = () => {
    if (data.onRemove) data.onRemove(id);
  };

  const handleSaveTemplate = () => {
    const content = { history: data.history };
    saveTemplate("addMsgHistory", "Message History Template", content);
  };

  return (
    <div className="node-container add-msg-history-node">
      <div className="node-header node-header-18 d-flex justify-content-between align-items-center">
        <span>Add Msg History</span>
        <div>
         <IoIosCloseCircle onClick={handleRemoveNode} className="node-close-btn"/>
         <IoSaveSharp onClick={handleSaveTemplate} className="node-save-btn" />
        </div>
      </div>
      <div className="node-body">
        <label>History Data:</label>
        <textarea name="history" value={data.history || ""} onChange={handleChange} className="form-control" />
      </div>
      <Handle type="source" position={Position.Right} isConnectable={isConnectable} />
      <Handle type="target" position={Position.Left} isConnectable={isConnectable} />
    </div>
  );
};
