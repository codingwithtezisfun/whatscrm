import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { FaPlus } from "react-icons/fa";
import "../Styles/broadcastmanager.css";
import BASE_URL from "../../BaseUrl";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {jwtDecode} from "jwt-decode";

export default function BroadcastManager() {
  const token = localStorage.getItem("userToken");
  const decodedToken = token ? jwtDecode(token) : {};
  const currentUid = decodedToken.uid || decodedToken.userId || "";

  const [broadcasts, setBroadcasts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [broadcastId, setBroadcastId] = useState("");
  const [title, setTitle] = useState("");
  const [selectedMetaTemplId, setSelectedMetaTemplId] = useState("");
  const [dbTemplOptions, setDbTemplOptions] = useState([]);
  const [phonebook, setPhonebook] = useState("");
  const [metaTemplOptions, setMetaTemplOptions] = useState([]);
  const [phonebookOptions, setPhonebookOptions] = useState([]);
  const [selectedMetaTemplDetails, setSelectedMetaTemplDetails] = useState(null);
  // dynamicVariables holds key-value pairs for each placeholder (e.g. { "{{1}}": "Ian" })
  const [dynamicVariables, setDynamicVariables] = useState({});

  useEffect(() => {
    fetchBroadcasts();
    fetchMetaTemplOptions(); // fetch meta templates from Meta
    fetchDbTemplOptions(); // fetch DB stored templates for reference
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
      console.log("Fetched broadcasts:", res.data);
    } catch (err) {
      console.error("Error fetching broadcasts:", err);
    }
  };

  // Fetch meta templates from backend
  const fetchMetaTemplOptions = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/user/get_my_meta_templets`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.success) {
        setMetaTemplOptions(res.data.data);
      } else {
        setMetaTemplOptions([]);
      }
      console.log("Fetched meta templates from Meta:", res.data);
    } catch (err) {
      console.error("Error fetching meta templates from Meta:", err);
      setMetaTemplOptions([]);
    }
  };
  

  // Fetch DB templates for reference
  const fetchDbTemplOptions = async () => {
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
            console.error("Error parsing JSON for DB template:", error);
          }
          return { ...tmpl, contentData };
        });
        setDbTemplOptions(parsedTemplates);
      } else {
        setDbTemplOptions([]);
      }
      console.log("Fetched DB templates for reference:", res.data);
    } catch (err) {
      console.error("Error fetching DB templates:", err);
      setDbTemplOptions([]);
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
      console.log("Fetched phonebook options:", res.data);
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
        setSelectedMetaTemplId(parsedTemplet?.id ? String(parsedTemplet.id) : "");
        setPhonebook(
          JSON.parse(broadcast.phonebook)?.id
            ? String(JSON.parse(broadcast.phonebook).id)
            : ""
        );
        // Update DB reference details for display
        const foundDbTempl = dbTemplOptions.find(
          (t) => String(t.id) === String(parsedTemplet?.id)
        );
        setSelectedMetaTemplDetails(foundDbTempl || null);
        // Set dynamic variables based on placeholders in the template's BODY text
        if (foundDbTempl && foundDbTempl.contentData?.components) {
          const bodyComp = foundDbTempl.contentData.components.find(
            (c) => c.type === "BODY"
          );
          if (bodyComp && bodyComp.text) {
            const placeholders = bodyComp.text.match(/{{\d+}}/g) || [];
            const uniquePlaceholders = [...new Set(placeholders)];
            setDynamicVariables(
              uniquePlaceholders.reduce((acc, ph) => {
                acc[ph] = ""; // default empty value
                return acc;
              }, {})
            );
          } else {
            setDynamicVariables({});
          }
        }
      } catch (e) {
        console.error("Error parsing JSON fields:", e);
        setSelectedMetaTemplId("");
        setPhonebook("");
        setSelectedMetaTemplDetails(null);
        setDynamicVariables({});
      }
    } else {
      setBroadcastId("");
      setTitle("");
      setSelectedMetaTemplId("");
      setPhonebook("");
      setSelectedMetaTemplDetails(null);
      setDynamicVariables({});
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
  };

  // Updated handleSubmit: dynamicValues are stringified so that they're sent as a string.
  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Form submitted. Starting broadcast process...");

    // Find the selected meta template from the meta options list
    const selectedMetaTempl = metaTemplOptions.find(
      (opt) => String(opt.id) === selectedMetaTemplId
    );
    console.log("Selected Meta Template:", selectedMetaTempl);

    // Find the selected phonebook (full details)
    const selectedPhonebook = phonebookOptions.find(
      (opt) => String(opt.id) === phonebook
    );
    console.log("Selected Phonebook:", selectedPhonebook);

    // Remove uid from the template data before sending
    const templetPayload = selectedMetaTempl
      ? (() => {
          const { uid, ...templateWithoutUid } = selectedMetaTempl;
          return {
            ...templateWithoutUid,
            name: selectedMetaTempl.name || selectedMetaTempl.title || "",
          };
        })()
      : { name: "" };

    const scheduleTimestamp = new Date().toLocaleString("en-US", {
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    });

    // Build the payload. Here, dynamicValues is converted to a JSON string.
    const payload = {
      broadcast_id: broadcastId,
      title: title,
      templet: templetPayload, // complete meta template data without uid
      phonebook: selectedPhonebook || { id: "", name: "", uid: "" },
      scheduleTimestamp: scheduleTimestamp,
      dynamicValues: JSON.stringify(dynamicVariables), // send as a string
    };

    console.log("Constructed Payload for Broadcast:", payload);

    try {
      if (broadcastId) {
        console.log("Updating broadcast with ID:", broadcastId);
        const res = await axios.post(
          `${BASE_URL}/api/broadcast/edit_broadcast`,
          payload,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        console.log("Update Response:", res.data);
        Swal.fire({
          icon: "success",
          title: "Broadcast Updated",
          text: "Your broadcast has been updated successfully.",
        });
      } else {
        console.log("Adding new broadcast...");
        const res = await axios.post(
          `${BASE_URL}/api/broadcast/add_new`,
          payload,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        console.log("Add Broadcast Response:", res.data);
        Swal.fire({
          icon: res.data.success ? "success" : "error",
          title: res.data.success ? "Broadcast Added" : "Error",
          text: res.data.success
            ? "Your broadcast has been added successfully."
            : res.data.msg,
        });
      }
      console.log("Refreshing broadcast list and closing modal...");
      fetchBroadcasts();
      closeModal();
    } catch (err) {
      console.error("Error during broadcast submission:", err);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "There was an error saving the broadcast. Please try again.",
      });
    }
  };

  // handleSendTemplate remains unchanged
  const handleSendTemplate = async (template) => {
    const { value: formValues } = await Swal.fire({
      title: "Send Template Message",
      html:
        `<input id="swal-input1" class="swal2-input" placeholder="Recipient Number (with country code)">` +
        `<div id="dynamic-inputs"><p>Dynamic Values (if any):</p></div>`,
      focusConfirm: false,
      didOpen: () => {
        const bodyComponent = template.contentData?.components?.find((c) => c.type === "BODY");
        if (bodyComponent && bodyComponent.text) {
          const dynamicValues = bodyComponent.text.match(/{{\d+}}/g);
          if (dynamicValues && dynamicValues.length > 0) {
            const dynamicInputsContainer = document.getElementById("dynamic-inputs");
            dynamicValues.forEach((val, index) => {
              const input = document.createElement("input");
              input.id = `dynamic-value-${index + 1}`;
              input.className = "swal2-input";
              input.placeholder = `Value for ${val}`;
              dynamicInputsContainer.appendChild(input);
            });
          }
        }
      },
      preConfirm: () => {
        const values = {
          toNumber: document.getElementById("swal-input1").value,
          dynamicValues: [],
        };
        const dynamicInputs = document.querySelectorAll('[id^="dynamic-value-"]');
        dynamicInputs.forEach((input) => {
          values.dynamicValues.push(input.value);
        });
        return values;
      },
    });

    if (formValues && formValues.toNumber) {
      try {
        Swal.fire({
          title: "Sending",
          text: "Sending template message...",
          allowOutsideClick: false,
          didOpen: () => Swal.showLoading(),
        });

        const metaTemplatesRes = await axios.get(`${BASE_URL}/api/user/get_my_meta_templets`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!metaTemplatesRes.data.success) {
          Swal.close();
          return Swal.fire("Error", "Failed to get templates from Meta", "error");
        }
        const metaTemplates = metaTemplatesRes.data.data;
        const matchingTemplate = metaTemplates.find((t) => t.name === template.title);
        if (!matchingTemplate) {
          Swal.close();
          return Swal.fire("Not Found", "Template not found on Meta or not approved yet", "warning");
        }
        const res = await axios.post(
          `${BASE_URL}/api/send_template_message`,
          {
            toNumber: formValues.toNumber,
            template: matchingTemplate,
            example: formValues.dynamicValues,
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        Swal.close();
        if (res.data.success) {
          Swal.fire("Success", "Template message sent successfully", "success");
        } else {
          Swal.fire("Error", res.data.msg || "Failed to send template message", "error");
        }
      } catch (err) {
        console.error("Error sending template:", err);
        Swal.fire("Error", "Failed to send template message", "error");
      }
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
          Swal.fire("Error!", "There was an error deleting the broadcast. Please try again.", "error");
        }
      }
    });
  };

  return (
    <div className="broadcast-manager-container">
      <div className="broadcast-header d-flex align-items-center justify-content-between">
        <div className="broadcast-intro">
          <h4>Effortlessly broadcast your message to multiple WhatsApp numbers</h4>
          <p>Just a single click. Our streamlined solution empowers you to reach numerous contacts instantly.</p>
        </div>
        <button className="btn btn-success btn-add-broadcast" onClick={() => openModal()}>
          <FaPlus className="me-2" />
          Add New Broadcast
        </button>
      </div>

      <div className="table-container mt-4">
        <table className="table table-hover broadcast-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Title</th>
              <th>Template (Meta)</th>
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
                  console.error("Error parsing broadcast JSON:", e);
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
                      <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(b.broadcast_id)}>
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="7" className="text-center">No broadcasts available</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <h4>{broadcastId ? "Edit Broadcast" : "New Broadcast"}</h4>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Title:</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>Select Meta Template:</label>
                <select
                  value={selectedMetaTemplId}
                  onChange={(e) => {
                    setSelectedMetaTemplId(e.target.value);
                    const refTempl = dbTemplOptions.find(
                      (t) => String(t.id) === e.target.value
                    );
                    setSelectedMetaTemplDetails(refTempl || null);
                    if (refTempl && refTempl.contentData?.components) {
                      const bodyComp = refTempl.contentData.components.find(
                        (c) => c.type === "BODY"
                      );
                      if (bodyComp && bodyComp.text) {
                        const placeholders = bodyComp.text.match(/{{\d+}}/g) || [];
                        const uniquePlaceholders = [...new Set(placeholders)];
                        setDynamicVariables(
                          uniquePlaceholders.reduce((acc, ph) => {
                            acc[ph] = "";
                            return acc;
                          }, {})
                        );
                      } else {
                        setDynamicVariables({});
                      }
                    } else {
                      setDynamicVariables({});
                    }
                    console.log("Selected Meta Template ID:", e.target.value);
                  }}
                  required
                >
                  <option value="">-- Choose Meta Template --</option>
                  {metaTemplOptions.map((tmpl) => (
                    <option key={tmpl.id} value={tmpl.id}>
                      {tmpl.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Select Phonebook:</label>
                <select
                  value={phonebook}
                  onChange={(e) => setPhonebook(e.target.value)}
                  required
                >
                  <option value="">-- Choose Phonebook --</option>
                  {phonebookOptions.map((pb) => (
                    <option key={pb.id} value={pb.id}>
                      {pb.name}
                    </option>
                  ))}
                </select>
              </div>

              {Object.keys(dynamicVariables).length > 0 && (
                <div className="dynamic-variables">
                  <h5>Fill in Template Variables</h5>
                  {Object.keys(dynamicVariables).map((ph) => (
                    <div key={ph} className="form-group">
                      <label>Value for {ph}:</label>
                      <input
                        type="text"
                        value={dynamicVariables[ph]}
                        onChange={(e) =>
                          setDynamicVariables({
                            ...dynamicVariables,
                            [ph]: e.target.value,
                          })
                        }
                        required
                      />
                    </div>
                  ))}
                </div>
              )}

              {selectedMetaTemplDetails && (
                <div className="template-details">
                  <h5>Template Details (DB Reference)</h5>
                  <pre>{JSON.stringify(selectedMetaTemplDetails, null, 2)}</pre>
                </div>
              )}

              <div className="modal-buttons">
                <button type="submit" className="btn btn-primary">
                  {broadcastId ? "Update Broadcast" : "Add Broadcast"}
                </button>
                <button type="button" className="btn btn-secondary" onClick={closeModal}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
