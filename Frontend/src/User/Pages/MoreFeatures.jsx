import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import "../Styles/morefeatures.css";
import AgentLogin from "../../Agent/Auth/AgentLogin";
import { FaUserTie, FaTasks, FaCommentDots } from "react-icons/fa";
import AssignTask from "./AssignTask";


const ChatWidget = () => {
  return (
    <div>
      <h2>Chat Widget</h2>
      <p>Configure your chat widget here...</p>
    </div>
  );
};

// --- MoreFeatures Component ---
const MoreFeatures = () => {
  const [activeTab, setActiveTab] = useState("login");

  const renderContent = () => {
    switch(activeTab) {
      case "login":
        return <AgentLogin />;
      case "tasks":
        return <AssignTask/>;
      case "widget":
        return <ChatWidget />;
      default:
        return <AgentLogin />;
    }
  };

  return (
    <div className="morefeatures-container">
      <div className="agent-sidebar">
      <ul>
          <li
            className={activeTab === "login" ? "active" : ""}
            onClick={() => setActiveTab("login")}
          >
            <FaUserTie style={{ marginRight: "8px" }} />
            Agent Login
          </li>
          <li
            className={activeTab === "tasks" ? "active" : ""}
            onClick={() => setActiveTab("tasks")}
          >
            <FaTasks style={{ marginRight: "8px" }} />
            Agent Tasks
          </li>
          <li
            className={activeTab === "widget" ? "active" : ""}
            onClick={() => setActiveTab("widget")}
          >
            <FaCommentDots style={{ marginRight: "8px" }} />
            Chat Widget
          </li>
        </ul>
      </div>
      <div className="morefeatures-content">
        {renderContent()}
      </div>
    </div>
  );
};

export default MoreFeatures;
