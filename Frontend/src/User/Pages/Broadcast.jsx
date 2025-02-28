import { useState } from "react";
import ManageTemplate from "./ManageTemplate";

const Broadcast = () => {
  const [activeComponent, setActiveComponent] = useState("template");

  return (
    <div className="_broadcast-container">
      {/* Sidebar */}
      <div className="_sidebar">
        <h5 className="_sidebar-title">Broadcast</h5>
        <button
          className={`_sidebar-button ${activeComponent === "template" ? "active" : ""}`}
          onClick={() => setActiveComponent("template")}
        >
          Manage Meta Template
        </button>
        <button
          className={`_sidebar-button ${activeComponent === "broadcast" ? "active" : ""}`}
          onClick={() => setActiveComponent("broadcast")}
        >
          Send Broadcast
        </button>
      </div>

      {/* Main content area */}
      <div className="_content">
        {activeComponent === "template" ? <ManageTemplate /> : <h1>Broadcast</h1>}
      </div>
    </div>
  );
};

export default Broadcast;
