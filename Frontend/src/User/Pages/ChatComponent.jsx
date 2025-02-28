import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import {
  FaSearch,
  FaFilter,
  FaBell,
  FaPaperclip,
  FaPaperPlane,
  FaCheck,
  FaStar
} from "react-icons/fa";
import { LiaCheckDoubleSolid } from "react-icons/lia";
import { MdCheck } from "react-icons/md";
import BASE_URL from "../../BaseUrl";
import "../Styles/chat.css";

const ChatComponent = () => {
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
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollTop = messagesEndRef.current.scrollHeight;
    }
  }, [messages]);

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
        { headers: { Authorization: `Bearer ${token}` } }
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

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!messageText.trim()) return;
    const newMessage = {
      senderName: "You",
      msgContext: { text: { body: messageText } },
      route: "OUTGOING",
      status: "sent",
      star: false,
      reaction: ""
    };
    setMessages((prev) => [...prev, newMessage]);
    setMessageText("");
    // Optionally, send the message to backend API
  };

  const renderMessageStatus = (msg) => {
    if (msg.route === "OUTGOING") {
      return msg.status === "delivered" ? (
        <LiaCheckDoubleSolid  className="message-status-read" />
      ) : (
        <MdCheck className="message-status-unread" />
      );
    }
    return null;
  };

  const renderInteractiveReply = (msg) => {
    if (msg.type === "button" && msg.msgContext?.interactive) {
      return (
        <div className="reply-options">
          {msg.msgContext.interactive.action.buttons.map((btn, idx) => (
            <button key={idx} className="reply-btn">
              {btn.reply.title}
            </button>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="chat-container">
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
        <div className="chat-list">
          {filteredChats.length === 0 && (
            <p className="no-chats">No chats found</p>
          )}
          {filteredChats.map((chat) => (
            <div
              key={chat.chat_id}
              className={`chat-item ${selectedChat?.chat_id === chat.chat_id ? "active" : ""}`}
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
      <div className="chat-main">
        {selectedChat ? (
          <div className="chat-window">
            <div className="chat-header">
              <div className="header-avatar">
                <AvatarPlaceholder seed={selectedChat.sender_name} />
              </div>
              <div className="header-info">
                <h3 className="chat-room-name">{selectedChat.sender_name}</h3>
                <p className="chat-room-last-seen">Last seen recently</p>
              </div>
              <div className="header-right"></div>
            </div>
            <div className="chat-body" ref={messagesEndRef}>
              {messages.length === 0 ? (
                <p className="no-messages">No messages yet</p>
              ) : (
                messages.map((msg, index) => (
                  <div
                    key={index}
                    className={`chat_message mt-4 ${msg.route === "OUTGOING" ? "chat_receiver" : "chat-sender"}`}
                  >
                    <span className="chat_name">{msg.senderName}</span>
                    {msg.star && <FaStar className="star-icon" />}

                    <span className="message-text">{msg.msgContext?.text?.body}</span>
                    {renderInteractiveReply(msg)}
                    <span className="chat_timestemp">
                      {new Date(msg.timestamp * 1000).toLocaleTimeString()}
                    </span>
                    {renderMessageStatus(msg)}

                    <div className="message-reaction">
                      {msg.reaction}
                    </div>
                  </div>

                
                ))
              )}
            </div>

            {/* Chat Input Bar */}
            <div className="chat-footer">
              <button className="attach-btn">
                <FaPaperclip />
              </button>
              <form onSubmit={handleSendMessage} className="chat-form">
                <input
                  type="text"
                  className="chat-input"
                  placeholder="Type a message..."
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                />
                <button type="submit" className="send-btn">
                  <FaPaperPlane />
                </button>
              </form>
            </div>
          </div>
        ) : (
          <div className="no-chat-selected">
            <p>Select a chat to view the conversation</p>
          </div>
        )}
      </div>

      {/* Notification Modal */}      
      {showModal && (
        <div className="__modal-overlay" onClick={() => setShowModal(false)}>
          <div className="__modal-content" onClick={(e) => e.stopPropagation()}>
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

const AvatarPlaceholder = ({ seed }) => {
  const letter = seed ? seed.charAt(0).toUpperCase() : "?";
  return (
    <div className="avatar-placeholder">
      {letter}
    </div>
  );
};

export default ChatComponent;
