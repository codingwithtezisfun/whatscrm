import React from "react";
import { FaPlus, FaEdit, FaTrash } from "react-icons/fa";
import "../Styles/autochatbot.css";

const AutoChatbot = () => {
  return (
    <div className="auto-chatbot-container">
      {/* Top Section with Video/Image + Add New Button */}
      <div className="auto-chatbot-top">
        <div className="video-section">
          {/* Replace with a real <video> or an <img> placeholder */}
          <div className="video-placeholder">
            <img
              src="https://via.placeholder.com/300x150.png?text=Chatbot+Demo+Video"
              alt="Chatbot Demo"
            />
          </div>
          <p>
            Enhance customer engagement and drive sales by automating your responses using pre-made
            chatbot flows. With traditional conversational paths, you can efficiently interact with
            customers, provide instant assistance, and more.
          </p>
        </div>

        <button className="add-new-btn">
          <FaPlus />
          Add now
        </button>
      </div>

      {/* Chatbot List at the Bottom */}
      <div className="chatbot-list-container">
        <h3>Chatbot list</h3>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Title</th>
              <th>Flow title</th>
              <th>Is active?</th>
              <th>Edit</th>
              <th>Delete</th>
            </tr>
          </thead>
          <tbody>
            {/* Example row with no data */}
            <tr>
              <td colSpan="6" style={{ textAlign: "center" }}>
                No items
              </td>
            </tr>

            {/* If you had data, you’d map over it:
              {chatbots.map((bot) => (
                <tr key={bot.id}>
                  <td>{bot.id}</td>
                  <td>{bot.title}</td>
                  <td>{bot.flowTitle}</td>
                  <td>{bot.isActive ? "Yes" : "No"}</td>
                  <td><FaEdit /></td>
                  <td><FaTrash /></td>
                </tr>
              ))} 
            */}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AutoChatbot;
