import React, { useState, useEffect } from "react";
import axios from "axios";
import BASE_URL from "../../BaseUrl";
import "../Styles/chatmodal.css"; // Ensure your custom classes are defined here

const NewChatModal = ({ onClose, onSelectContact }) => {
  const token = localStorage.getItem("userToken");
  const [contacts, setContacts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadContacts();
  }, []);

  const loadContacts = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/phonebook/get_uid_contacts`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.success && Array.isArray(res.data.data)) {
        setContacts(res.data.data);
      } else {
        setContacts([]);
      }
    } catch (error) {
      console.error("Error fetching contacts:", error);
      setContacts([]);
    }
  };

  // Filter contacts by name or mobile
  const filteredContacts = contacts.filter((contact) =>
    contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.mobile.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="my-modal-overlay" onClick={onClose}>
      <div className="my-modal-content newchat-modal" onClick={(e) => e.stopPropagation()}>
        <div className="newchat-modal-header">
          <h3>Start a Conversation</h3>
          <button className="my-modal-close-btn" onClick={onClose}>X</button>
        </div>
        <div className="newchat-modal-body">
          {/* Left Column: Contacts List */}
          <div className="contacts-list-container">
            <input
              type="text"
              placeholder="Search contacts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="my-search-input"
            />
            {filteredContacts.length > 0 ? (
              <ul className="my-contacts-list">
                {filteredContacts.map((contact) => (
                  <li
                    key={contact.id}
                    className="my-contact-item"
                    onClick={() => {
                      onSelectContact(contact);
                      onClose();
                    }}
                  >
                    <div className="my-contact-avatar">
                      {contact.name ? contact.name.charAt(0).toUpperCase() : "?"}
                    </div>
                    <div className="my-contact-info">
                      <p className="my-contact-name">{contact.name}</p>
                      <p className="my-contact-mobile">{contact.mobile}</p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="my-no-contacts">No contacts found.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewChatModal;
