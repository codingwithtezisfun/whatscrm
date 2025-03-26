"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import Swal from "sweetalert2"
import { FaArrowRight, FaTrash, FaEdit } from "react-icons/fa"
import BASE_URL from "../../BaseUrl"
import "../Styles/autochatbot.css"

const AutoChatbot = () => {
  const token = typeof window !== "undefined" ? localStorage.getItem("userToken") : null

  // ---------------------------
  // States
  // ---------------------------
  const [flows, setFlows] = useState([])
  const [selectedFlows, setSelectedFlows] = useState([])
  const [loadingFlows, setLoadingFlows] = useState(true)
  const [errorFlows, setErrorFlows] = useState("")

  const [selectedFlowDetails, setSelectedFlowDetails] = useState(null)
  const [chatbots, setChatbots] = useState([])
  const [isEditing, setIsEditing] = useState(false)
  const [editingId, setEditingId] = useState(null)

  const [contacts, setContacts] = useState([])
  const [selectedContacts, setSelectedContacts] = useState([])

  const [formData, setFormData] = useState({
    title: "",
    chats: "",
    for_all: false,
    flow: null,
    id: null,
  })

  // ---------------------------
  // Fetch flows, chatbots & contacts on mount
  // ---------------------------
  useEffect(() => {
    fetchFlows()
    fetchChatbots()
    fetchContacts()
  }, [])

  const fetchFlows = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/api/chat_flow/get_mine`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (response.data.success) {
        setFlows(response.data.data)
      }
      setLoadingFlows(false)
    } catch (err) {
      setErrorFlows("Failed to load flows")
      setLoadingFlows(false)
    }
  }

  const fetchChatbots = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/chatbot/get_chatbot`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.data.success) {
        console.log("Fetched chatbots:", res.data.data)
        setChatbots(res.data.data)
      }
    } catch (err) {
      console.error("Error fetching chatbots:", err)
    }
  }

  const fetchContacts = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/phonebook/get_uid_contacts`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.data.success) {
        setContacts(res.data.data)
      }
    } catch (err) {
      console.error("Error fetching contacts:", err)
    }
  }

  // ---------------------------
  // Flow Selection for Chatbot
  // ---------------------------
  const handleSelectFlowForChatbot = (flow) => {
    console.log("Flow selected:", flow)

    const selectedFlow = {
      id: flow.id,
      uid: flow.uid,
      flow_id: flow.flow_id,
      title: flow.title,
      createdAt: flow.createdAt || flow.created_at || new Date().toISOString(),
    }

    console.log("Constructed selectedFlow object:", selectedFlow)

    setFormData((prevData) => {
      const updatedData = { ...prevData, flow: selectedFlow }
      console.log("Updated form data:", updatedData)
      return updatedData
    })

    fetchFlowDetails(flow.flow_id)
  }

  const fetchFlowDetails = async (flowId) => {
    try {
      const res = await axios.post(
        `${BASE_URL}/api/chat_flow/get_by_flow_id`,
        { flowId },
        { headers: { Authorization: `Bearer ${token}` } },
      )
      if (res.data.success) {
        console.log("Flow details fetched:", res.data)
        setSelectedFlowDetails(res.data)
        
        setTimeout(() => {
          window.scrollTo({ top: 0, behavior: "smooth" });
        }, 100);
        
      } else {
        console.log("No flow details returned from API")
        setSelectedFlowDetails(null)
      }
    } catch (err) {
      console.error("Error fetching flow details:", err)
      setSelectedFlowDetails(null)
    }
  }

  // ---------------------------
  // Multi-Select & Delete Flows
  // ---------------------------
  const handleCheckboxChange = (flowId) => {
    setSelectedFlows((prev) => (prev.includes(flowId) ? prev.filter((id) => id !== flowId) : [...prev, flowId]))
  }

  const handleDeleteSelectedFlows = async () => {
    if (selectedFlows.length === 0) return

    const confirmResult = await Swal.fire({
      title: "Delete Selected Flows?",
      text: `Are you sure you want to delete ${selectedFlows.length} flow(s)?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete them!",
    })
    if (!confirmResult.isConfirmed) return

    try {
      await Promise.all(
        selectedFlows.map(async (flowId) => {
          const flowToDelete = flows.find((f) => f.flow_id === flowId)
          if (flowToDelete) {
            await axios.post(
              `${BASE_URL}/api/chat_flow/del_flow`,
              { id: flowToDelete.id, flowId: flowToDelete.flow_id },
              { headers: { Authorization: `Bearer ${token}` } },
            )
          }
        }),
      )
      setFlows((prev) => prev.filter((f) => !selectedFlows.includes(f.flow_id)))
      setSelectedFlows([])
      Swal.fire("Deleted!", "Selected flows have been deleted.", "success")
    } catch (err) {
      console.error("Failed to delete flows:", err)
      Swal.fire("Error!", "Failed to delete flows.", "error")
    }
  }

  // ---------------------------
  // Chatbot Creation / Update
  // ---------------------------
  const handleTitleChange = (e) => {
    setFormData({ ...formData, title: e.target.value })
  }

  const handleToggleForAll = () => {
    const newForAll = !formData.for_all
    setFormData({ ...formData, for_all: newForAll })

    if (newForAll) {
      // If turning on for all chats, populate with all contact mobiles
      const allMobiles = contacts.map((contact) => contact.mobile).join(", ")
      setFormData((prev) => ({ ...prev, chats: allMobiles }))
      setSelectedContacts(contacts.map((contact) => contact.id))
    } else {
      // If turning off, clear the chats
      setFormData((prev) => ({ ...prev, chats: "" }))
      setSelectedContacts([])
    }
  }

  const handleContactSelection = (contactId) => {
    setSelectedContacts((prev) => {
      const newSelection = prev.includes(contactId) ? prev.filter((id) => id !== contactId) : [...prev, contactId]

      const selectedMobiles = contacts
        .filter((contact) => newSelection.includes(contact.id))
        .map((contact) => contact.mobile)
        .join(", ")

      setFormData((prevData) => ({ ...prevData, chats: selectedMobiles }))
      return newSelection
    })
  }

  const resetForm = () => {
    setFormData({
      title: "",
      chats: "",
      for_all: false,
      flow: null,
      id: null,
    })
    setSelectedFlowDetails(null)
    setIsEditing(false)
    setEditingId(null)
    setSelectedContacts([])
  }

  const handleSaveChatbot = async () => {
    console.log("=== SAVE CHATBOT TRIGGERED ===")
    console.log("Current form data:", formData)

    if (!formData.title) {
      console.log("Form validation failed - missing title")
      Swal.fire("Error!", "Please provide a title for the chatbot.", "error")
      return
    }

    if (!formData.flow) {
      console.log("Form validation failed - missing flow")
      Swal.fire("Error!", "Please select a flow for the chatbot.", "error")
      return
    }

    const chatsArray = formData.chats
      .split(",")
      .map((item) => item.trim())
      .filter((item) => item)

    if (chatsArray.length === 0) {
      console.log("Form validation failed - no chats selected")
      Swal.fire("Error!", "Please select at least one contact or turn on for all chats.", "error")
      return
    }

    const payload = {
      title: formData.title,
      chats: chatsArray,
      for_all: formData.for_all,
      flow: {
        id: formData.flow.id,
        uid: formData.flow.uid,
        flow_id: formData.flow.flow_id,
        title: formData.flow.title,
      },
    }

    console.log("Final payload:", payload)

    try {
      const endpoint = isEditing ? "update_chatbot" : "add_chatbot"
      const response = await axios.post(
        `${BASE_URL}/api/chatbot/${endpoint}`,
        isEditing ? { ...payload, id: editingId } : payload,
        { headers: { Authorization: `Bearer ${token}` } },
      )

      console.log("API Response:", response.data)

      if (response.data.success) {
        Swal.fire("Success!", `Chatbot has been ${isEditing ? "updated" : "added"}.`, "success")
        fetchChatbots()
        resetForm()
      } else {
        throw new Error(response.data.msg || "Unknown error occurred")
      }
    } catch (err) {
      console.error("Error saving chatbot:", err)
      console.error("Error details:", err.response?.data || err.message)
      Swal.fire("Error!", `Failed to ${isEditing ? "update" : "save"} chatbot: ${err.message}`, "error")
    }
  }

  const handleEditChatbot = (bot) => {
    console.log("=== EDITING CHATBOT ===")
    console.log("Original bot data:", bot)

    // Parse the flow JSON if it's a string
    let flowData = bot.flow
    if (typeof flowData === "string") {
      try {
        console.log("Flow is a string, attempting to parse:", flowData)
        flowData = JSON.parse(flowData)
        console.log("Parsed flow data:", flowData)
      } catch (e) {
        console.error("Error parsing flow data:", e)
        flowData = { id: "", title: "" }
      }
    } else {
      console.log("Flow is already an object:", flowData)
    }

    // Parse the chats JSON if it's a string
    let chatsData = bot.chats
    if (typeof chatsData === "string") {
      try {
        console.log("Chats is a string, attempting to parse:", chatsData)
        chatsData = JSON.parse(chatsData)
        console.log("Parsed chats data:", chatsData)
      } catch (e) {
        console.error("Error parsing chats data:", e)
        chatsData = []
      }
    } else {
      console.log("Chats is already an object:", chatsData)
    }

    const formDataToSet = {
      title: bot.title,
      chats: Array.isArray(chatsData) ? chatsData.join(", ") : "",
      for_all: bot.for_all === 1,
      flow: flowData,
      id: bot.id,
    }

    console.log("Setting form data to:", formDataToSet)
    setFormData(formDataToSet)

    setIsEditing(true)
    setEditingId(bot.id)

    // Set selected contacts based on the chats data
    const selectedMobiles = Array.isArray(chatsData) ? chatsData : []
    const selectedContactIds = contacts
      .filter((contact) => selectedMobiles.includes(contact.mobile))
      .map((contact) => contact.id)
    setSelectedContacts(selectedContactIds)

    // If we have a flow, try to get its details
    if (flowData && flowData.flow_id) {
      const matchingFlow = flows.find((f) => f.id === flowData.id || f.flow_id === flowData.flow_id)
      if (matchingFlow) {
        handleSelectFlowForChatbot(matchingFlow)
      }
    }
    
  // Scroll to the top of the page
  window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const handleDeleteChatbot = async (id) => {
    const confirmResult = await Swal.fire({
      title: "Are you sure?",
      text: "This will delete the chatbot.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    })
    if (!confirmResult.isConfirmed) return

    try {
      await axios.post(`${BASE_URL}/api/chatbot/del_chatbot`, { id }, { headers: { Authorization: `Bearer ${token}` } })
      fetchChatbots()
      Swal.fire("Deleted!", "Chatbot has been deleted.", "success")
    } catch (err) {
      console.error("Error deleting chatbot:", err)
      Swal.fire("Error!", "Failed to delete chatbot.", "error")
    }
  }

  // ---------------------------
  // Toggle Chatbot Active Status
  // ---------------------------
  const handleToggleActive = async (id, currentStatus) => {
    try {
      await axios.post(
        `${BASE_URL}/api/chatbot/change_bot_status`,
        { id, status: !currentStatus },
        { headers: { Authorization: `Bearer ${token}` } },
      )
      fetchChatbots()
      Swal.fire("Success!", `Chatbot is now ${!currentStatus ? "active" : "inactive"}.`, "success")
    } catch (err) {
      console.error("Error toggling chatbot status:", err)
      Swal.fire("Error!", "Failed to update chatbot status.", "error")
    }
  }

  // ---------------------------
  // Render
  // ---------------------------
  if (loadingFlows)
    return (
      <div className="d-flex justify-content-center p-5">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    )
  if (errorFlows) return <div className="alert alert-danger m-3">{errorFlows}</div>

  return (
    <div className="container-fluid py-3">
      {/* Chatbot Form Section */}
      <div className="card mb-4">
        <div className="card-header bg-primary text-white">
          <h4>{isEditing ? "Edit Chatbot" : "Create New Chatbot"}</h4>
        </div>
        <div className="card-body">
          <div className="row mb-4">
            <div className="col-md-6 d-flex align-items-center">
              <label htmlFor="chatbotTitle" className="me-2">
                Chatbot Title
              </label>
              <input
                id="chatbotTitle"
                type="text"
                className="form-control w-50"
                placeholder="Enter chatbot title"
                value={formData.title}
                onChange={handleTitleChange}
              />
            </div>
            <div className="col-md-6 d-flex align-items-center justify-content-md-end mt-2 mt-md-0">
              <span className="me-2">Turn on for all chats</span>
              <div className="form-check form-switch">
                <input
                  className="form-check-input"
                  type="checkbox"
                  role="switch"
                  checked={formData.for_all}
                  onChange={handleToggleForAll}
                />
              </div>
            </div>
          </div>

          {/* Contacts Selection */}
          {!formData.for_all && (
            <div className="mb-3">
              <label className="form-label">Select Contacts</label>
              <div className="row">
                {contacts.map((contact) => (
                  <div key={contact.id} className="col-md-4 mb-2">
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id={`contact-${contact.id}`}
                        checked={selectedContacts.includes(contact.id)}
                        onChange={() => handleContactSelection(contact.id)}
                      />
                      <label className="form-check-label" htmlFor={`contact-${contact.id}`}>
                        {contact.name} ({contact.mobile})
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Selected Chats Display */}
          <div className="mb-3">
            <label className="form-label">Selected Chats</label>
            <input type="text" className="form-control" value={formData.chats} readOnly />
          </div>

          {/* Selected Flow Display */}
          <div className="mb-3">
            <label className="form-label">Selected Flow</label>
            <div>
              {formData.flow ? (
                <div className="card selected-flow-card">
                  <div className="card-body">
                    <h5 className="card-title">{formData.flow.title}</h5>
                    <p className="card-text">Flow ID: {formData.flow.id}</p>
                    <p className="card-text">Flow UID: {formData.flow.uid}</p>
                    <p className="card-text">Created: {new Date(formData.flow.createdAt).toLocaleString()}</p>
                    {selectedFlowDetails && (
                      <p>
                        <small>
                          Nodes: {selectedFlowDetails.nodes?.length || 0} | Edges:{" "}
                          {selectedFlowDetails.edges?.length || 0}
                        </small>
                      </p>
                    )}
                    <button
                      type="button"
                      className="btn btn-sm btn-danger"
                      onClick={() => {
                        setFormData((prev) => ({ ...prev, flow: null }))
                        setSelectedFlowDetails(null)
                      }}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ) : (
                <p>No flow selected. Please select one from below.</p>
              )}
            </div>
          </div>

          <div className="d-flex gap-2">
            <button className="btn btn-primary" onClick={handleSaveChatbot}>
              <FaArrowRight className="me-2" />
              {isEditing ? "Update Chatbot" : "Save Chatbot"}
            </button>

            {isEditing && (
              <button className="btn btn-secondary" onClick={resetForm}>
                Cancel
              </button>
            )}
          </div>
        </div>
      </div>

      <hr />

      {/* Flow Manager Section */}
      <div className="card mb-4">
        <div className="card-header bg-info text-white">
          <div className="d-flex justify-content-between align-items-center">
            <h5 className="mb-0">Select a Flow (Click card to associate with chatbot)</h5>
            {selectedFlows.length > 0 && (
              <button className="btn btn-danger" onClick={handleDeleteSelectedFlows}>
                <FaTrash className="me-1" />
                Delete Selected ({selectedFlows.length})
              </button>
            )}
          </div>
        </div>
        <div className="card-body">
          {/* Display flows in cards with checkboxes */}
          {flows.length === 0 ? (
            <p>No flows found.</p>
          ) : (
            <div className="row">
              {flows.map((flow) => {
                const isSelectedForChatbot =
                  formData.flow && (flow.id === formData.flow.id || flow.flow_id === formData.flow.flow_id)
                const isCheckedForDeletion = selectedFlows.includes(flow.flow_id)
                return (
                  <div className="col-md-4 col-lg-3 mb-3" key={flow.flow_id}>
                    <div
                      className={`card h-100 ${formData.flow?.id === flow.id ? "border-success" : ""}`}
                      style={{ cursor: "pointer" }}
                      onClick={() => handleSelectFlowForChatbot(flow)}
                    >
                      <div className="card-body">
                        <h5 className="card-title">{flow.title}</h5>
                        <p className="card-text text-muted mb-0">Flow ID: {flow.flow_id}</p>
                        <p className="card-text text-muted mb-0">
                          Created: {new Date(flow.createdAt || flow.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="card-footer">
                        <div className="form-check">
                          <input
                            type="checkbox"
                            className="form-check-input"
                            checked={isCheckedForDeletion}
                            onChange={(e) => {
                              e.stopPropagation()
                              handleCheckboxChange(flow.flow_id)
                            }}
                          />
                          <label className="form-check-label">Select for deletion</label>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      <hr />

      {/* Chatbot List Section */}
      <div className="card mt-4">
        <div className="card-header bg-dark text-white">
          <h4 className="mb-0">Chatbot List</h4>
        </div>
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-striped">
              <thead className="table-dark">
                <tr>
                  <th>ID</th>
                  <th>Title</th>
                  <th>Flow Title</th>
                  <th>Active</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {chatbots.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center">
                      No chatbots found
                    </td>
                  </tr>
                ) : (
                  chatbots.map((bot) => {
                    // Parse flow data if it's a string
                    let flowData = bot.flow
                    if (typeof flowData === "string") {
                      try {
                        flowData = JSON.parse(flowData)
                      } catch (e) {
                        flowData = { title: "N/A" }
                      }
                    }

                    const isActive = bot.active === 1

                    return (
                      <tr key={bot.id}>
                        <td>{bot.id}</td>
                        <td>{bot.title}</td>
                        <td>{flowData?.title || "N/A"}</td>
                        <td>
                          <div className="form-check form-switch">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              role="switch"
                              checked={isActive}
                              onChange={() => handleToggleActive(bot.id, isActive)}
                            />
                          </div>
                        </td>
                        <td>
                          <div className="d-flex gap-2">
                            <button
                              className="btn btn-sm btn-primary"
                              onClick={() => handleEditChatbot(bot)}
                              title="Edit"
                            >
                              <FaEdit />
                            </button>
                            <button
                              className="btn btn-sm btn-danger"
                              onClick={() => handleDeleteChatbot(bot.id)}
                              title="Delete"
                            >
                              <FaTrash />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AutoChatbot

