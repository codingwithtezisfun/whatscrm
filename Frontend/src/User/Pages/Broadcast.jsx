import { useState } from "react";
import ManageTemplate from "./ManageTemplate";
import ManageBroadcast from "./ManageBroadcast";

const Broadcast = () => {
  const [activeComponent, setActiveComponent] = useState("template");

  return (
    <div className="d-flex vh-100">
      {/* Sidebar */}
      <div className="p-3 bg-dark text-white" style={{ width: "250px" }}>
        <h5>Broadcast</h5>
        <button 
          className={`btn ${activeComponent === "template" ? "btn-primary" : "btn-outline-primary"} w-100 mb-2`}
          onClick={() => setActiveComponent("template")}
        >
          Manage Meta Template
        </button>
        <button 
          className={`btn ${activeComponent === "broadcast" ? "btn-primary" : "btn-outline-primary"} w-100`}
          onClick={() => setActiveComponent("broadcast")}
        >
          Send Broadcast
        </button>
      </div>

      {/* Right div to load components dynamically */}
      <div className="flex-grow-1 p-3">
        {activeComponent === "template" ? <ManageTemplate /> : <ManageBroadcast />}
      </div>
    </div>
  );
};

export default Broadcast;
