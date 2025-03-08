import React, { useCallback, useState, useRef, useEffect } from "react";
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

import { 
  FaFont, FaImage, FaMusic, FaVideo, FaFileAlt, FaRegListAlt, 
  FaLocationArrow, FaUserTie, FaBan, FaPlug, FaKeyboard, 
  FaCodeBranch, FaExchangeAlt, FaTimesCircle, FaRobot, 
  FaBrain, FaHistory, FaChevronDown, FaChevronUp, FaSearch 
} from "react-icons/fa";
import { MdSmartButton, MdOutlineAccessibility } from "react-icons/md";

// Node definitions grouped by category
const nodeGroups = [
  {
    id: "messages",
    title: "Message Nodes",
    color: "#4dabf7",
    icon: <FaFont size={20} />,
    nodes: [
      { label: "Simple Text", type: "simpleText", color: "#ff6b6b", icon: <FaFont size={20} />, description: "Send a simple text message" },
      { label: "Image Message", type: "imageMessage", color: "#4dabf7", icon: <FaImage size={20} />, description: "Send an image with caption" },
      { label: "Audio Message", type: "audioMessage", color: "#f06292", icon: <FaMusic size={20} />, description: "Send an audio message" },
      { label: "Video Message", type: "videoMessage", color: "#ba68c8", icon: <FaVideo size={20} />, description: "Send a video message" },
      { label: "Document Message", type: "documentMessage", color: "#ffd54f", icon: <FaFileAlt size={20} />, description: "Send a document file" },
      { label: "Button Message", type: "buttonMessage", color: "#64b5f6", icon: <MdSmartButton size={20} />, description: "Send message with buttons" },
      { label: "List Message", type: "listMessage", color: "#9575cd", icon: <FaRegListAlt size={20} />, description: "Send a list of options" },
      { label: "Send Location", type: "sendLocation", color: "#4caf50", icon: <FaLocationArrow size={20} />, description: "Share a location" },
    ]
  },
  {
    id: "actions",
    title: "Action Nodes",
    color: "#ff8a65",
    icon: <FaUserTie size={20} />,
    nodes: [
      { label: "Assign Chat to Agent", type: "assignChatToAgent", color: "#ff8a65", icon: <FaUserTie size={20} />, description: "Transfer chat to a human agent" },
      { label: "Disable Chatbot", type: "disableChatbot", color: "#90a4ae", icon: <FaBan size={20} />, description: "Disable the chatbot for this conversation" },
      { label: "Receive API", type: "receiveApi", color: "#e91e63", icon: <FaPlug size={20} />, description: "Call an external API" },
      { label: "Close Chat", type: "closeChat", color: "#03a9f4", icon: <FaTimesCircle size={20} />, description: "End the conversation" },
    ]
  },
  {
    id: "logic",
    title: "Logic Nodes",
    color: "#673ab7",
    icon: <FaCodeBranch size={20} />,
    nodes: [
      { label: "Take Input", type: "takeInput", color: "#ff9800", icon: <FaKeyboard size={20} />, description: "Wait for user input" },
      { label: "Condition", type: "condition", color: "#673ab7", icon: <FaCodeBranch size={20} />, description: "Create a conditional branch" },
      { label: "Set Variable", type: "setVariable", color: "#8bc34a", icon: <MdOutlineAccessibility size={20} />, description: "Set a variable value" },
    ]
  },
  {
    id: "ai",
    title: "AI Nodes",
    color: "#3f51b5",
    icon: <FaRobot size={20} />,
    nodes: [
      { label: "OpenAI", type: "openAi", color: "#3f51b5", icon: <FaRobot size={20} />, description: "Generate text with OpenAI" },
      { label: "GPT-4", type: "gpt4", color: "#9c27b0", icon: <FaBrain size={20} />, description: "Use GPT-4 for advanced responses" },
      { label: "Add Msg History", type: "addMsgHistory", color: "#ff5722", icon: <FaHistory size={20} />, description: "Add message to conversation history" },
    ]
  }
];

// Flatten node definitions for search
const allNodeDefinitions = nodeGroups.flatMap(group => group.nodes);

const ChatFlow = () => {
  const reactFlowWrapper = useRef(null);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [flowTitle, setFlowTitle] = useState("");
  const [expandedGroups, setExpandedGroups] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredGroups, setFilteredGroups] = useState(nodeGroups);

  // Initialize expanded state for all groups
  useEffect(() => {
    const initialExpandedState = {};
    nodeGroups.forEach(group => {
      initialExpandedState[group.id] = false;
    });
    setExpandedGroups(initialExpandedState);
  }, []);

  // Filter nodes based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredGroups(nodeGroups);
      return;
    }

    const term = searchTerm.toLowerCase();
    const filtered = nodeGroups.map(group => {
      const filteredNodes = group.nodes.filter(node => 
        node.label.toLowerCase().includes(term) || 
        node.description.toLowerCase().includes(term)
      );
      
      return {
        ...group,
        nodes: filteredNodes
      };
    }).filter(group => group.nodes.length > 0);

    setFilteredGroups(filtered);
    
    // Auto-expand groups that have matching nodes
    const newExpandedState = {...expandedGroups};
    filtered.forEach(group => {
      newExpandedState[group.id] = true;
    });
    setExpandedGroups(newExpandedState);
  }, [searchTerm]);

  // Keep a ref to the ReactFlow instance
  const [reactFlowInstance, setReactFlowInstance] = useState(null);
  const onInit = useCallback((instance) => {
    setReactFlowInstance(instance);
    instance.fitView();
  }, []);

  const onConnect = useCallback(
    (connection) => setEdges((eds) => addEdge(connection, eds)),
    []
  );

  const handleRemoveNode = (nodeId) => {
    setNodes((nds) => nds.filter((node) => node.id !== nodeId));
  };
  
  // Add a node by clicking
  const handleAddNode = (nodeType) => {
    const position = { x: 250, y: 100 };
    
    if (reactFlowInstance) {
      // Get the center of the viewport
      const { x, y, zoom } = reactFlowInstance.getViewport();
      position.x = -x / zoom + 100;
      position.y = -y / zoom + 100;
    }
    
    setNodes((nds) => [
      ...nds,
      {
        id: `${nodeType}_${Date.now()}`,
        type: nodeType,
        position,
        data: {
          onChange: (newData) => handleNodeDataChange(newData),
          onRemove: handleRemoveNode, 
        },
        draggable: true,
      },
    ]);
  };

  // Handle drag and drop
  const onDragStart = (event, nodeType) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();

      const nodeType = event.dataTransfer.getData('application/reactflow');
      
      if (!nodeType || !reactFlowInstance) {
        return;
      }

      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      setNodes((nds) => [
        ...nds,
        {
          id: `${nodeType}_${Date.now()}`,
          type: nodeType,
          position,
          data: {
            onChange: (newData) => handleNodeDataChange(newData),
            onRemove: handleRemoveNode,
          },
          draggable: true,
        },
      ]);
    },
    [reactFlowInstance]
  );

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
              onRemove: node.data.onRemove, // keep the remove callback
            },
          };
        }
        return node;
      })
    );
  };

  const toggleGroup = (groupId) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupId]: !prev[groupId]
    }));
  };

  const handleSaveFlow = async () => {
    try {
      const token = localStorage.getItem("userToken");
  
      if (!flowTitle) {
        Swal.fire("Error", "Please provide a title for your flow.", "error");
        return;
      }
  
      if (!nodes.length) {
        Swal.fire("Error", "At least one node is required.", "error");
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
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
          {isSidebarOpen ? "Hide Nodes" : "Show Nodes"}
        </button>
        <button onClick={handleSaveFlow}>Save Flow</button>
      </div>

      <div className="d-flex" style={{ height: "calc(100% - 50px)" }}>
        {/* Sidebar with grouped node types */}
        {isSidebarOpen && (
          <div 
            className="node-sidebar" 
            style={{ 
              width: "280px", 
              height: "100%", 
              overflowY: "auto", 
              background: "#f8f9fa", 
              borderRight: "1px solid #dee2e6",
              padding: "10px"
            }}
          >
            <div className="search-container" style={{ marginBottom: "15px" }}>
              <div className="position-relative">
                <input
                  type="text"
                  placeholder="Search nodes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="form-control"
                  style={{ 
                    paddingLeft: "30px", 
                    borderRadius: "4px",
                    border: "1px solid #ced4da"
                  }}
                />
                <FaSearch 
                  style={{ 
                    position: "absolute", 
                    left: "10px", 
                    top: "50%", 
                    transform: "translateY(-50%)",
                    color: "#6c757d"
                  }} 
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    style={{
                      position: "absolute",
                      right: "10px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      background: "none",
                      border: "none",
                      color: "#6c757d",
                      cursor: "pointer"
                    }}
                  >
                    ×
                  </button>
                )}
              </div>
            </div>

            {filteredGroups.map((group) => (
              <div key={group.id} className="node-group mb-3">
                <div 
                  className="group-header d-flex justify-content-between align-items-center p-2"
                  onClick={() => toggleGroup(group.id)}
                  style={{ 
                    backgroundColor: group.color,
                    color: "white",
                    borderRadius: "4px",
                    cursor: "pointer"
                  }}
                >
                  <div className="d-flex align-items-center">
                    {group.icon}
                    <span className="ms-2 fw-bold">{group.title}</span>
                  </div>
                  {expandedGroups[group.id] ? <FaChevronUp /> : <FaChevronDown />}
                </div>
                
                {expandedGroups[group.id] && (
                  <div className="group-content mt-2">
                    {group.nodes.map((node) => (
                      <div
                        key={node.type}
                        className="node-item d-flex align-items-center p-2 mb-2"
                        style={{ 
                          backgroundColor: "white", 
                          border: `1px solid ${node.color}`,
                          borderLeft: `4px solid ${node.color}`,
                          borderRadius: "4px",
                          cursor: "grab"
                        }}
                        onClick={() => handleAddNode(node.type)}
                        draggable
                        onDragStart={(e) => onDragStart(e, node.type)}
                      >
                        <div 
                          className="node-icon me-2" 
                          style={{ 
                            color: node.color,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center"
                          }}
                        >
                          {node.icon}
                        </div>
                        <div>
                          <div className="node-label fw-medium">{node.label}</div>
                          <div className="node-description small text-muted">{node.description}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Flow builder area */}
        <div 
          className="flow-container" 
          style={{ 
            flex: 1, 
            height: "100%", 
            position: "relative" 
          }}
          ref={reactFlowWrapper}
        >
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            onInit={onInit}
            onDrop={onDrop}
            onDragOver={onDragOver}
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
    </div>
  );
};

export default ChatFlow;
