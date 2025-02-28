import React, { useState, useCallback, useRef, useEffect } from "react";
import {
  ReactFlow,
  Background,
  MiniMap,
  Controls,
  addEdge,
  useNodesState,
  useEdgesState,
  useReactFlow,
} from "@xyflow/react";
import Modal from "react-modal";
import "../Styles/chatflow.css";

// Node Components
const SimpleTextNode = ({ data, id, removeNode }) => (
  <div className="node simple-text">
    <button className="close-node" onClick={() => removeNode(id)}>✖</button>
    <h4>Simple Text</h4>
    <textarea placeholder="Type message..." defaultValue={data?.message} />
  </div>
);

const LocationNode = ({ data, id, removeNode }) => (
  <div className="node location-node">
    <button className="close-node" onClick={() => removeNode(id)}>✖</button>
    <h4>Location</h4>
    <input type="text" placeholder="Name" defaultValue={data?.name} />
    <input type="text" placeholder="Address" defaultValue={data?.address} />
    <input type="text" placeholder="Latitude" defaultValue={data?.lat} />
    <input type="text" placeholder="Longitude" defaultValue={data?.lng} />
  </div>
);

const ImageNode = ({ data, id, removeNode }) => (
  <div className="node image-node">
    <button className="close-node" onClick={() => removeNode(id)}>✖</button>
    <h4>Image</h4>
    <button>+ Upload</button>
    <textarea placeholder="Caption" defaultValue={data?.caption} />
  </div>
);

const nodeTypes = {
  simpleText: SimpleTextNode,
  location: LocationNode,
  image: ImageNode,
};

export default function ChatFlow() {
  const reactFlowWrapper = useRef(null);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [templateName, setTemplateName] = useState("");
  const { zoomIn, zoomOut, project } = useReactFlow();

  useEffect(() => {
    const savedTemplate = localStorage.getItem('chatTemplate');
    if (savedTemplate) {
      const { nodes: savedNodes, edges: savedEdges } = JSON.parse(savedTemplate);
      setNodes(savedNodes);
      setEdges(savedEdges);
    }
  }, []);

  const addNode = (type) => {
    const newId = Date.now().toString();
    const newNode = {
      id: newId,
      type,
      position: project({ x: window.innerWidth / 2 - 100, y: window.innerHeight / 2 - 50 }),
      data: {},
      draggable: true,
    };
    setNodes((prev) => [...prev, newNode]);
    setModalOpen(false);
  };

  const removeNode = (id) => {
    setNodes((prevNodes) => prevNodes.filter((node) => node.id !== id));
  };

  const saveTemplate = () => {
    const template = { nodes, edges };
    localStorage.setItem('chatTemplate', JSON.stringify(template));
    alert('Template saved successfully!');
    setTemplateName("");
  };

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  return (
    <div className="chatflow-container">
      <div className="left-sidebar">
        <h2>Chat Flow Builder</h2>
        <div className="sidebar-controls">
          <input
            type="text"
            placeholder="Template name"
            value={templateName}
            onChange={(e) => setTemplateName(e.target.value)}
          />
          <button className="save-button" onClick={saveTemplate}>
            Save Template
          </button>
          <button className="add-node-button" onClick={() => setModalOpen(true)}>
            + Add Node
          </button>
        </div>
      </div>

      <div className="flow-area" ref={reactFlowWrapper}>
        <div className="flow-controls">
          <button onClick={() => zoomIn()}>Zoom In</button>
          <button onClick={() => zoomOut()}>Zoom Out</button>
        </div>

        <ReactFlow
          nodes={nodes.map((node) => ({
            ...node,
            data: { ...node.data, removeNode },
          }))}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          fitView
          minZoom={0.1}
          maxZoom={2}
        >
          <Background variant="dots" gap={20} size={1} />
          <Controls className="flow-controls" />
          <MiniMap className="flow-minimap" />
        </ReactFlow>
      </div>

      <Modal
        isOpen={modalOpen}
        onRequestClose={() => setModalOpen(false)}
        className="node-modal"
        overlayClassName="node-overlay"
      >
        <div className="modal-header">
          <h3>Select Node Type</h3>
          <button className="close-btn" onClick={() => setModalOpen(false)}>✖</button>
        </div>
        <div className="modal-content">
          <button className="node-type-btn" onClick={() => addNode("simpleText")}>
            Simple Text
          </button>
          <button className="node-type-btn" onClick={() => addNode("location")}>
            Send Location
          </button>
          <button className="node-type-btn" onClick={() => addNode("image")}>
            Image Message
          </button>
        </div>
      </Modal>
    </div>
  );
}