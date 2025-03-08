"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import Swal from "sweetalert2"
import { FaPlus, FaTrash } from "react-icons/fa"
import "../Styles/templatemanager.css"
import BASE_URL from "../../BaseUrl"

const TemplateManager = () => {
  const [showModal, setShowModal] = useState(false)
  const [templates, setTemplates] = useState([])
  const [selectedTemplates, setSelectedTemplates] = useState([])
  const [formData, setFormData] = useState({
    title: "",
    type: "text",
    content: {},
  })

  // Fetch templates from the backend
  useEffect(() => {
    fetchTemplates()
  }, [])

  const fetchTemplates = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/templet/get_templets`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("userToken")}` },
      })
      if (res.data.success) {
        setTemplates(res.data.data)
      }
    } catch (err) {
      console.error("Error fetching templates:", err)
    }
  }

  const handleAddNew = () => {
    setFormData({ title: "", type: "text", content: {} })
    setShowModal(true)
  }

  const handleDeleteSelected = async () => {
    if (selectedTemplates.length === 0) {
      Swal.fire("Warning!", "No templates selected for deletion.", "warning")
      return
    }

    const confirm = await Swal.fire({
      title: "Are you sure?",
      text: "Selected templates will be deleted permanently.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete them!",
    })

    if (confirm.isConfirmed) {
      try {
        await axios.post(
          `${BASE_URL}/api/templet/del_templets`,
          { selected: selectedTemplates },
          { headers: { Authorization: `Bearer ${localStorage.getItem("userToken")}` } }
        )
        fetchTemplates()
        setSelectedTemplates([])
        Swal.fire("Deleted!", "Selected templates have been deleted.", "success")
      } catch (err) {
        console.error("Error deleting templates:", err)
        Swal.fire("Error!", "Failed to delete templates.", "error")
      }
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  const handleContentChange = (e) => {
    try {
      const content = JSON.parse(e.target.value)
      setFormData({ ...formData, content })
    } catch (error) {
      // Handle JSON parse error silently
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await axios.post(`${BASE_URL}/api/templet/add_new`, formData, {
        headers: { Authorization: `Bearer ${localStorage.getItem("userToken")}` },
      })
      fetchTemplates()
      setShowModal(false)
      Swal.fire("Success!", "Template has been added successfully.", "success")
    } catch (err) {
      console.error("Error saving template:", err)
      Swal.fire("Error!", "Failed to save template. Please try again.", "error")
    }
  }

  return (
    <div className="template-manager-container">
      {/* Header Section */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3>Template Manager</h3>
        <div>
          <button className="btn btn-danger me-2" onClick={handleDeleteSelected}>
            <FaTrash /> Delete Selected
          </button>
          <button className="btn btn-primary" onClick={handleAddNew}>
            <FaPlus /> Add New
          </button>
        </div>
      </div>

      {/* Template List */}
      <table className="table table-striped table-hover">
        <thead className="table-dark">
          <tr>
            <th>
              <input
                type="checkbox"
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
            <th>Title</th>
            <th>Type</th>
            <th>Content</th>
          </tr>
        </thead>
        <tbody>
          {templates.length === 0 ? (
            <tr>
              <td colSpan="5" className="text-center">No templates available</td>
            </tr>
          ) : (
            templates.map((template) => (
              <tr key={template.id}>
                <td>
                  <input
                    type="checkbox"
                    checked={selectedTemplates.includes(template.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedTemplates([...selectedTemplates, template.id])
                      } else {
                        setSelectedTemplates(selectedTemplates.filter((id) => id !== template.id))
                      }
                    }}
                  />
                </td>
                <td>{template.id}</td>
                <td>{template.title}</td>
                <td>{template.type}</td>
                <td>
                  <pre className="mb-0">{JSON.stringify(JSON.parse(template.content), null, 2)}</pre>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* Template Modal */}
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
                    <select className="form-select" name="type" value={formData.type} onChange={handleChange} required>
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
                      Save
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default TemplateManager
