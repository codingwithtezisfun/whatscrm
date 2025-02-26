import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { FaSearch, FaFilter, FaBell, FaPaperclip, FaPaperPlane } from "react-icons/fa";
import "../Styles/chat.css";
import BASE_URL from "../../BaseUrl";

const ChatComponent = () => {
  // State
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);

  const [messageText, setMessageText] = useState("");

  const token = localStorage.getItem("userToken");

  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchChats();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollTop = messagesEndRef.current.scrollHeight;
    }
  };

  const fetchChats = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/inbox/get_chats`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.success) {
        setChats(res.data.data);
        console.log("Fetched chats:", res.data.data);
      } else {
        console.error("Failed to fetch chats:", res.data.msg);
      }
    } catch (error) {
      console.error("Error fetching chats:", error);
    }
  };

  const fetchConversation = async (chatId) => {
    try {
      const response = await axios.post(
        `${BASE_URL}/api/inbox/get_convo`,
        { chatId },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (response.data.success) {
        setMessages(response.data.data);
      } else {
        console.error("Failed to fetch conversation:", response.data.msg);
      }
    } catch (error) {
      console.error("Error fetching conversation:", error);
    }
  };

  const handleChatClick = (chat) => {
    setSelectedChat(chat);
    fetchConversation(chat.chat_id);
  };

  const filteredChats = chats.filter((chat) =>
    (chat?.sender_name || "").toLowerCase().includes(search.toLowerCase())
  );

  const handleSendMessage = async () => {
    if (!messageText.trim()) return;
    const newMessage = {
      senderName: "You",
      msgContext: {
        text: {
          body: messageText,
        },
      },
      route: "OUTGOING",
    };
    setMessages((prev) => [...prev, newMessage]);
    setMessageText("");
  };

  return (
    <div className="chat-container">
      {/* Sidebar */}
      <div className="chat-sidebar">
        <div className="sidebar-top">
          <div className="search-box">
            <FaSearch className="icon" />
            <input
              type="text"
              placeholder="Search by name or mobile"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <FaFilter className="icon filter-icon" />
          <FaBell className="icon bell-icon" onClick={() => setShowModal(true)} />
        </div>

        {/* Chat List */}
        <div className="chat-list">
          {filteredChats.length === 0 && (
            <p className="no-chats">Oops, there is no chat list found</p>
          )}
          {filteredChats.map((chat) => (
            <div
              key={chat.chat_id}
              className={`chat-item ${
                selectedChat?.chat_id === chat.chat_id ? "active" : ""
              }`}
              onClick={() => handleChatClick(chat)}
            >
              <div className="chat-avatar">
                {chat.sender_name?.charAt(0)?.toUpperCase() || "?"}
              </div>
              <div className="chat-info">
                <p className="chat-name">{chat.sender_name}</p>
                <p className="chat-mobile">{chat.sender_mobile}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Chat Window */}
      <div className="chat-main">
        {selectedChat ? (
          <div className="chat-window">
            <h2 className="chat-title">{selectedChat.sender_name}</h2>

            {/* Messages Area */}
            <div className="chat-messages" ref={messagesEndRef}>
              {messages.length === 0 && <p className="no-messages">No messages yet</p>}
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`message-bubble ${
                    msg.route === "INCOMING" ? "incoming" : "outgoing"
                  }`}
                >
                  <p className="message-text">{msg.msgContext?.text?.body}</p>
                </div>
              ))}
            </div>

            {/* Input Bar */}
            <div className="chat-input-bar">
              <button className="attach-btn">
                <FaPaperclip />
              </button>
              <input
                type="text"
                className="chat-input"
                placeholder="Type a message..."
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
              />
              <button className="send-btn" onClick={handleSendMessage}>
                <FaPaperPlane />
              </button>
            </div>
          </div>
        ) : (
          <div className="no-chat-selected">
            <p>Select a chat to view the conversation</p>
          </div>
        )}
      </div>

      {/* Notification Sound Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Select Notification Sound</h3>
            <ul>
              <li>Sound 1</li>
              <li>Sound 2</li>
              <li>Sound 3</li>
            </ul>
            <button onClick={() => setShowModal(false)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatComponent;
