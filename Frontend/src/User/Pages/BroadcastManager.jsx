import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { FaPlus } from "react-icons/fa";
import "../Styles/broadcastmanager.css";
import BASE_URL from "../../BaseUrl";

export default function BroadcastManager() {
  const token = localStorage.getItem("userToken");

  const [broadcasts, setBroadcasts] = useState([]);
  const [showModal, setShowModal] = useState(false);

  const [broadcastId, setBroadcastId] = useState("");
  const [title, setTitle] = useState("");
  const [templet, setTemplet] = useState("");
  const [phonebook, setPhonebook] = useState("");
  const [schedule, setSchedule] = useState(false);
  const [scheduledTime, setScheduledTime] = useState(
    new Date().toISOString().substring(0, 16)
  );

  const [templetOptions, setTempletOptions] = useState([]);
  const [phonebookOptions, setPhonebookOptions] = useState([]);

  useEffect(() => {
    fetchBroadcasts();
    fetchTempletOptions();
    fetchPhonebookOptions();
  }, []);

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

  const fetchTempletOptions = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/templet/get_templets`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.success) {
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

  const openModal = (broadcast = null) => {
    if (broadcast) {
      setBroadcastId(broadcast.broadcast_id);
      setTitle(broadcast.title);
      try {
        const parsedTemplet = JSON.parse(broadcast.templet);
        const parsedPhonebook = JSON.parse(broadcast.phonebook);
        setTemplet(parsedTemplet?.id ? String(parsedTemplet.id) : "");
        setPhonebook(parsedPhonebook?.id ? String(parsedPhonebook.id) : "");
      } catch (e) {
        console.error("Error parsing JSON fields:", e);
        setTemplet("");
        setPhonebook("");
      }
      setSchedule(false);
    } else {
      setBroadcastId("");
      setTitle("");
      setTemplet("");
      setPhonebook("");
      setSchedule(false);
      setScheduledTime(new Date().toISOString().substring(0, 16));
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const selectedTemplet = templetOptions.find(
      (opt) => String(opt.id) === templet
    );
    const selectedPhonebook = phonebookOptions.find(
      (opt) => String(opt.id) === phonebook
    );

    const payload = {
      broadcast_id: broadcastId, 
      title,
      templet: selectedTemplet || { name: "" },
      phonebook: selectedPhonebook || { name: "" },
      scheduleTimestamp: schedule
        ? new Date(scheduledTime).toISOString()
        : new Date().toISOString(),
    };

    console.log(payload + "payload");
    

    try {
      if (broadcastId) {
        await axios.post(`${BASE_URL}/api/broadcast/edit_broadcast`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        Swal.fire({
          icon: "success",
          title: "Broadcast Updated",
          text: "Your broadcast has been updated successfully.",
        });
        log
      } else {
        await axios.post(`${BASE_URL}/api/broadcast/add_new`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        Swal.fire({
          icon: "success",
          title: "Broadcast Added",
          text: "Your broadcast has been added successfully.",
        });
      }
      fetchBroadcasts();
      closeModal();
    } catch (err) {
      console.error("Error saving broadcast:", err);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "There was an error saving the broadcast. Please try again.",
      });
    }
  };

  const handleDelete = async (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "Do you want to delete this broadcast?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.post(
            `${BASE_URL}/api/broadcast/del_broadcast`,
            { broadcast_id: id },
            { headers: { Authorization: `Bearer ${token}` } }
          );
          fetchBroadcasts();
          Swal.fire("Deleted!", "The broadcast has been deleted.", "success");
        } catch (err) {
          console.error("Error deleting broadcast:", err);
          Swal.fire(
            "Error!",
            "There was an error deleting the broadcast. Please try again.",
            "error"
          );
        }
      }
    });
  };

  return (
    <div className="broadcast-manager-container">
      <div className="broadcast-header d-flex align-items-center justify-content-between">
        <div className="broadcast-intro">
          <h4>
            Effortlessly broadcast your message to multiple WhatsApp numbers
          </h4>
          <p>
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

      <div className="pagination-footer d-flex justify-content-end align-items-center">
        <span className="me-3">Records per page: 100</span>
        <span>0-0 of 0</span>
      </div>

      MODAL
      {showModal && (
        <>
          <div className="modal-backdrop fade show"></div>

          <div
            className="modal fade show"
            tabIndex="-1"
            style={{ display: "block" }}
            role="dialog"
          >
            <div className="modal-dialog modal-dialog-centered" role="document">
              <div className="modal-content broadcast-modal">
                <form onSubmit={handleSubmit}>
                  <div className="modal-header">
                    <h5 className="modal-title">
                      {broadcastId ? "Edit Broadcast" : "Add New Broadcast"}
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
                    <div className="mb-3">
                      <label className="form-label">Broadcast Title</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Broadcast title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                      />
                    </div>

                    <div className="mb-3 p-3 variables-note">
                      <p className="mb-0">
                        You can use phonebook variables like{" "}
                        <code>{"{{{var1}}}"}</code>, <code>{"{{{var2}}}"}</code>,
                        etc. Use <code>{"{{{name}}}"}</code> for the name and{" "}
                        <code>{"{{{mobile}}}"}</code> for the mobile number.
                      </p>
                    </div>

                    <div className="mb-3 broadcast-combobox">
                      <label className="form-label">Select Templet</label>
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

                    <div className="mb-3 broadcast-combobox">
                      <label className="form-label">Select Phonebook</label>
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

                    {schedule && (
                      <div className="mb-3">
                        <label className="form-label">
                          Select Date &amp; Time
                        </label>
                        <input
                          type="datetime-local"
                          className="form-control"
                          value={scheduledTime}
                          onChange={(e) => setScheduledTime(e.target.value)}
                          required
                        />
                      </div>
                    )}
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
