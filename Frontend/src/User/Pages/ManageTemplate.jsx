"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import Swal from "sweetalert2"
import {FaTrash, FaPaperPlane, FaSync, FaCheckCircle, FaPlusCircle } from "react-icons/fa"
import { FaCircleDot } from "react-icons/fa6";
import "../Styles/templatemanager.css"

import BASE_URL from "../../BaseUrl"

export default function ManageTemplate() {
  const [token, setToken] = useState("")

  // Table states
  const [templates, setTemplates] = useState([])
  const [selectedTemplates, setSelectedTemplates] = useState([])
  const [loading, setLoading] = useState(false)

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false)

  // Form fields
  const [templateName, setTemplateName] = useState("")
  const [language, setLanguage] = useState("en")
  const [category, setCategory] = useState("MARKETING")
  const [componentType, setComponentType] = useState("BODY")
  const [mediaType, setMediaType] = useState("IMAGE")
  const [componentText, setComponentText] = useState("")

  // Components array for template
  const [components, setComponents] = useState([])
  // For file uploads (media attachments)
  const [uploadedFiles, setUploadedFiles] = useState([])
  const [mediaUrl, setMediaUrl] = useState("")

  useEffect(() => {
    const storedToken = localStorage.getItem("userToken")
    if (storedToken) {
      setToken(storedToken)
      loadTemplates(storedToken)
    }
  }, [])

  const loadTemplates = async (authToken = token) => {
    try {
      setLoading(true);
      const res = await axios.get(`${BASE_URL}/api/user/get_my_meta_templets`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (res.data.success) {
        // Directly set the meta templates.
        // Depending on Meta's response structure, you may want to further process it.
        setTemplates(res.data.data);
      } else {
        setTemplates([]);
      }
    } catch (err) {
      console.error("Error fetching meta templates:", err);
      Swal.fire("Error", "Failed to load meta templates", "error");
    } finally {
      setLoading(false);
    }
  };
  

  const openAddModal = () => {
    setTemplateName("")
    setLanguage("en")
    setCategory("MARKETING")
    setComponentType("BODY")
    setMediaType("IMAGE")
    setComponentText("")
    setComponents([])
    setUploadedFiles([])
    setMediaUrl("")
    setShowAddModal(true)
  }

  const closeAddModal = () => {
    setShowAddModal(false)
  }

  const handleAddComponent = () => {
    if (componentType === "BODY" || componentType === "FOOTER") {
      const index = components.findIndex((c) => c.type === componentType);
      if (index !== -1) {
        const newComponents = [...components];
        newComponents[index].text = componentText;
        setComponents(newComponents);
      } else {
        setComponents([...components, { type: componentType, text: componentText }]);
      }
    } else if (componentType === "HEADER") {
      if (uploadedFiles.length === 0 && !mediaUrl) {
        Swal.fire("Error", "Please upload a file for the header", "error");
        return;
      }
      const index = components.findIndex((c) => c.type === "HEADER");
      if (index !== -1) {
        const newComponents = [...components];
        newComponents[index].format = mediaType;
        setComponents(newComponents);
      } else {
        setComponents([
          ...components,
          {
            type: "HEADER",
            format: mediaType,
            example: { header_handle: [mediaUrl || "placeholder"] },
          },
        ]);
      }
    } else if (componentType === "BUTTONS") {
      // Create a BUTTONS component with the required "buttons" field
      setComponents([...components, { type: "BUTTONS", buttons: [{ type: "QUICK_REPLY", text: componentText }] }]);
    } else {
      // For any other types (if applicable)
      setComponents([...components, { type: componentType, text: componentText }]);
    }
    setComponentText("");
  };
  

  const handleFileUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    if (!templateName.trim()) {
      Swal.fire("Error", "Please provide a template name first", "error")
      return
    }

    setUploadedFiles([...uploadedFiles, file])

    // Upload the file to the server
    const formData = new FormData()
    formData.append("file", file)
    formData.append("templet_name", templateName)

    try {
      Swal.fire({
        title: "Uploading",
        text: "Uploading media file...",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      })

      const res = await axios.post(`${BASE_URL}/api/user/return_media_url_meta`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      })

      Swal.close()

      if (res.data.success) {
        setMediaUrl(res.data.url)
        Swal.fire("Success", "Media uploaded successfully", "success")
      } else {
        Swal.fire("Error", res.data.msg || "Failed to upload media", "error")
      }
    } catch (err) {
      console.error("Error uploading media:", err)
      Swal.fire("Error", "Failed to upload media", "error")
    }
  }

  const handleSaveTemplate = async () => {
    if (!templateName.trim()) {
      Swal.fire("Error", "Please provide a template name", "error")
      return
    }

    if (components.length === 0) {
      Swal.fire("Error", "Please add at least one component", "error")
      return
    }

    const bodyComponent = components.find((c) => c.type === "BODY")
    if (!bodyComponent) {
      Swal.fire("Error", "A body component is required", "error")
      return
    }

    const content = {
      language,
      category,
      components,
      mediaUrl,
    }

    try {
      Swal.fire({
        title: "Saving",
        text: "Saving template...",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      })

      const res = await axios.post(
        `${BASE_URL}/api/templet/add_new`,
        {
          title: templateName,
          type: "meta",
          content,
        },
        { headers: { Authorization: `Bearer ${token}` } },
      )

      Swal.close()

      if (res.data.success) {
        Swal.fire("Success", "Template was saved successfully", "success")
        closeAddModal()
        loadTemplates()
      } else {
        Swal.fire("Error", res.data.msg || "Failed to save template", "error")
      }
    } catch (err) {
      console.error("Error saving template:", err)
      Swal.fire("Error", "Something went wrong while saving the template", "error")
    }
  }

  const handleSubmitToMeta = async (template) => {
    try {
      Swal.fire({
        title: "Submitting",
        text: "Submitting template to Meta for review...",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      })

      // Prepare the template data for Meta
      const templateData = template.contentData
      const metaBody = {
        name: template.title,
        category: templateData.category || "MARKETING",
        components: [
          // Get header first, then body, then footer...
          ...templateData.components.filter(c => c.type !== "BUTTONS"),
          // Then append any BUTTONS components last
          ...templateData.components.filter(c => c.type === "BUTTONS")
        ].map((comp) => {
          if (comp.type === "BODY") {
            return {
              type: "BODY",
              text: comp.text,
              example: { body_text: [[comp.text]] },
            };
          } else if (comp.type === "HEADER" && comp.format) {
            return {
              type: "HEADER",
              format: comp.format,
              example: comp.example || { header_handle: [templateData.mediaUrl || ""] },
            };
          } else if (comp.type === "FOOTER") {
            return {
              type: "FOOTER",
              text: comp.text,
            };
          }
          // For BUTTONS, ensure they have the "buttons" field
          else if (comp.type === "BUTTONS") {
            return comp;
          }
          return comp;
        }),
        language: templateData.language || "en",
      };
      

      const res = await axios.post(`${BASE_URL}/api/user/add_meta_templet`, metaBody, {
        headers: { Authorization: `Bearer ${token}` },
      })

      Swal.close()

      if (res.data.success) {
        Swal.fire("Success", "Template submitted to Meta for review", "success")
        loadTemplates()
      } else {
        Swal.fire("Error", res.data.msg || "Failed to submit template to Meta", "error")
      }
    } catch (err) {
      console.error("Error submitting to Meta:", err)
      Swal.fire("Error", "Failed to submit template to Meta", "error")
    }
  }

  const handleCheckStatus = async (template) => {
    try {
      Swal.fire({
        title: "Checking Status",
        text: "Checking template status with Meta...",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      })

      const res = await axios.get(`${BASE_URL}/api/user/get_my_meta_templets`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      Swal.close()

      if (res.data.success) {
        const metaTemplates = res.data.data
        const matchingTemplate = metaTemplates.find((t) => t.name === template.title)

        if (matchingTemplate) {
          Swal.fire(
            "Template Status",
            `Status: ${matchingTemplate.status}\n${matchingTemplate.status === "REJECTED" ? `Reason: ${matchingTemplate.rejection_reason}` : ""}`,
            "info",
          )
        } else {
          Swal.fire("Not Found", "Template not found on Meta", "warning")
        }
      } else {
        Swal.fire("Error", res.data.msg || "Failed to check template status", "error")
      }
    } catch (err) {
      console.error("Error checking status:", err)
      Swal.fire("Error", "Failed to check template status", "error")
    }
  }

  const handleSendTemplate = async (template) => {
    const { value: formValues } = await Swal.fire({
      title: "Send Template Message",
      html:
        `<input id="swal-input1" class="swal2-input" placeholder="Recipient Number (with country code)">` +
        `<div id="dynamic-inputs">
          <p>Dynamic Values (if any):</p>
        </div>`,
      focusConfirm: false,
      didOpen: () => {
        // Find body component to check for dynamic values
        const bodyComponent = template.contentData?.components?.find((c) => c.type === "BODY")
        if (bodyComponent && bodyComponent.text) {
          // Look for {{1}}, {{2}}, etc. in the text
          const dynamicValues = bodyComponent.text.match(/{{[0-9]+}}/g)
          if (dynamicValues && dynamicValues.length > 0) {
            const dynamicInputsContainer = document.getElementById("dynamic-inputs")
            dynamicValues.forEach((val, index) => {
              const input = document.createElement("input")
              input.id = `dynamic-value-${index + 1}`
              input.className = "swal2-input"
              input.placeholder = `Value for ${val}`
              dynamicInputsContainer.appendChild(input)
            })
          }
        }
      },
      preConfirm: () => {
        const values = {
          toNumber: document.getElementById("swal-input1").value,
          dynamicValues: [],
        }

        // Collect dynamic values if any
        const dynamicInputs = document.querySelectorAll('[id^="dynamic-value-"]')
        dynamicInputs.forEach((input) => {
          values.dynamicValues.push(input.value)
        })

        return values
      },
    })

    if (formValues && formValues.toNumber) {
      try {
        Swal.fire({
          title: "Sending",
          text: "Sending template message...",
          allowOutsideClick: false,
          didOpen: () => Swal.showLoading(),
        })

        // Get the template from Meta
        const metaTemplatesRes = await axios.get(`${BASE_URL}/api/user/get_my_meta_templets`, {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (!metaTemplatesRes.data.success) {
          Swal.close()
          return Swal.fire("Error", "Failed to get templates from Meta", "error")
        }

        const metaTemplates = metaTemplatesRes.data.data
        const matchingTemplate = metaTemplates.find((t) => t.name === template.title)

        if (!matchingTemplate) {
          Swal.close()
          return Swal.fire("Not Found", "Template not found on Meta or not approved yet", "warning")
        }

        // Send the template message
        const res = await axios.post(
          `${BASE_URL}/api/send_template_message`,
          {
            toNumber: formValues.toNumber,
            template: matchingTemplate,
            example: formValues.dynamicValues,
          },
          { headers: { Authorization: `Bearer ${token}` } },
        )

        Swal.close()

        if (res.data.success) {
          Swal.fire("Success", "Template message sent successfully", "success")
        } else {
          Swal.fire("Error", res.data.msg || "Failed to send template message", "error")
        }
      } catch (err) {
        console.error("Error sending template:", err)
        Swal.fire("Error", "Failed to send template message", "error")
      }
    }
  }

  const handleDeleteSelected = async () => {
    if (selectedTemplates.length === 0) {
      return Swal.fire("Info", "No templates selected", "info")
    }

    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete them!",
      cancelButtonText: "No, cancel",
    })

    if (result.isConfirmed) {
      try {
        Swal.fire({
          title: "Deleting",
          text: "Deleting selected templates...",
          allowOutsideClick: false,
          didOpen: () => Swal.showLoading(),
        })

        const res = await axios.post(
          `${BASE_URL}/api/templet/del_templets`,
          { selected: selectedTemplates },
          { headers: { Authorization: `Bearer ${token}` } },
        )

        Swal.close()

        if (res.data.success) {
          Swal.fire("Deleted!", "Templates have been deleted.", "success")
          setSelectedTemplates([])
          loadTemplates()
        } else {
          Swal.fire("Error", res.data.msg || "Failed to delete templates", "error")
        }
      } catch (err) {
        console.error("Error deleting templates:", err)
        Swal.fire("Error", "Failed to delete templates", "error")
      }
    }
  }

  const handleDeleteMetaTemplate = async (template) => {
    const result = await Swal.fire({
      title: "Delete from Meta?",
      text: "This will delete the template from Meta's platform",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it",
      cancelButtonText: "No, cancel",
    })

    if (result.isConfirmed) {
      try {
        Swal.fire({
          title: "Deleting",
          text: "Deleting template from Meta...",
          allowOutsideClick: false,
          didOpen: () => Swal.showLoading(),
        })

        const res = await axios.post(
          `${BASE_URL}/api/del_meta_templet`,
          { name: template.title },
          { headers: { Authorization: `Bearer ${token}` } },
        )

        Swal.close()

        if (res.data.success) {
          Swal.fire("Deleted!", "Template has been deleted from Meta.", "success")
          loadTemplates()
        } else {
          Swal.fire("Error", res.data.msg || "Failed to delete template from Meta", "error")
        }
      } catch (err) {
        console.error("Error deleting from Meta:", err)
        Swal.fire("Error", "Failed to delete template from Meta", "error")
      }
    }
  }

  // Render a WhatsApp-style preview bubble
  const renderPreview = () => {
    const bodyComp = components.find((c) => c.type === "BODY")
    const footerComp = components.find((c) => c.type === "FOOTER")
    const headerComp = components.find((c) => c.type === "HEADER")
    const buttonsComps = components.filter((c) => c.type === "BUTTONS")

    return (
      <div className="whatsapp-bubble">
        {headerComp && (
          <div className="bubble-section">
            {headerComp.format === "IMAGE" && (
              <div className="attachment">
                {mediaUrl ? (
                  <img src={mediaUrl || "/placeholder.svg"} alt="Header" className="attachment-thumbnail" />
                ) : (
                  <span className="text-muted">Image Placeholder</span>
                )}
              </div>
            )}
            {headerComp.format === "VIDEO" && (
              <div className="attachment">
                <span className="text-muted">Video Placeholder</span>
              </div>
            )}
            {headerComp.format === "DOCUMENT" && (
              <div className="attachment">
                <span className="text-muted">Document Attachment</span>
              </div>
            )}
          </div>
        )}

        {bodyComp && <div className="bubble-section">{bodyComp.text}</div>}

        {buttonsComps.length > 0 && (
          <div className="buttons-section">
            {buttonsComps.map((btn, index) => (
              <button key={index} className="preview-button">
                {btn.text || "Button"}
              </button>
            ))}
          </div>
        )}

        {footerComp && <div className="bubble-section footer-section">{footerComp.text}</div>}

        <div className="time-section">{new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</div>
      </div>
    )
  }

  return (
    <div className="container-fluid py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="h3">Manage Meta Templates</h1>
        <div className="d-flex gap-2">
          <button className="btn btn-danger" onClick={handleDeleteSelected} disabled={selectedTemplates.length === 0}>
            <FaTrash className="me-2" />
            Delete Selected
          </button>
          <button className="btn btn-primary" onClick={openAddModal}>
            <FaPlusCircle className="me-2" />
            Add New Template
          </button>
        </div>
      </div>

      <div className="card">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-striped table-hover mb-0">
              <thead>
                <tr>
                  <th width="40">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      checked={templates.length > 0 && selectedTemplates.length === templates.length}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedTemplates(templates.map((t) => t.id))
                        } else {
                          setSelectedTemplates([])
                        }
                      }}
                    />
                  </th>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Language</th>
                  <th>Category</th>
                  <th>Status</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} className="text-center py-4">
                      <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                    </td>
                  </tr>
                ) : templates.length > 0 ? (
                  templates.map((tmpl) => (
                    <tr key={tmpl.id}>
                      <td>
                        <input
                          type="checkbox"
                          className="form-check-input"
                          checked={selectedTemplates.includes(tmpl.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedTemplates([...selectedTemplates, tmpl.id])
                            } else {
                              setSelectedTemplates(selectedTemplates.filter((id) => id !== tmpl.id))
                            }
                          }}
                        />
                      </td>
                      <td>{tmpl.id}</td>
                      <td>{tmpl.title}</td>
                      <td>{tmpl.contentData?.language || "en"}</td>
                      <td>{tmpl.contentData?.category || "MARKETING"}</td>
                      <td>
                        <span
                          className={`badge ${tmpl.status === "APPROVED" ? "bg-success" : tmpl.status === "REJECTED" ? "bg-danger" : "bg-warning"}`}
                        >
                          {tmpl.status || "Draft"}
                        </span>
                      </td>
                      <td>
                        <div className="d-flex justify-content-end gap-2">
                          <button
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => handleSubmitToMeta(tmpl)}
                            title="Submit to Meta"
                          >
                            <FaCheckCircle />
                          </button>
                          <button
                            className="btn btn-sm btn-outline-info"
                            onClick={() => handleCheckStatus(tmpl)}
                            title="Check Status"
                          >
                            <FaSync />
                          </button>
                          <button
                            className="btn btn-sm btn-outline-success"
                            onClick={() => handleSendTemplate(tmpl)}
                            title="Send Template"
                          >
                            <FaPaperPlane />
                          </button>
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => handleDeleteMetaTemplate(tmpl)}
                            title="Delete from Meta"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="text-center py-4">
                      No templates found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add Template Modal */}
      {showAddModal && <div className="modal-backdrop show" style={{ display: "block" }}></div>}

      <div className={`modal ${showAddModal ? "d-block" : "d-none"} custom-template-modal`} tabIndex="-1">
        <div className="modal-dialog modal-xl modal-dialog-scrollable">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Add New Template</h5>
              <button type="button" className="btn-close" onClick={closeAddModal}></button>
            </div>
            <div className="modal-body">
              <div className="row">
                {/* Form Side */}
                <div className="col-md-7">
                  <div className="mb-3">
                    <label htmlFor="templateName" className="form-label">
                      Template Name
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="templateName"
                      value={templateName}
                      onChange={(e) => setTemplateName(e.target.value)}
                      placeholder="Enter template name"
                    />
                  </div>

                  <div className="row mb-3">
                    <div className="col-md-6">
                      <label htmlFor="language" className="form-label">
                        Language
                      </label>
                      <select
                        className="form-select"
                        id="language"
                        value={language}
                        onChange={(e) => setLanguage(e.target.value)}
                      >
                        <option value="en">English</option>
                        <option value="es">Spanish</option>
                        <option value="pt_BR">Portuguese</option>
                        <option value="fr">French</option>
                      </select>
                    </div>

                    <div className="col-md-6">
                      <label htmlFor="category" className="form-label">
                        Category
                      </label>
                      <select
                        className="form-select"
                        id="category"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                      >
                        <option value="MARKETING">Marketing</option>
                        <option value="UTILITY">Utility</option>
                        <option value="AUTHENTICATION">Authentication</option>
                      </select>
                    </div>
                  </div>

                  <div className="mb-3">
                    <label htmlFor="componentType" className="form-label">
                      Component Type
                    </label>
                    <select
                      className="form-select"
                      id="componentType"
                      value={componentType}
                      onChange={(e) => setComponentType(e.target.value)}
                    >
                      <option value="HEADER">Header</option>
                      <option value="BODY">Body</option>
                      <option value="FOOTER">Footer</option>
                      <option value="BUTTONS">Buttons</option>
                    </select>
                  </div>

                  {componentType === "HEADER" && (
                    <div className="mb-3">
                      <label htmlFor="mediaType" className="form-label">
                        Media Type
                      </label>
                      <select
                        className="form-select mb-2"
                        id="mediaType"
                        value={mediaType}
                        onChange={(e) => setMediaType(e.target.value)}
                      >
                        <option value="IMAGE">Image</option>
                        <option value="VIDEO">Video</option>
                        <option value="DOCUMENT">Document</option>
                      </select>

                      <label htmlFor="fileUpload" className="form-label">
                        Upload Media
                      </label>
                      <input type="file" className="form-control" id="fileUpload" onChange={handleFileUpload} />
                      <small className="form-text text-muted">Supported formats: JPG, PNG, PDF, MP4 (max 5MB)</small>
                    </div>
                  )}

                  {componentType !== "HEADER" && (
                    <div className="mb-3">
                      <label htmlFor="componentText" className="form-label">
                        Component Text
                      </label>
                      <textarea
                        className="form-control"
                        id="componentText"
                        rows="4"
                        value={componentText}
                        onChange={(e) => setComponentText(e.target.value)}
                        placeholder="Enter component text"
                      ></textarea>
                      <small className="form-text text-muted">
                        Use &#123;&#123;1&#125;&#125;, &#123;&#123;2&#125;&#125;, etc. for dynamic variables
                      </small>
                    </div>
                  )}

                  <button type="button" className="btn btn-secondary w-100 mb-4" onClick={handleAddComponent}>
                    Add/Update Component
                  </button>

                  <div className="card mb-3">
                    <div className="card-header">
                      <h6 className="mb-0">Current Components</h6>
                    </div>
                    <ul className="list-group list-group-flush">
                      {components.map((comp, index) => (
                        <li key={index} className="list-group-item d-flex justify-content-between align-items-center">
                          <span>
                            <strong>{comp.type}</strong>: {comp.text || (comp.format ? `${comp.format} media` : "")}
                          </span>
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => {
                              setComponents(components.filter((_, i) => i !== index))
                            }}
                          >
                            <FaTrash />
                          </button>
                        </li>
                      ))}
                      {components.length === 0 && (
                        <li className="list-group-item text-muted">No components added yet</li>
                      )}
                    </ul>
                  </div>
                </div>

                {/* Preview Side */}
                <div className="col-md-5">
                  <div className="card bg-light">
                    <div className="card-header text-center">
                      <h6 className="mb-0">Template Preview</h6>
                    </div>
                    <div className="card-body">
                      <div className="smartphone-preview w-100">
                        <div className="preview-box">
                          <div className="position-absolute top-0 start-50 translate-middle-x mt-2">
                            <FaCircleDot className="text-dark" />
                          </div>
                          {renderPreview()}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={closeAddModal}>
                Cancel
              </button>
              <button type="button" className="btn btn-primary" onClick={handleSaveTemplate}>
                Save Template
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

