import React, { useState } from "react";
import "../Styles/chatlink.css"; 
import { FaPhone, FaEnvelope, FaCommentDots } from "react-icons/fa";
import { Link } from "react-router-dom";
import chatImage from "../../Assets/home.jpg";

const ChatLinkForm = () => {
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const generateChatLink = () => {
    if (!phone || !email) {
      alert("Phone number and Email are required!");
      return;
    }
    
    const encodedMessage = message ? `&text=${encodeURIComponent(message)}` : "";
    const chatLink = `https://api.whatsapp.com/send?phone=${phone}${encodedMessage}`;
    
    window.open(chatLink, "_blank");
  };

  return (
    <div className="chatlink-container">
      {/* Left Side */}
      <div className="chatlink-left">
        <img src={chatImage} alt="Chat Illustration" />
      </div>

      {/* Right Side */}
      <div className="chatlink-right">
        <div className="right-link-con">
        <h2>Generate Your Chat Link</h2>
        <p>Enter details to create a direct WhatsApp chat link.</p>

        <div className="form-group">
          <label>Phone Number</label>
          <div className="input-container">
            <FaPhone className="icon" />
            <input 
              type="text" 
              className="form-control" 
              placeholder="e.g. +254712345678"
              value={phone} 
              onChange={(e) => setPhone(e.target.value)} 
            />
          </div>
        </div>

        <div className="form-group">
          <label>Email ID</label>
          <div className="input-container">
            <FaEnvelope className="icon" />
            <input 
              type="email" 
              className="form-control" 
              placeholder="e.g. example@email.com"
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
            />
          </div>
        </div>

        <div className="form-group">
          <label>Welcome Message (Optional)</label>
          <div className="input-container">
            <FaCommentDots className="icon" />
            <input 
              type="text" 
              className="form-control" 
              placeholder="Type a custom message..."
              value={message} 
              onChange={(e) => setMessage(e.target.value)} 
            />
          </div>
        </div>

        <button className="generate-btn" onClick={generateChatLink}>
          Generate Link
        </button>
        </div>
      </div>
    </div>
  );
};

export default ChatLinkForm;
