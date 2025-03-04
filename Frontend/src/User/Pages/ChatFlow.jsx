import React, { useCallback, useState, useRef } from "react";
import ReactFlow, {
  addEdge,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  MiniMap,
} from "reactflow";
import "reactflow/dist/style.css";
import "../Styles/chatflow.css";
import "../Styles/nodes.css";
import axios from "axios";
import Swal from "sweetalert2";
import BASE_URL from "../../BaseUrl";

import {
  SimpleTextNode,
  ImageMessageNode,
  AudioMessageNode,
  VideoMessageNode,
  DocumentMessageNode,
  ButtonMessageNode,
  ListMessageNode,
  SendLocationNode,
  AssignChatToAgentNode,
  DisableChatbotNode,
  ReceiveApiNode,
  TakeInputNode,
  ConditionNode,
  SetVariableNode,
  CloseChatNode,
  OpenAiNode,
  Gpt4Node,
  AddMsgHistoryNode,
} from "./NodeForms";

// Map each node type to its corresponding component
const nodeTypes = {
  simpleText: SimpleTextNode,
  imageMessage: ImageMessageNode,
  audioMessage: AudioMessageNode,
  videoMessage: VideoMessageNode,
  documentMessage: DocumentMessageNode,
  buttonMessage: ButtonMessageNode,
  listMessage: ListMessageNode,
  sendLocation: SendLocationNode,
  assignChatToAgent: AssignChatToAgentNode,
  disableChatbot: DisableChatbotNode,
  receiveApi: ReceiveApiNode,
  takeInput: TakeInputNode,
  condition: ConditionNode,
  setVariable: SetVariableNode,
  closeChat: CloseChatNode,
  openAi: OpenAiNode,
  gpt4: Gpt4Node,
  addMsgHistory: AddMsgHistoryNode,
};

import { FaFont, FaImage, FaMusic, FaVideo, FaFileAlt, FaRegListAlt, FaLocationArrow, FaUserTie, FaBan, FaPlug, FaKeyboard, FaCodeBranch, FaExchangeAlt, FaTimesCircle, FaRobot, FaBrain, FaHistory } from "react-icons/fa";
import { MdSmartButton, MdOutlineAccessibility  } from "react-icons/md";

const nodeDefinitions = [
  { label: "Simple Text", type: "simpleText", color: "#ff6b6b", icon: <FaFont size={24} /> },
  { label: "Image Message", type: "imageMessage", color: "#4dabf7", icon: <FaImage size={24} /> },
  { label: "Audio Message", type: "audioMessage", color: "#f06292", icon: <FaMusic size={24} /> },
  { label: "Video Message", type: "videoMessage", color: "#ba68c8", icon: <FaVideo size={24} /> },
  { label: "Document Message", type: "documentMessage", color: "#ffd54f", icon: <FaFileAlt size={24} /> },
  { label: "Button Message", type: "buttonMessage", color: "#64b5f6", icon: <MdSmartButton size={24} /> },
  { label: "List Message", type: "listMessage", color: "#9575cd", icon: <FaRegListAlt size={24} /> },
  { label: "Send Location", type: "sendLocation", color: "#4caf50", icon: <FaLocationArrow size={24} /> },
  { label: "Assign Chat to Agent", type: "assignChatToAgent", color: "#ff8a65", icon: <FaUserTie size={24} /> },
  { label: "Disable Chatbot", type: "disableChatbot", color: "#90a4ae", icon: <FaBan size={24} /> },
  { label: "Receive the API", type: "receiveApi", color: "#e91e63", icon: <FaPlug size={24} /> },
  { label: "Take Input", type: "takeInput", color: "#ff9800", icon: <FaKeyboard size={24} /> },
  { label: "Condition", type: "condition", color: "#673ab7", icon: <FaCodeBranch size={24} /> },
  { label: "Set Variable", type: "setVariable", color: "#8bc34a", icon: <MdOutlineAccessibility  size={24} /> },
  { label: "Close Chat", type: "closeChat", color: "#03a9f4", icon: <FaTimesCircle size={24} /> },
  { label: "OpenAI", type: "openAi", color: "#3f51b5", icon: <FaRobot size={24} /> },
  { label: "GPT-4", type: "gpt4", color: "#9c27b0", icon: <FaBrain size={24} /> },
  { label: "Add Msg History", type: "addMsgHistory", color: "#ff5722", icon: <FaHistory size={24} /> },
];


const ChatFlow = () => {
  const reactFlowWrapper = useRef(null);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [flowTitle, setFlowTitle] = useState("");

  // Keep a ref to the ReactFlow instance so we can do fitView, etc.
  const onInit = useCallback((instance) => {
    // Example: automatically fit view on init
    instance.fitView();
  }, []);

  const onConnect = useCallback(
    (connection) => setEdges((eds) => addEdge(connection, eds)),
    []
  );

  const handleRemoveNode = (nodeId) => {
    setNodes((nds) => nds.filter((node) => node.id !== nodeId));
  };
  
  // Generic function to create a new node by type
  const handleAddNode = (nodeType) => {
    setNodes((nds) => [
      ...nds,
      {
        id: `${nodeType}_${Date.now()}`,
        type: nodeType,
        position: { x: 250, y: 100 },
        data: {
          onChange: (newData) => handleNodeDataChange(newData),
          onRemove: handleRemoveNode, 
        },
        draggable: true,
      },
    ]);
    setIsModalOpen(false);
  };

  // Merge updated data from node into the node array
  const handleNodeDataChange = (newData) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.data && node.data.onChange === newData.onChange) {
          return {
            ...node,
            data: {
              ...newData,
              onChange: node.data.onChange, // keep the callback
            },
          };
        }
        return node;
      })
    );
  };

  const handleSaveFlow = async () => {
    try {
      const token = localStorage.getItem("userToken");
  
      if (!flowTitle) {
        Swal.fire("Error", "Please provide a title for your flow.", "error");
        return;
      }
  
      if (!nodes.length || !edges.length) {
        Swal.fire("Error", "At least one node and one edge are required.", "error");
        return;
      }
  
      const flowId = `flow_${Date.now()}`; // Generate a unique flow ID
  
      const payload = {
        title: flowTitle,
        nodes,
        edges,
        flowId,
      };
  
      console.log("Saving Flow Payload:", payload); // Debugging
  
      const response = await axios.post(`${BASE_URL}/api/chat_flow/add_new`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
  
      if (response.data.success) {
        Swal.fire("Success", "Flow was saved successfully!", "success");
      } else {
        Swal.fire("Error", response.data.msg || "Failed to save flow", "error");
      }
    } catch (err) {
      console.error("Save Flow Error:", err);
      Swal.fire("Error", err.message || "Unexpected error occurred", "error");
    }
  };
  

  return (
    <div className="chatflow-container">
      <div className="chatflow-header">
        <input
          type="text"
          placeholder="Flow Title"
          value={flowTitle}
          onChange={(e) => setFlowTitle(e.target.value)}
          className="flow-title-input"
        />

        <button onClick={() => setIsModalOpen(true)}>+ Add New</button>
        <button onClick={handleSaveFlow}>Save Flow</button>
      </div>

      {/* Modal for selecting a node type */}
      {isModalOpen && (
        <div className="_modal-overlay">
          <div className="_modal-content">
            <div className="d-flex justify-content-between align-items-center">
              <h3>Select a Node Type</h3>
              <button className="close-modal-btn" onClick={() => setIsModalOpen(false)}>
                Close
              </button>
            </div>
            <div className="node-types-grid">
              {nodeDefinitions.map((def) => (
                <div
                  key={def.type}
                  className="node-type-card d-flex flex-row align-items-left"
                  style={{ backgroundColor: def.color }}
                  onClick={() => handleAddNode(def.type)}
                >
                   <span className="node-type-icon">{def.icon}</span>
                   <span className="node-type-label">{def.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}


      <div className="chatflow-wrapper" ref={reactFlowWrapper}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          onInit={onInit}
          fitView
          proOptions={{ hideAttribution: true }}
        >
          <MiniMap
            style={{ height: 80, width: 120, bottom: 10, left: 10 }}
            zoomable
            pannable
          />
          <Controls style={{ top: 10, left: 10, width: 20, height: 200 }} />
          <Background />
        </ReactFlow>
      </div>
    </div>
  );
};

export default ChatFlow;
