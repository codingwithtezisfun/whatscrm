import React from "react";
import { Handle, Position } from "reactflow";
import axios from "axios";
import Swal from "sweetalert2";
import "../Styles/nodes.css";
import { IoIosCloseCircle } from "react-icons/io";
import { IoSaveSharp } from "react-icons/io5";

// Helper function to call the backend templet API
const saveTemplate = async (nodeType, title, content) => {
  try {
    const payload = { title: title || "Untitled Template", type: nodeType, content };
    const response = await axios.post("/api/templet/add_new", payload);
    if (response.data.success) {
      Swal.fire("Template saved", "Your node has been saved as a template", "success");
    } else {
      Swal.fire("Error", response.data.msg || "Could not save template", "error");
    }
  } catch (err) {
    Swal.fire("Error", err.message || "Unexpected error", "error");
  }
};

// ----------------- Simple Text Node -----------------
export const SimpleTextNode = ({ data, isConnectable, id }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    data.onChange({ ...data, [name]: value });
  };

  const handleRemoveNode = () => {
    if (data.onRemove) data.onRemove(id);
  };

  const handleSaveTemplate = () => {
    const content = { title: data.title, message: data.message };
    saveTemplate("simpleText", data.title, content);
  };

  return (
    <div className="node-container simple-text-node">
      <div className="node-header node-header-1 d-flex justify-content-between align-items-center">
        <span>Simple Text</span>
        <div>
         <IoIosCloseCircle onClick={handleRemoveNode} className="node-close-btn"/>
         <IoSaveSharp onClick={handleSaveTemplate} className="node-save-btn" />
        </div>
      </div>
      <div className="node-body">
        <label>Title:</label>
        <input
          name="title"
          value={data.title || ""}
          onChange={handleChange}
          className="form-control"
        />
        <label>Message:</label>
        <input
          name="message"
          value={data.message || ""}
          onChange={handleChange}
          className="form-control"
        />
      </div>
      <Handle type="source" position={Position.Right} isConnectable={isConnectable} />
      <Handle type="target" position={Position.Left} isConnectable={isConnectable} />
    </div>
  );
};

// ----------------- Image Message Node -----------------
export const ImageMessageNode = ({ data, isConnectable, id }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    data.onChange({ ...data, [name]: value });
  };

  const handleRemoveNode = () => {
    if (data.onRemove) data.onRemove(id);
  };

  const handleSaveTemplate = () => {
    const content = { imageUrl: data.imageUrl, caption: data.caption };
    saveTemplate("imageMessage", data.caption || "Image Template", content);
  };

  return (
    <div className="node-container image-message-node">
      <div className="node-header node-header-2 d-flex justify-content-between align-items-center">
        <span>Image Message</span>
        <div>
         <IoIosCloseCircle onClick={handleRemoveNode} className="node-close-btn"/>
         <IoSaveSharp onClick={handleSaveTemplate} className="node-save-btn" />
        </div>
      </div>
      <div className="node-body">
        <label>Image URL:</label>
        <input
          name="imageUrl"
          value={data.imageUrl || ""}
          onChange={handleChange}
          className="form-control"
        />
        <label>Caption:</label>
        <input
          name="caption"
          value={data.caption || ""}
          onChange={handleChange}
          className="form-control"
        />
      </div>
      <Handle type="source" position={Position.Right} isConnectable={isConnectable} />
      <Handle type="target" position={Position.Left} isConnectable={isConnectable} />
    </div>
  );
};

// ----------------- Audio Message Node -----------------
export const AudioMessageNode = ({ data, isConnectable, id }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    data.onChange({ ...data, [name]: value });
  };

  const handleRemoveNode = () => {
    if (data.onRemove) data.onRemove(id);
  };

  const handleSaveTemplate = () => {
    const content = { audioUrl: data.audioUrl };
    saveTemplate("audioMessage", "Audio Template", content);
  };

  return (
    <div className="node-container audio-message-node">
      <div className="node-header node-header-3 d-flex justify-content-between align-items-center">
        <span>Audio Message</span>
        <div>
         <IoIosCloseCircle onClick={handleRemoveNode} className="node-close-btn"/>
         <IoSaveSharp onClick={handleSaveTemplate} className="node-save-btn" />
        </div>
      </div>
      <div className="node-body">
        <label>Audio URL:</label>
        <input
          name="audioUrl"
          value={data.audioUrl || ""}
          onChange={handleChange}
          className="form-control"
        />
      </div>
      <Handle type="source" position={Position.Right} isConnectable={isConnectable} />
      <Handle type="target" position={Position.Left} isConnectable={isConnectable} />
    </div>
  );
};

// ----------------- Video Message Node -----------------
export const VideoMessageNode = ({ data, isConnectable, id }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    data.onChange({ ...data, [name]: value });
  };

  const handleRemoveNode = () => {
    if (data.onRemove) data.onRemove(id);
  };

  const handleSaveTemplate = () => {
    const content = { videoUrl: data.videoUrl };
    saveTemplate("videoMessage", "Video Template", content);
  };

  return (
    <div className="node-container video-message-node">
      <div className="node-header node-header-4 d-flex justify-content-between align-items-center">
        <span>Video Message</span>
        <div>
         <IoIosCloseCircle onClick={handleRemoveNode} className="node-close-btn"/>
         <IoSaveSharp onClick={handleSaveTemplate} className="node-save-btn" />
        </div>
      </div>
      <div className="node-body">
        <label>Video URL:</label>
        <input
          name="videoUrl"
          value={data.videoUrl || ""}
          onChange={handleChange}
          className="form-control"
        />
      </div>
      <Handle type="source" position={Position.Right} isConnectable={isConnectable} />
      <Handle type="target" position={Position.Left} isConnectable={isConnectable} />
    </div>
  );
};

// ----------------- Document Message Node -----------------
export const DocumentMessageNode = ({ data, isConnectable, id }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    data.onChange({ ...data, [name]: value });
  };

  const handleRemoveNode = () => {
    if (data.onRemove) data.onRemove(id);
  };

  const handleSaveTemplate = () => {
    const content = { docUrl: data.docUrl };
    saveTemplate("documentMessage", "Document Template", content);
  };

  return (
    <div className="node-container document-message-node">
      <div className="node-header-5 node-header- d-flex justify-content-between align-items-center">
        <span>Document Message</span>
        <div>
         <IoIosCloseCircle onClick={handleRemoveNode} className="node-close-btn"/>
         <IoSaveSharp onClick={handleSaveTemplate} className="node-save-btn" />
        </div>
      </div>
      <div className="node-body">
        <label>Document URL:</label>
        <input
          name="docUrl"
          value={data.docUrl || ""}
          onChange={handleChange}
          className="form-control"
        />
      </div>
      <Handle type="source" position={Position.Right} isConnectable={isConnectable} />
      <Handle type="target" position={Position.Left} isConnectable={isConnectable} />
    </div>
  );
};

// ----------------- Button Message Node -----------------
export const ButtonMessageNode = ({ data, isConnectable, id }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    data.onChange({ ...data, [name]: value });
  };
  
  const handleRemoveNode = () => {
    if (data.onRemove) data.onRemove(id);
  };

  const handleSaveTemplate = () => {
    const content = { buttonText: data.buttonText };
    saveTemplate("buttonMessage", "Button Template", content);
  };

  return (
    <div className="node-container button-message-node">
      <div className="node-header node-header-6 d-flex justify-content-between align-items-center">
        <span>Button Message</span>
        <div>
         <IoIosCloseCircle onClick={handleRemoveNode} className="node-close-btn"/>
         <IoSaveSharp onClick={handleSaveTemplate} className="node-save-btn" />
        </div>
      </div>
      <div className="node-body">
        <label>Button Text:</label>
        <input
          name="buttonText"
          value={data.buttonText || ""}
          onChange={handleChange}
          className="form-control"
        />
      </div>
      <Handle type="source" position={Position.Right} isConnectable={isConnectable} />
      <Handle type="target" position={Position.Left} isConnectable={isConnectable} />
    </div>
  );
};

// ----------------- List Message Node -----------------
export const ListMessageNode = ({ data, isConnectable, id }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    data.onChange({ ...data, [name]: value });
  };

  const handleRemoveNode = () => {
    if (data.onRemove) data.onRemove(id);
  };

  const handleSaveTemplate = () => {
    const content = {
      header: data.header,
      body: data.body,
      footer: data.footer,
      buttons: data.buttons,
    };
    saveTemplate("listMessage", "List Template", content);
  };

  return (
    <div className="node-container list-message-node">
      <div className="node-header node-header-7 d-flex justify-content-between align-items-center">
        <span>List Message</span>
        <div>
         <IoIosCloseCircle onClick={handleRemoveNode} className="node-close-btn"/>
         <IoSaveSharp onClick={handleSaveTemplate} className="node-save-btn" />
        </div>
      </div>
      <div className="node-body">
        <label>Header:</label>
        <input name="header" value={data.header || ""} onChange={handleChange} className="form-control" />
        <label>Body:</label>
        <textarea name="body" value={data.body || ""} onChange={handleChange} className="form-control" />
        <label>Footer:</label>
        <input name="footer" value={data.footer || ""} onChange={handleChange} className="form-control" />
        <label>Buttons (comma-separated):</label>
        <input name="buttons" value={data.buttons || ""} onChange={handleChange} className="form-control" />
      </div>
      <Handle type="source" position={Position.Right} isConnectable={isConnectable} />
      <Handle type="target" position={Position.Left} isConnectable={isConnectable} />
    </div>
  );
};

// ----------------- Send Location Node -----------------
export const SendLocationNode = ({ data, isConnectable, id }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    data.onChange({ ...data, [name]: value });
  };

  const handleRemoveNode = () => {
    if (data.onRemove) data.onRemove(id);
  };

  const handleSaveTemplate = () => {
    const content = { latitude: data.latitude, longitude: data.longitude };
    saveTemplate("sendLocation", "Location Template", content);
  };

  return (
    <div className="node-container send-location-node">
      <div className="node-header node-header-8 d-flex justify-content-between align-items-center">
        <span>Send Location</span>
        <div>
         <IoIosCloseCircle onClick={handleRemoveNode} className="node-close-btn"/>
         <IoSaveSharp onClick={handleSaveTemplate} className="node-save-btn" />
        </div>
      </div>
      <div className="node-body">
        <label>Latitude:</label>
        <input name="latitude" value={data.latitude || ""} onChange={handleChange} className="form-control" />
        <label>Longitude:</label>
        <input name="longitude" value={data.longitude || ""} onChange={handleChange} className="form-control" />
      </div>
      <Handle type="source" position={Position.Right} isConnectable={isConnectable} />
      <Handle type="target" position={Position.Left} isConnectable={isConnectable} />
    </div>
  );
};

// ----------------- Assign Chat to Agent Node -----------------
export const AssignChatToAgentNode = ({ data, isConnectable, id }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    data.onChange({ ...data, [name]: value });
  };

  const handleRemoveNode = () => {
    if (data.onRemove) data.onRemove(id);
  };

  const handleSaveTemplate = () => {
    const content = { agentId: data.agentId };
    saveTemplate("assignChatToAgent", "Assign Chat Template", content);
  };

  return (
    <div className="node-container assign-chat-agent-node">
      <div className="node-header node-header-9 d-flex justify-content-between align-items-center">
        <span>Assign Chat to Agent</span>
        <div>
         <IoIosCloseCircle onClick={handleRemoveNode} className="node-close-btn"/>
         <IoSaveSharp onClick={handleSaveTemplate} className="node-save-btn" />
        </div>
      </div>
      <div className="node-body">
        <label>Agent Name/ID:</label>
        <input name="agentId" value={data.agentId || ""} onChange={handleChange} className="form-control" />
      </div>
      <Handle type="source" position={Position.Right} isConnectable={isConnectable} />
      <Handle type="target" position={Position.Left} isConnectable={isConnectable} />
    </div>
  );
};

// ----------------- Disable Chatbot Node -----------------
export const DisableChatbotNode = ({ data, isConnectable, id }) => {
  const handleRemoveNode = () => {
    if (data.onRemove) data.onRemove(id);
  };

  const handleSaveTemplate = () => {
    const content = { info: "Disable Chatbot" };
    saveTemplate("disableChatbot", "Disable Chatbot Template", content);
  };

  return (
    <div className="node-container disable-chatbot-node">
      <div className="node-header node-header-10 d-flex justify-content-between align-items-center">
        <span>Disable Chatbot</span>
        <div>
         <IoIosCloseCircle onClick={handleRemoveNode} className="node-close-btn"/>
         <IoSaveSharp onClick={handleSaveTemplate} className="node-save-btn" />
        </div>
      </div>
      <div className="node-body">
        <p>This node will disable the chatbot.</p>
      </div>
      <Handle type="source" position={Position.Right} isConnectable={isConnectable} />
      <Handle type="target" position={Position.Left} isConnectable={isConnectable} />
    </div>
  );
};

// ----------------- Receive API Node -----------------
export const ReceiveApiNode = ({ data, isConnectable, id }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    data.onChange({ ...data, [name]: value });
  };

  const handleRemoveNode = () => {
    if (data.onRemove) data.onRemove(id);
  };

  const handleSaveTemplate = () => {
    const content = { endpoint: data.endpoint, method: data.method };
    saveTemplate("receiveApi", "Receive API Template", content);
  };

  return (
    <div className="node-container receive-api-node">
      <div className="node-header node-header-11 d-flex justify-content-between align-items-center">
        <span>Receive API</span>
        <div>
         <IoIosCloseCircle onClick={handleRemoveNode} className="node-close-btn"/>
         <IoSaveSharp onClick={handleSaveTemplate} className="node-save-btn" />
        </div>
      </div>
      <div className="node-body">
        <label>Endpoint:</label>
        <input name="endpoint" value={data.endpoint || ""} onChange={handleChange} className="form-control" />
        <label>Method:</label>
        <select name="method" value={data.method || "GET"} onChange={handleChange} className="form-control">
          <option>GET</option>
          <option>POST</option>
          <option>PUT</option>
          <option>DELETE</option>
        </select>
      </div>
      <Handle type="source" position={Position.Right} isConnectable={isConnectable} />
      <Handle type="target" position={Position.Left} isConnectable={isConnectable} />
    </div>
  );
};

// ----------------- Take Input Node -----------------
export const TakeInputNode = ({ data, isConnectable, id }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    data.onChange({ ...data, [name]: value });
  };

  const handleRemoveNode = () => {
    if (data.onRemove) data.onRemove(id);
  };

  const handleSaveTemplate = () => {
    const content = { prompt: data.prompt };
    saveTemplate("takeInput", "Take Input Template", content);
  };

  return (
    <div className="node-container take-input-node">
      <div className="node-header node-header-12 d-flex justify-content-between align-items-center">
        <span>Take Input</span>
        <div>
         <IoIosCloseCircle onClick={handleRemoveNode} className="node-close-btn"/>
         <IoSaveSharp onClick={handleSaveTemplate} className="node-save-btn" />
        </div>
      </div>
      <div className="node-body">
        <label>Prompt:</label>
        <input name="prompt" value={data.prompt || ""} onChange={handleChange} className="form-control" />
      </div>
      <Handle type="source" position={Position.Right} isConnectable={isConnectable} />
      <Handle type="target" position={Position.Left} isConnectable={isConnectable} />
    </div>
  );
};

// ----------------- Condition Node -----------------
export const ConditionNode = ({ data, isConnectable, id }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    data.onChange({ ...data, [name]: value });
  };

  const handleRemoveNode = () => {
    if (data.onRemove) data.onRemove(id);
  };

  const handleSaveTemplate = () => {
    const content = { condition: data.condition, if: data.if, then: data.then };
    saveTemplate("condition", "Condition Template", content);
  };

  return (
    <div className="node-container condition-node">
      <div className="node-header node-header-13 d-flex justify-content-between align-items-center">
        <span>Condition</span>
        <div>
         <IoIosCloseCircle onClick={handleRemoveNode} className="node-close-btn"/>
         <IoSaveSharp onClick={handleSaveTemplate} className="node-save-btn" />
        </div>
      </div>
      <div className="node-body">
        <label>Condition:</label>
        <input name="condition" value={data.condition || ""} onChange={handleChange} className="form-control" />
        <label>If:</label>
        <input name="if" value={data.if || ""} onChange={handleChange} className="form-control" />
        <label>Then:</label>
        <input name="then" value={data.then || ""} onChange={handleChange} className="form-control" />
      </div>
      <Handle type="source" position={Position.Right} isConnectable={isConnectable} />
      <Handle type="target" position={Position.Left} isConnectable={isConnectable} />
    </div>
  );
};

// ----------------- Set Variable Node -----------------
export const SetVariableNode = ({ data, isConnectable, id }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    data.onChange({ ...data, [name]: value });
  };

  const handleRemoveNode = () => {
    if (data.onRemove) data.onRemove(id);
  };

  const handleSaveTemplate = () => {
    const content = { variableName: data.variableName, value: data.value };
    saveTemplate("setVariable", "Set Variable Template", content);
  };

  return (
    <div className="node-container set-variable-node">
      <div className="node-header node-header-14 d-flex justify-content-between align-items-center">
        <span>Set Variable</span>
        <div>
         <IoIosCloseCircle onClick={handleRemoveNode} className="node-close-btn"/>
         <IoSaveSharp onClick={handleSaveTemplate} className="node-save-btn" />
        </div>
      </div>
      <div className="node-body">
        <label>Variable Name:</label>
        <input name="variableName" value={data.variableName || ""} onChange={handleChange} className="form-control" />
        <label>Value:</label>
        <input name="value" value={data.value || ""} onChange={handleChange} className="form-control" />
      </div>
      <Handle type="source" position={Position.Right} isConnectable={isConnectable} />
      <Handle type="target" position={Position.Left} isConnectable={isConnectable} />
    </div>
  );
};

// ----------------- Close Chat Node -----------------
export const CloseChatNode = ({ data, isConnectable, id }) => {
  const handleRemoveNode = () => {
    if (data.onRemove) data.onRemove(id);
  };

  const handleSaveTemplate = () => {
    const content = { info: "Close Chat" };
    saveTemplate("closeChat", "Close Chat Template", content);
  };

  return (
    <div className="node-container close-chat-node">
      <div className="node-header node-header-15 d-flex justify-content-between align-items-center">
        <span>Close Chat</span>
        <div>
         <IoIosCloseCircle onClick={handleRemoveNode} className="node-close-btn"/>
         <IoSaveSharp onClick={handleSaveTemplate} className="node-save-btn" />
        </div>
      </div>
      <div className="node-body">
        <p>This node will close the chat.</p>
      </div>
      <Handle type="source" position={Position.Right} isConnectable={isConnectable} />
      <Handle type="target" position={Position.Left} isConnectable={isConnectable} />
    </div>
  );
};

// ----------------- OpenAI Node -----------------
export const OpenAiNode = ({ data, isConnectable, id }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    data.onChange({ ...data, [name]: value });
  };
  
  const handleRemoveNode = () => {
    if (data.onRemove) data.onRemove(id);
  };

  const handleSaveTemplate = () => {
    const content = { prompt: data.prompt, settings: data.settings };
    saveTemplate("openAi", "OpenAI Template", content);
  };

  return (
    <div className="node-container openai-node">
      <div className="node-header node-header-16 d-flex justify-content-between align-items-center">
        <span>OpenAI</span>
        <div>
         <IoIosCloseCircle onClick={handleRemoveNode} className="node-close-btn"/>
         <IoSaveSharp onClick={handleSaveTemplate} className="node-save-btn" />
        </div>
      </div>
      <div className="node-body">
        <label>Prompt:</label>
        <input name="prompt" value={data.prompt || ""} onChange={handleChange} className="form-control" />
        <label>Settings:</label>
        <input name="settings" value={data.settings || ""} onChange={handleChange} className="form-control" />
      </div>
      <Handle type="source" position={Position.Right} isConnectable={isConnectable} />
      <Handle type="target" position={Position.Left} isConnectable={isConnectable} />
    </div>
  );
};

// ----------------- GPT-4 Node -----------------
export const Gpt4Node = ({ data, isConnectable, id }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    data.onChange({ ...data, [name]: value });
  };

  const handleRemoveNode = () => {
    if (data.onRemove) data.onRemove(id);
  };

  const handleSaveTemplate = () => {
    const content = { prompt: data.prompt, settings: data.settings };
    saveTemplate("gpt4", "GPT-4 Template", content);
  };

  return (
    <div className="node-container gpt4-node">
      <div className="node-header node-header-17 d-flex justify-content-between align-items-center">
        <span>GPT-4</span>
        <div>
         <IoIosCloseCircle onClick={handleRemoveNode} className="node-close-btn"/>
         <IoSaveSharp onClick={handleSaveTemplate} className="node-save-btn" />
        </div>
      </div>
      <div className="node-body">
        <label>Prompt:</label>
        <input name="prompt" value={data.prompt || ""} onChange={handleChange} className="form-control" />
        <label>Settings:</label>
        <input name="settings" value={data.settings || ""} onChange={handleChange} className="form-control" />
      </div>
      <Handle type="source" position={Position.Right} isConnectable={isConnectable} />
      <Handle type="target" position={Position.Left} isConnectable={isConnectable} />
    </div>
  );
};

// ----------------- Add Message History Node -----------------
export const AddMsgHistoryNode = ({ data, isConnectable, id }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    data.onChange({ ...data, [name]: value });
  };

  const handleRemoveNode = () => {
    if (data.onRemove) data.onRemove(id);
  };

  const handleSaveTemplate = () => {
    const content = { history: data.history };
    saveTemplate("addMsgHistory", "Message History Template", content);
  };

  return (
    <div className="node-container add-msg-history-node">
      <div className="node-header node-header-18 d-flex justify-content-between align-items-center">
        <span>Add Msg History</span>
        <div>
         <IoIosCloseCircle onClick={handleRemoveNode} className="node-close-btn"/>
         <IoSaveSharp onClick={handleSaveTemplate} className="node-save-btn" />
        </div>
      </div>
      <div className="node-body">
        <label>History Data:</label>
        <textarea name="history" value={data.history || ""} onChange={handleChange} className="form-control" />
      </div>
      <Handle type="source" position={Position.Right} isConnectable={isConnectable} />
      <Handle type="target" position={Position.Left} isConnectable={isConnectable} />
    </div>
  );
};
