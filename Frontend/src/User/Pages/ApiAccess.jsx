import React, { useState } from "react";
import axios from "axios";
import { MdContentCopy, MdRefresh } from "react-icons/md";
import "../Styles/apiaccess.css"; // optional, your custom styles
import BASE_URL from "../../BaseUrl";

const ApiAccess = () => {
  const [apiKey, setApiKey] = useState("");
  const [activeTab, setActiveTab] = useState("conversational");
  const [convSubTab, setConvSubTab] = useState("text");
  const [copyAlert, setCopyAlert] = useState(false);

  const conversationSamples = {
    request: {
      request: `1. Send a POST request to:
        https://crm.oneoftheprojects.com/api/v1/send-message?token=API_KEYS

        2. Include the following token in the request:
        API_KEYS

        3:- Send object as body:
        {
            messageObject: {...object}
        }

        👉🏻 Success response:
        {
            success: true,
            message: "Message sent successfully!"
        }

        👉🏻 Not success response:
        {
            success: false,
            message: "<REASON>"
        }`,
      example: {
        to: "18876656789",
        type: "text",
        text: { preview_url: false, body: "text-message-content" },
      },
    },
    text: {
        to: "18876656789",
        type: "text",
        text: {
          preview_url: false,
          body: "text-message-content"
        }
      },
    image: {
      to: "18876656789",
      type: "image",
      image: { link: "https://image-url" },
    },
    audio: {
      to: "18876656789",
      type: "audio",
      audio: { link: "https://audio-url" },
    },
    document: {
      to: "18876656789",
      type: "document",
      document: {
        link: "https://document-url",
        caption: "DOCUMENT_CAPTION_TEXT",
      },
    },
    video: {
      to: "18876656789",
      type: "video",
      video: {
        link: "https://video-url",
        caption: "VIDEO_CAPTION_TEXT",
      },
    },
    list: {
      to: "18876656789",
      type: "interactive",
      interactive: {
        type: "list",
        header: { type: "text", text: "HEADER_TEXT" },
        body: { text: "BODY_TEXT" },
        footer: { text: "FOOTER_TEXT" },
        action: {
          button: "BUTTON_TEXT",
          sections: [
            {
              title: "LIST_SECTION_1_TITLE",
              rows: [
                { id: "1", title: "Row 1", description: "Description 1" },
                { id: "2", title: "Row 2", description: "Description 2" },
              ],
            },
            {
              title: "LIST_SECTION_2_TITLE",
              rows: [
                { id: "3", title: "Row 3", description: "Description 3" },
                { id: "4", title: "Row 4", description: "Description 4" },
              ],
            },
          ],
        },
      },
    },
    replyButton: {
      to: "18876656789",
      type: "interactive",
      interactive: {
        type: "button",
        body: { text: "BUTTON_TEXT" },
        action: {
          buttons: [
            { type: "reply", reply: { id: "1", title: "Button 1" } },
            { type: "reply", reply: { id: "2", title: "Button 2" } },
          ],
        },
      },
    },
  };

  const templateSample = `1. Send a POST request to:

POST /api/v1/send_templet HTTP/1.1
Host: https://crm.oneoftheprojects.com/api/v1/send_templet
Content-Type: application/json
Authorization: Bearer API_KEY

{
  "sendTo": "+1234567890",
  "templetName": "YourTemplateName",
  "exampleArr": ["example_key_1", "example_key_2"],
  "token": "YourAPIToken",
  "mediaUri": "OptionalMediaUri"
}

Parameters:
sendTo: The recipient's phone number (e.g., +1234567890).
templetName: The name of the template you want to send.
exampleArr: An array of key-value pairs to populate the template.
token: Your API token for authorization.
mediaUri: (Optional) URI of the media to be attached to the message.

Example Response:
{
  "success": true,
  "metaResponse": {
    "message_id": "message_id_here",
    "status": "sent"
  }
}`;

  // Generate a new API key
  const generateApiKey = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/api/user/generate_api_keys`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("userToken")}`,
          "Content-Type": "application/json",
        },
      });

      if (response.data.success) {
        setApiKey(response.data.token);
      } else {
        alert("Failed to generate API key");
      }
    } catch (error) {
      console.error("Error generating API key:", error);
      alert("Error generating API key");
    }
  };

  const getApiExampleString = () => {
    if (activeTab === "conversational") {
      const item = conversationSamples[convSubTab];
  
      if (!item) return "No example available.";
  
      if (convSubTab === "request") {
        return `${item.request}\n\nExample object:\n${JSON.stringify(item.example, null, 2)}`;
      } else {
        return JSON.stringify(item, null, 2);
      }
    } else {
      return templateSample;
    }
  };
  

  // Handle copying the API key
  const handleCopyApiKey = () => {
    navigator.clipboard.writeText(apiKey);
    setCopyAlert(true);
    setTimeout(() => setCopyAlert(false), 2000); // Hide alert after 2s
  };

  return (
    <div className="container api-access">
      {/* API Key Section */}
      <div className="mb-4">
        <h2 className="h5">Generate API Key</h2>
        <button className="btn btn-primary d-flex align-items-center gap-2" onClick={generateApiKey}>
          <MdRefresh size={20} /> Generate API Key
        </button>

        {apiKey && (
          <div className="mt-2 p-2 border rounded d-flex align-items-center">
            <span className="text-monospace flex-grow-1 me-2 api-key-display">{apiKey}</span>
            <button className="copy-btn" onClick={handleCopyApiKey}>
              <MdContentCopy size={18} />
            </button>
          </div>
        )}

        {copyAlert && (
          <div className="alert alert-success mt-2" role="alert">
            API Key Copied!
          </div>
        )}
      </div>

      {/* Tabs */}
      <ul className="nav nav-tabs mb-3">
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === "conversational" ? "active" : ""}`}
            onClick={() => setActiveTab("conversational")}
          >
            Conversational API
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === "template" ? "active" : ""}`}
            onClick={() => setActiveTab("template")}
          >
            Template API
          </button>
        </li>
      </ul>

      {/* Sub-Tabs for Conversational API */}
      {activeTab === "conversational" && (
        <ul className="nav nav-pills mb-3">
          {Object.keys(conversationSamples).map((key) => (
            <li className="nav-item" key={key}>
              <button
                className={`nav-link ${convSubTab === key ? "active" : ""}`}
                onClick={() => setConvSubTab(key)}
              >
                {key.charAt(0).toUpperCase() + key.slice(1)}
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* JSON / Code Display */}
      <div className="border rounded p-3 bg-dark text-light">
        <pre className="m-0 text-monospace">{getApiExampleString()}</pre>
      </div>
    </div>
  );
};

export default ApiAccess;
