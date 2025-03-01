import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import BASE_URL from "../../BaseUrl";
import "../Styles/phonebook.css";
import { FaTrash,FaPlusCircle} from "react-icons/fa";
import { saveAs } from 'file-saver';
import Papa from "papaparse";

export default function Phonebook() {
  const token = localStorage.getItem("userToken");

  // Phonebook states
  const [phonebooks, setPhonebooks] = useState([]);
  const [newPhonebookName, setNewPhonebookName] = useState("");
  const [loadingPB, setLoadingPB] = useState(false);

  // Contacts states
  const [contacts, setContacts] = useState([]);
  const [sortColumn, setSortColumn] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");

  // Add Contact Modal
  const [showAddContactModal, setShowAddContactModal] = useState(false);
  const [selectedPhonebook, setSelectedPhonebook] = useState(null);

  // Add contact form fields
  const [contactName, setContactName] = useState("");
  const [contactMobile, setContactMobile] = useState("");
  const [contactVar1, setContactVar1] = useState("");
  const [contactVar2, setContactVar2] = useState("");
  const [contactVar3, setContactVar3] = useState("");
  const [contactVar4, setContactVar4] = useState("");
  const [contactVar5, setContactVar5] = useState("");

  const [file, setFile] = useState(null);

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  // Fetch phonebooks & contacts on mount
  useEffect(() => {
    loadPhonebooks();
    loadAllContacts();
  }, []);

  // Load phonebooks
  const loadPhonebooks = async () => {
    setLoadingPB(true);
    try {
      const res = await axios.get(`${BASE_URL}/api/phonebook/get_by_uid`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.success) {
        setPhonebooks(res.data.data || []);
      } else {
        setPhonebooks([]);
      }
    } catch (error) {
      console.error("Error fetching phonebooks:", error);
      setPhonebooks([]);
    } finally {
      setLoadingPB(false);
    }
  };

  // Load all user contacts
  const loadAllContacts = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/phonebook/get_uid_contacts`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.success) {
        setContacts(res.data.data || []);
      } else {
        setContacts([]);
      }
    } catch (error) {
      console.error("Error fetching contacts:", error);
      setContacts([]);
    }
  };

  // Add phonebook
  const addPhonebook = async () => {
    if (!newPhonebookName.trim()) return;
    try {
      const res = await axios.post(
        `${BASE_URL}/api/phonebook/add`,
        { name: newPhonebookName },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        Swal.fire("Success", "Phonebook added!", "success");
        setNewPhonebookName("");
        loadPhonebooks();
      } else {
        Swal.fire("Error", res.data.msg || "Could not add phonebook.", "error");
      }
    } catch (error) {
      console.error("Error adding phonebook:", error);
      Swal.fire("Error", "Something went wrong.", "error");
    }
  };

  // Delete phonebook
  const deletePhonebook = async (id) => {
    const confirm = await Swal.fire({
      title: "Are you sure?",
      text: "This will also delete all contacts in this phonebook.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    });
    if (!confirm.isConfirmed) return;

    try {
      const res = await axios.post(
        `${BASE_URL}/api/phonebook/del_phonebook`,
        { id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        Swal.fire("Deleted!", "Phonebook has been deleted.", "success");
        setPhonebooks((prev) => prev.filter((pb) => pb.id !== id));
        // Also remove contacts from this phonebook from the main table
        setContacts((prev) => prev.filter((c) => c.phonebook_id !== id));
        loadAllContacts();
      } else {
        Swal.fire("Error", res.data.msg || "Failed to delete.", "error");
      }
    } catch (error) {
      console.error("Error deleting phonebook:", error);
      Swal.fire("Error", "Something went wrong.", "error");
    }
  };

  const deleteContact = async (id) => {
      try {
          const confirmation = await Swal.fire({
              title: "Are you sure?",
              text: "You won't be able to revert this!",
              icon: "warning",
              showCancelButton: true,
              confirmButtonColor: "#d33",
              cancelButtonColor: "#3085d6",
              confirmButtonText: "Yes, delete it!"
          });
  
          if (!confirmation.isConfirmed) return;
  
          const response = await fetch(`${BASE_URL}/api/phonebook/del_contacts`, {
              method: "POST",
              headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${localStorage.getItem("userToken")}`
              },
              body: JSON.stringify({ selected: [id] })
          });
  
          const data = await response.json();
  
          if (data.success) {
              Swal.fire("Deleted!", "Contact has been deleted.", "success");
              loadAllContacts();
          } else {
              Swal.fire("Error!", data.msg || "Failed to delete contact.", "error");
          }
  
          return data;
      } catch (error) {
          console.error("Error deleting contact:", error);
          Swal.fire("Error!", "Something went wrong.", "error");
          return { success: false, msg: "Failed to delete contact" };
      }
  };
  


  // On phonebook name click => open modal to add contact
  const handlePhonebookClick = (phonebook) => {
    setSelectedPhonebook(phonebook);
    setShowAddContactModal(true);
  };

  // Save single contact
  const saveContact = async () => {
    if (!selectedPhonebook) return;
    if (!contactMobile.trim()) {
      Swal.fire("Error", "Mobile number is required", "error");
      return;
    }

    const contactData = {
      id: selectedPhonebook.id,
      phonebook_name: selectedPhonebook.name,
      name: contactName,
      mobile: contactMobile,
      var1: contactVar1,
      var2: contactVar2,
      var3: contactVar3,
      var4: contactVar4,
      var5: contactVar5,
    };

    try {
      const res = await axios.post(
        `${BASE_URL}/api/phonebook/add_single_contact`,
        contactData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        Swal.fire("Success", "Contact added!", "success");
        // Clear form
        setContactName("");
        setContactMobile("");
        setContactVar1("");
        setContactVar2("");
        setContactVar3("");
        setContactVar4("");
        setContactVar5("");
        setShowAddContactModal(false);

        // Reload all contacts so it shows in the main table
        loadAllContacts();
      } else {
        Swal.fire("Error", res.data.msg || "Failed to add contact.", "error");
      }
    } catch (error) {
      console.error("Error adding contact:", error);
      Swal.fire("Error", "Something went wrong.", "error");
    }
  };

  // Sorting logic
  const handleSort = (column) => {
    if (sortColumn === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortOrder("asc");
    }
  };

  const sortedContacts = [...contacts].sort((a, b) => {
    const valA = a[sortColumn] || "";
    const valB = b[sortColumn] || "";
    return sortOrder === "asc"
      ? valA.toString().localeCompare(valB.toString())
      : valB.toString().localeCompare(valA.toString());
  });

  useEffect(() => {
    console.log("Selected Phonebook:", selectedPhonebook);
  }, [selectedPhonebook]);

const exportContactsToCSV = (contacts) => {
    if (contacts.length === 0) {
        alert("No contacts available to export.");
        return;
    }

    const headers = ["Name", "Phonebook", "Mobile", "Var1", "Var2", "Var3", "Var4", "Var5", "Date"];
    const rows = contacts.map(c => [
        c.name, 
        c.phonebook_name, 
        c.mobile, 
        c.var1, 
        c.var2, 
        c.var3, 
        c.var4, 
        c.var5, 
        new Date().toLocaleDateString()
    ]);

    let csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].map(e => e.join(",")).join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, "contacts.csv");
};

const parseCSV = async () => {
  if (!file) {
    Swal.fire("Error", "Please select a CSV file.", "error");
    return;
  }

  Papa.parse(file, {
    header: true,
    skipEmptyLines: true,
    complete: (results) => {
      if (results.errors.length > 0) {
        Swal.fire("Error", "Error parsing CSV file. Please check the format.", "error");
        return;
      }
      
      // Transform data to match your API format
      const formattedContacts = results.data.map(contact => ({
        name: contact.Name || contact.name || "",
        mobile: contact.Mobile || contact.mobile || "",
        var1: contact.Var1 || contact.var1 || "",
        var2: contact.Var2 || contact.var2 || "",
        var3: contact.Var3 || contact.var3 || "",
        var4: contact.Var4 || contact.var4 || "",
        var5: contact.Var5 || contact.var5 || "",
        phonebook_id: selectedPhonebook.id
      }));

      handleUpload(formattedContacts);
    },
    error: (error) => {
      Swal.fire("Error", "Failed to read CSV file.", "error");
    }
  });
};

const handleUpload = async (contacts) => {
  try {
    const { data } = await axios.post(
      `${BASE_URL}/api/phonebook/import_contacts`,
      { contacts },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("userToken")}`,
        },
      }
    );

    Swal.fire("Success", data.msg, "success");
  } catch (error) {
    Swal.fire(
      "Upload Failed",
      error.response?.data?.msg || "An error occurred.",
      "error"
    );
  }
};

  return (
    <div className="phonebook-container">
      {/* Top Bar */}
      <div className="top-bar d-flex align-items-center px-3 py-2 justify-content-between">
          <h5 className="mb-0 me-3">Add phonebook</h5>
          <input
            type="text"
            className="form-control"
            placeholder="Enter phonebook name"
            value={newPhonebookName}
            onChange={(e) => setNewPhonebookName(e.target.value)}
            style={{ width: "300px" }}
          />
           <button className="btn btn-success ms-3" onClick={addPhonebook}>
          Add
          </button>
      </div>

      <div className="d-flex">
        {/* Left Sidebar */}
        <div className="left-sidebar p-3">
          <div className="sidebar-illustration mb-3">
            <img
              src="/images/phonebook_illustration.png"
              alt="Phonebook"
              className="img-fluid"
            />
          </div>
          <h6 className="sidebar-title">My phonebooks</h6>
          <hr />
          {loadingPB && <p>Loading...</p>}
          {!loadingPB &&
            phonebooks.map((pb) => (
              <div
                key={pb.id}
                className="phonebook-item d-flex justify-content-between"
              >
                <span >
                <FaPlusCircle className="plus-icon me-3"  onClick={() => handlePhonebookClick(pb)} role="button"/>

                  {pb.name}
                </span>

                <span className="trash-icon" onClick={() => deletePhonebook(pb.id)}>
                  <FaTrash/>
                </span>
              </div>
            ))}
        </div>

        {/* Main Content: Table of all contacts */}
        <div className="flex-grow-1 p-3">
          <div className="card __phonebook-card shadow-sm">
            <div className="card-header d-flex align-items-center justify-content-between">
              <h5 className="mb-0">All Contacts</h5>
              <button className="btn btn-outline-success btn-sm" onClick={() => exportContactsToCSV(sortedContacts)}>
                Export
              </button>

            </div>
            <div className="card-body">
              <table className="table align-middle table-striped contact-table">
                <thead>
                  <tr>
                    <th onClick={() => handleSort("name")}>Name</th>
                    <th onClick={() => handleSort("phonebook_name")}>Phonebook</th>
                    <th onClick={() => handleSort("mobile")}>Mobile</th>
                    <th onClick={() => handleSort("var1")}>var1</th>
                    <th onClick={() => handleSort("var2")}>var2</th>
                    <th onClick={() => handleSort("var3")}>var3</th>
                    <th onClick={() => handleSort("var4")}>var4</th>
                    <th onClick={() => handleSort("var5")}>var5</th>
                    <th>Date</th>
                    <th>Delete</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedContacts.length > 0 ? (
                    sortedContacts.map((c, idx) => (
                      <tr key={idx}>
                        <td>{c.name}</td>
                        <td>{c.phonebook_name}</td>
                        <td>{c.mobile}</td>
                        <td>{c.var1}</td>
                        <td>{c.var2}</td>
                        <td>{c.var3}</td>
                        <td>{c.var4}</td>
                        <td>{c.var5}</td>
                        <td>{new Date().toLocaleDateString()}</td>
                        <td><button className="del-btn-contact" onClick={() => deleteContact(c.id)}><FaTrash/></button></td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="9" className="text-center">
                        No contacts available
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Add Contact Modal */}
      {showAddContactModal && selectedPhonebook && (
        <div
          className="modal fade show d-block phonebook-modal"
          style={{ background: "rgba(0,0,0,0.5)" }}
          tabIndex="-1"
        >
          <div className="modal-dialog _phonebook-dialog-box">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  Add Contact to {selectedPhonebook.name} Phonebook
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowAddContactModal(false)}
                />
              </div>
              <div className="modal-body">
                {/* Upload Buttons (placeholder) */}
                <div className="d-flex gap-2 mb-3">
                  <input type="file" accept=".csv" className="" onChange={handleFileChange} />
                  <button className="btn btn-outline-secondary btn-sm" onClick={() => parseCSV(file, handleUpload)}>Upload by CSV</button>
                </div>
                {/* Contact Form */}
                <div className="row g-2">
                  <div className="col-6 mb-2">
                    <label className="form-label">Contact name</label>
                    <input
                      type="text"
                      className="form-control"
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                    />
                  </div>
                  <div className="col-6 mb-2">
                    <label className="form-label">Mobile without country code</label>
                    <input
                      type="text"
                      className="form-control"
                      value={contactMobile}
                      onChange={(e) => setContactMobile(e.target.value)}
                    />
                  </div>
                  <div className="col-6 mb-2">
                    <label className="form-label">var1</label>
                    <input
                      type="text"
                      className="form-control"
                      value={contactVar1}
                      onChange={(e) => setContactVar1(e.target.value)}
                    />
                  </div>
                  <div className="col-6 mb-2">
                    <label className="form-label">var2</label>
                    <input
                      type="text"
                      className="form-control"
                      value={contactVar2}
                      onChange={(e) => setContactVar2(e.target.value)}
                    />
                  </div>
                  <div className="col-6 mb-2">
                    <label className="form-label">var3</label>
                    <input
                      type="text"
                      className="form-control"
                      value={contactVar3}
                      onChange={(e) => setContactVar3(e.target.value)}
                    />
                  </div>
                  <div className="col-6 mb-2">
                    <label className="form-label">var4</label>
                    <input
                      type="text"
                      className="form-control"
                      value={contactVar4}
                      onChange={(e) => setContactVar4(e.target.value)}
                    />
                  </div>
                  <div className="col-6 mb-2">
                    <label className="form-label">var5</label>
                    <input
                      type="text"
                      className="form-control"
                      value={contactVar5}
                      onChange={(e) => setContactVar5(e.target.value)}
                    />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-success w-100" onClick={saveContact}>
                  Save contact
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
