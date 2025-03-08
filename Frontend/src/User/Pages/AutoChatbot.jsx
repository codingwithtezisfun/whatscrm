"use client"

import React, { useState, useEffect } from "react"
import axios from "axios"
import Swal from "sweetalert2"
import { FaPlus, FaTrash, FaArrowRight } from "react-icons/fa"
// Optionally import FaEdit if you want to edit chatbots in a modal
// import { FaEdit } from "react-icons/fa"
import BASE_URL from "../../BaseUrl"
import "../Styles/autochatbot.css"

const AutoChatbot = () => {
  // ---------------------------
  //   States
  // ---------------------------
  const token = localStorage.getItem("userToken")

  // For flows
  const [flows, setFlows] = useState([])
  const [selectedFlows, setSelectedFlows] = useState([]) // For multi-delete
  const [loadingFlows, setLoadingFlows] = useState(true)
  const [errorFlows, setErrorFlows] = useState("")

  // For selected single flow’s details
  const [selectedFlowDetails, setSelectedFlowDetails] = useState(null)

  // For chatbots
  const [chatbots, setChatbots] = useState([])

  // Chatbot form data
  const [formData, setFormData] = useState({
    title: "",
    for_all: false,
    flow: { flow_id: "", title: "" },
  })

  // ---------------------------
  //   Fetch flows & chatbots
  // ---------------------------
  useEffect(() => {
    fetchFlows()
    fetchChatbots()
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
        setChatbots(res.data.data)
      }
    } catch (err) {
      console.error("Error fetching chatbots:", err)
    }
  }

  // ---------------------------
  //   Flow Selection for Chatbot
  // ---------------------------
  // Clicking the card body to select a single flow for the chatbot
  const handleSelectFlowForChatbot = async (flow) => {
    setFormData({
      ...formData,
      flow: { flow_id: flow.flow_id, title: flow.title },
    })

    try {
      const res = await axios.post(
        `${BASE_URL}/api/chat_flow/get_by_flow_id`,
        { flowId: flow.flow_id },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      if (res.data.success) {
        setSelectedFlowDetails({
          title: flow.title,
          nodes: res.data.nodes,
          edges: res.data.edges,
        })
      } else {
        setSelectedFlowDetails(null)
      }
    } catch (err) {
      console.error("Error fetching flow details:", err)
      setSelectedFlowDetails(null)
    }
  }

  // ---------------------------
  //   Multi-Select & Delete Flows
  // ---------------------------
  // Checkbox selection
  const handleCheckboxChange = (flowId) => {
    setSelectedFlows((prev) =>
      prev.includes(flowId)
        ? prev.filter((id) => id !== flowId)
        : [...prev, flowId]
    )
  }

  // Delete selected flows
  const handleDeleteSelectedFlows = async () => {
    if (selectedFlows.length === 0) {
      return
    }

    const confirm = await Swal.fire({
      title: "Delete Selected Flows?",
      text: `Are you sure you want to delete ${selectedFlows.length} flow(s)?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete them!",
    })
    if (!confirm.isConfirmed) return

    try {
      // For each selected flow, call del_flow
      await Promise.all(
        selectedFlows.map(async (flowId) => {
          const flowToDelete = flows.find((f) => f.flow_id === flowId)
          await axios.post(
            `${BASE_URL}/api/chat_flow/del_flow`,
            { id: flowToDelete.id, flowId: flowToDelete.flow_id },
            { headers: { Authorization: `Bearer ${token}` } }
          )
        })
      )
      // Remove deleted flows from local state
      setFlows((prev) => prev.filter((f) => !selectedFlows.includes(f.flow_id)))
      setSelectedFlows([])
      Swal.fire("Deleted!", "Selected flows have been deleted.", "success")
    } catch (err) {
      console.error("Failed to delete flows:", err)
      Swal.fire("Error!", "Failed to delete flows.", "error")
    }
  }

  // ---------------------------
  //   Chatbot Creation / Update
  // ---------------------------
  const handleTitleChange = (e) => {
    setFormData({ ...formData, title: e.target.value })
  }

  const handleToggleForAll = () => {
    setFormData({ ...formData, for_all: !formData.for_all })
  }

  // Save the chatbot form data
  const handleSaveChatbot = async () => {
    // Example logic: call add_chatbot or update_chatbot
    const payload = {
      title: formData.title,
      chats: [], // If you have a conversation flow, fill in here
      flow: formData.flow,
      for_all: formData.for_all,
      isActive: true, // or however you handle the active state
    }

    try {
      // For demonstration, always "add_chatbot"
      await axios.post(`${BASE_URL}/api/chatbot/add_chatbot`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      })
      Swal.fire("Success!", "New chatbot has been added.", "success")
      fetchChatbots()
    } catch (err) {
      console.error("Error saving chatbot:", err)
      Swal.fire("Error!", "Failed to save chatbot.", "error")
    }
  }

  // ---------------------------
  //   Delete a Chatbot
  // ---------------------------
  const handleDeleteChatbot = async (id) => {
    const confirm = await Swal.fire({
      title: "Are you sure?",
      text: "This will delete the chatbot.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    })
    if (!confirm.isConfirmed) return

    try {
      await axios.post(
        `${BASE_URL}/api/chatbot/del_chatbot`,
        { id },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      fetchChatbots()
      Swal.fire("Deleted!", "Chatbot has been deleted.", "success")
    } catch (err) {
      console.error("Error deleting chatbot:", err)
      Swal.fire("Error!", "Failed to delete chatbot.", "error")
    }
  }

  // ---------------------------
  //   Render
  // ---------------------------
  if (loadingFlows) return <div>Loading flows...</div>
  if (errorFlows) return <div className="error">{errorFlows}</div>

  return (
    <div className="container-fluid py-3">
      {/* Top Row: Chatbot Title & "Turn on for all chats" */}
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

      {/* Flow Manager Section */}
      <div className="row mb-4">
        <div className="col-12 d-flex justify-content-between align-items-center">
          <h5>Select a Flow (Click card to associate with chatbot)</h5>
          {selectedFlows.length > 0 && (
            <button className="btn btn-danger" onClick={handleDeleteSelectedFlows}>
              <FaTrash className="me-1" />
              Delete Selected ({selectedFlows.length})
            </button>
          )}
        </div>
      </div>

      {/* Display flows in cards + checkboxes */}
      {flows.length === 0 ? (
        <p>No flows found.</p>
      ) : (
        <div className="row">
          {flows.map((flow) => {
            const isSelectedForChatbot = flow.flow_id === formData.flow.flow_id
            const isCheckedForDeletion = selectedFlows.includes(flow.flow_id)

            return (
              <div className="col-md-4 col-lg-3 mb-3" key={flow.flow_id}>
                <div
                  className={`card h-100 ${isSelectedForChatbot ? "border-success" : ""}`}
                  style={{ cursor: "pointer" }}
                >
                  {/* Card checkbox for multi-delete */}
                  <div className="d-flex align-items-center justify-content-end p-2">
                    <input
                      type="checkbox"
                      checked={isCheckedForDeletion}
                      onChange={() => handleCheckboxChange(flow.flow_id)}
                      style={{ cursor: "pointer", width: "18px", height: "18px" }}
                    />
                  </div>

                  {/* Card body for selecting flow for chatbot */}
                  <div
                    className="card-body"
                    onClick={() => handleSelectFlowForChatbot(flow)}
                  >
                    <h5 className="card-title">{flow.title}</h5>
                    <p className="card-text text-muted mb-0">Flow ID: {flow.flow_id}</p>
                    <p className="card-text text-muted mb-0">
                      Created: {new Date(flow.created_at).toLocaleDateString()}
                    </p>

                    {/* If user clicked this flow & we fetched details, show node/edge count */}
                    {isSelectedForChatbot && selectedFlowDetails && (
                      <p className="mt-2">
                        <small>
                          Nodes: {selectedFlowDetails.nodes?.length || 0} | Edges:{" "}
                          {selectedFlowDetails.edges?.length || 0}
                        </small>
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Example "Save Chatbot" button (arrow) */}
      <div className="d-flex justify-content-end mt-4">
        <button className="btn btn-primary" onClick={handleSaveChatbot}>
          <FaArrowRight className="me-2" />
          Save Chatbot
        </button>
      </div>

      {/* Chatbot List Section */}
      <div className="row mt-5">
        <div className="col-12">
          <h4>Chatbot List</h4>
          <table className="table table-striped">
            <thead className="table-dark">
              <tr>
                <th>ID</th>
                <th>Title</th>
                <th>Flow Title</th>
                <th>Is Active?</th>
                <th>Delete</th>
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
                chatbots.map((bot) => (
                  <tr key={bot.id}>
                    <td>{bot.id}</td>
                    <td>{bot.title}</td>
                    <td>{bot.flow?.title || "N/A"}</td>
                    <td>{bot.isActive ? "Yes" : "No"}</td>
                    <td>
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => handleDeleteChatbot(bot.id)}
                      >
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Optional inline CSS or external CSS in autochatbot.css */}
      <style jsx>{`
        .error {
          color: #dc3545;
          padding: 1rem;
          border: 1px solid #dc3545;
          border-radius: 4px;
          margin: 1rem 0;
        }
      `}</style>
    </div>
  )
}

export default AutoChatbot
