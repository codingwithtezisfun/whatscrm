import React, { useState } from "react";
import "../Styles/chatbot.css"; // Ensure styling remains intact
import AutoChatbot from "../Pages/AutoChatbot";
import TemplateManager from "../Pages/TemplateManager";

const Chatbot = () => {
  const [currentTab, setCurrentTab] = useState("auto-chatbot");

  return (
    <div className="chatbot-layout">
      {/* Left Sidebar */}
      <div className="chatbot-sidebar">
        <div
          className={`sidebar-link ${currentTab === "auto-chatbot" ? "active" : ""}`}
          onClick={() => setCurrentTab("auto-chatbot")}
        >
          Auto Chatbot
        </div>
        <div
          className={`sidebar-link ${currentTab === "templates" ? "active" : ""}`}
          onClick={() => setCurrentTab("templates")}
        >
          Saved Templates
        </div>
      </div>

      {/* Main Content - Conditional Rendering Based on State */}
      <div className="chatbot-content">
        {currentTab === "auto-chatbot" && (
          <div>
            <AutoChatbot/>
          </div>
        )}

        {currentTab === "templates" && (
         <TemplateManager/>
        )}
      </div>
    </div>
  );
};

export default Chatbot;
