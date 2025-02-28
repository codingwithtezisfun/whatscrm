import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaPlus } from "react-icons/fa";
import "../Styles/broadcastmanager.css";
import BASE_URL from "../../BaseUrl";

export default function BroadcastManager() {
  const token = localStorage.getItem("userToken");

  // Broadcast list and modal visibility
  const [broadcasts, setBroadcasts] = useState([]);
  const [showModal, setShowModal] = useState(false);

  // Fields for add/edit broadcast
  const [broadcastId, setBroadcastId] = useState("");
  const [title, setTitle] = useState("");
  // For comboboxes we'll store the selected id (as string)
  const [templet, setTemplet] = useState("");
  const [phonebook, setPhonebook] = useState("");
  const [schedule, setSchedule] = useState(false);

  // Options for comboboxes fetched from API endpoints
  const [templetOptions, setTempletOptions] = useState([]);
  const [phonebookOptions, setPhonebookOptions] = useState([]);

  useEffect(() => {
    fetchBroadcasts();
    fetchTempletOptions();
    fetchPhonebookOptions();
  }, []);

  // Fetch broadcasts
  const fetchBroadcasts = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/broadcast/get_broadcast`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.success) {
        setBroadcasts(res.data.data);
      }
    } catch (err) {
      console.error("Error fetching broadcasts:", err);
    }
  };

  // Fetch available templets from database with parsed content
  const fetchTempletOptions = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/templet/get_templets`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.success) {
        // Parse the content for each template
        const parsedTemplates = res.data.data.map((tmpl) => {
          let contentData = {};
          try {
            contentData = JSON.parse(tmpl.content);
          } catch (error) {
            console.error("Error parsing JSON:", error);
          }
          return { ...tmpl, contentData }; 
        });
        setTempletOptions(parsedTemplates);
      } else {
        setTempletOptions([]);
      }
    } catch (err) {
      console.error("Error fetching templates:", err);
      setTempletOptions([]);
    }
  };

  // Fetch available phonebooks from database
  const fetchPhonebookOptions = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/phonebook/get_by_uid`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.success) {
        setPhonebookOptions(res.data.data);
      }
    } catch (err) {
      console.error("Error fetching phonebooks:", err);
    }
  };

  // Open modal for add or edit
  const openModal = (broadcast = null) => {
    if (broadcast) {
      // Edit mode: set fields from the broadcast record
      setBroadcastId(broadcast.broadcast_id);
      setTitle(broadcast.title);
      try {
        const parsedTemplet = JSON.parse(broadcast.templet);
        const parsedPhonebook = JSON.parse(broadcast.phonebook);
        // Store the id (assuming the DB record has an id field)
        setTemplet(parsedTemplet?.id ? String(parsedTemplet.id) : "");
        setPhonebook(parsedPhonebook?.id ? String(parsedPhonebook.id) : "");
      } catch (e) {
        console.error("Error parsing JSON fields:", e);
        setTemplet("");
        setPhonebook("");
      }
      setSchedule(false);
    } else {
      // Add mode: clear all fields
      setBroadcastId("");
      setTitle("");
      setTemplet("");
      setPhonebook("");
      setSchedule(false);
    }
    setShowModal(true);
  };

  // Close modal
  const closeModal = () => {
    setShowModal(false);
  };

  // Handle form submission for add/edit broadcast
  const handleSubmit = async (e) => {
    e.preventDefault();
    // Find the selected templet and phonebook objects from the options
    const selectedTemplet = templetOptions.find(
      (opt) => String(opt.id) === templet
    );
    const selectedPhonebook = phonebookOptions.find(
      (opt) => String(opt.id) === phonebook
    );

    const payload = {
      broadcast_id: broadcastId, // empty if new
      title,
      // Sending both id and name in the object
      templet: selectedTemplet || { name: "" },
      phonebook: selectedPhonebook || { name: "" },
      scheduleTimestamp: schedule ? new Date().toISOString() : null,
    };

    try {
      if (broadcastId) {
        // Edit existing broadcast
        await axios.post(`${BASE_URL}/api/broadcast/edit_broadcast`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        // Add new broadcast
        await axios.post(`${BASE_URL}/api/broadcast/add_new`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
      fetchBroadcasts();
      closeModal();
    } catch (err) {
      console.error("Error saving broadcast:", err);
    }
  };

  // Delete a broadcast
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this broadcast?"))
      return;
    try {
      await axios.post(
        `${BASE_URL}/api/broadcast/del_broadcast`,
        { broadcast_id: id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchBroadcasts();
    } catch (err) {
      console.error("Error deleting broadcast:", err);
    }
  };

  return (
    <div className="broadcast-manager-container">
      {/* Header area */}
      <div className="broadcast-header d-flex align-items-center justify-content-between">
        <div className="broadcast-intro">
          <h4>
            Effortlessly broadcast your message to multiple WhatsApp numbers
          </h4>
          <p className="">
            Just a single click. Our streamlined solution empowers you to reach
            numerous contacts instantly.
          </p>
        </div>
        <button
          className="btn btn-success btn-add-broadcast"
          onClick={() => openModal()}
        >
          <FaPlus className="me-2" />
          Add New Broadcast
        </button>
      </div>

      {/* Broadcast table */}
      <div className="table-container mt-4">
        <table className="table table-hover broadcast-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Title</th>
              <th>Template</th>
              <th>Phonebook</th>
              <th>Status</th>
              <th>Edit</th>
              <th>Delete</th>
            </tr>
          </thead>
          <tbody>
            {broadcasts.length > 0 ? (
              broadcasts.map((b) => {
                let parsedTemplet = {};
                let parsedPhonebook = {};
                try {
                  parsedTemplet = JSON.parse(b.templet);
                  parsedPhonebook = JSON.parse(b.phonebook);
                } catch (e) {
                  console.error("Error parsing JSON:", e);
                }
                return (
                  <tr key={b.broadcast_id}>
                    <td>{b.broadcast_id}</td>
                    <td>{b.title}</td>
                    <td>{parsedTemplet?.name || "N/A"}</td>
                    <td>{parsedPhonebook?.name || "N/A"}</td>
                    <td>{b.status}</td>
                    <td>
                      <button
                        className="btn btn-sm btn-outline-secondary"
                        onClick={() => openModal(b)}
                      >
                        Edit
                      </button>
                    </td>
                    <td>
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => handleDelete(b.broadcast_id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="7" className="text-center">
                  No rows
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Footer pagination area (example) */}
      <div className="pagination-footer d-flex justify-content-end align-items-center">
        <span className="me-3">Records per page: 100</span>
        <span>0-0 of 0</span>
      </div>

      {/* MODAL (standard Bootstrap with custom classes) */}
      {showModal && (
        <>
          {/* Backdrop */}
          <div className="modal-backdrop fade show"></div>

          {/* Modal */}
          <div
            className="modal fade show"
            tabIndex="-1"
            style={{ display: "block" }}
            role="dialog"
          >
            <div
              className="modal-dialog modal-dialog-centered"
              role="document"
            >
              <div className="modal-content broadcast-modal">
                <form onSubmit={handleSubmit}>
                  <div className="modal-header">
                    <h5 className="modal-title">
                      {broadcastId ? "Edit Broadcast" : "Add new broadcast"}
                    </h5>
                    <button
                      type="button"
                      className="btn-close"
                      onClick={closeModal}
                    >
                      X
                    </button>
                  </div>
                  <div className="modal-body">
                    {/* Broadcast title */}
                    <div className="mb-3">
                      <label className="form-label">Broadcast title</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Broadcast title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                      />
                    </div>

                    {/* Variables note */}
                    <div className="mb-3 p-3 variables-note">
                      <p className="mb-0">
                        You can use phonebook variables like{" "}
                        <code>{"{{{var1}}}"}</code>, <code>{"{{{var2}}}"}</code>, etc.
                        Use <code>{"{{{name}}}"}</code> for the name and{" "}
                        <code>{"{{{mobile}}}"}</code> for the mobile number.
                      </p>
                    </div>

                    {/* Select templet combobox */}
                    <div className="mb-3 broadcast-combobox">
                      <label className="form-label">Select templet</label>
                      <select
                        className="form-control"
                        value={templet}
                        onChange={(e) => setTemplet(e.target.value)}
                        required
                        >
                        <option value="">Select a templet</option>
                        {templetOptions.map((opt) => (
                            <option key={opt.id} value={opt.id}>
                            {opt.title}
                            </option>
                        ))}
                        </select>

                    </div>

                    {/* Select phonebook combobox */}
                    <div className="mb-3 broadcast-combobox">
                      <label className="form-label">Select phonebook</label>
                      <select
                        className="form-control"
                        value={phonebook}
                        onChange={(e) => setPhonebook(e.target.value)}
                        required
                      >
                        <option value="">Select a phonebook</option>
                        {phonebookOptions.map((opt) => (
                          <option key={opt.id} value={opt.id}>
                            {opt.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Schedule toggle */}
                    <div className="form-check form-switch d-flex align-items-center mb-3">
                      <label className="form-check-label me-3">Schedule</label>
                      <input
                        className="form-check-input"
                        type="checkbox"
                        role="switch"
                        checked={schedule}
                        onChange={() => setSchedule(!schedule)}
                      />
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button
                      type="submit"
                      className="btn btn-success w-100 btn-send-message"
                    >
                      {broadcastId ? "Save Changes" : "Send Message"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
