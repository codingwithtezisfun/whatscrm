import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import {
  FaSearch,
  FaFilter,
  FaBell,
  FaPaperclip,
  FaPaperPlane,
  FaStar,
  FaPlusCircle,
} from "react-icons/fa";
import { LiaCheckDoubleSolid } from "react-icons/lia";
import { MdCheck } from "react-icons/md";
import BASE_URL from "../../BaseUrl";
import "../Styles/chat.css";
import NewChatModal from "./NewChatModal";
import Swal from "sweetalert2";

const ChatComponent = () => {
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [search, setSearch] = useState("");
  const [showNotifyModal, setShowNotifyModal] = useState(false);
  const [messageText, setMessageText] = useState("");
  const [sortOrder, setSortOrder] = useState("asc"); // Ascending by default

  // For new conversation modal
  const [showNewChatModal, setShowNewChatModal] = useState(false);

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

  const handleSortToggle = () => {
    setSortOrder((prevOrder) => (prevOrder === "asc" ? "desc" : "asc"));
  };

  const sortedChats = [...chats]
  .filter((chat) =>
    (chat?.sender_name || "").toLowerCase().includes(search.toLowerCase()) ||
    (chat?.sender_mobile || "").toLowerCase().includes(search.toLowerCase())
  )
  .sort((a, b) => {
    return sortOrder === "asc"
      ? (a.sender_name || "").localeCompare(b.sender_name || "")
      : (b.sender_name || "").localeCompare(a.sender_name || "");
  });


  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageText.trim() || !selectedChat) return;
    const payload = {
      text: messageText,
      toNumber: selectedChat.sender_mobile,
      toName: selectedChat.sender_name,
      chatId: selectedChat.chat_id,
    };
    try {
      const res = await axios.post(`${BASE_URL}/api/inbox/send_text`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.success) {
        setMessages((prev) => [
          ...prev,
          {
            senderName: "You",
            msgContext: { text: { body: messageText } },
            route: "OUTGOING",
            status: "sent",
            star: false,
            reaction: "",
            timestamp: Math.floor(Date.now() / 1000),
          },
        ]);
        setMessageText("");
      } else {
        console.error("Message send failed:", res.data.msg);
        Swal.fire({
          icon: "error",
          title: "Message Failed",
          text: res.data.msg || "Something went wrong. Please try again.",
        });
      }
    } catch (err) {
      console.error("Error sending message:", err);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err.message || "An unexpected error occurred.",
      });
    }
  };

  const renderMessageStatus = (msg) => {
    if (msg.route === "OUTGOING") {
      return msg.status === "delivered" ? (
        <LiaCheckDoubleSolid className="message-status-read" />
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
          <div className="_search-box">
            <FaSearch className="icon" />
            <input
              type="text"
              placeholder="Search by name/mobile"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <FaFilter className="icon filter-icon" onClick={handleSortToggle} />
          <FaBell className="icon bell-icon" onClick={() => setShowNotifyModal(true)} />
        </div>
        {/* Start New Chat Button */}
        <div
          className="new-chat-container d-flex align-items-center justify-content-center p-2 cursor-pointer"
          onClick={() => setShowNewChatModal(true)}
        >
          <FaPlusCircle className="me-2 p-icon" />
          <span>Start a new chat</span>
        </div>
        <div className="chat-list">
          {sortedChats.length === 0 && <p className="no-chats">No chats found</p>}
          {sortedChats.map((chat) => (
            <div
              key={chat.chat_id}
              className={`chat-item ${selectedChat?.chat_id === chat.chat_id ? "active" : ""}`}
              onClick={() => handleChatClick(chat)}
            >
              <div className="chat-avatar">{chat.sender_name?.charAt(0)?.toUpperCase() || "?"}</div>
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
                    <div className="message-reaction">{msg.reaction}</div>
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
      {showNotifyModal && (
        <div className="__modal-overlay" onClick={() => setShowNotifyModal(false)}>
          <div className="__modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Select Notification Sound</h3>
            <ul>
              <li>Sound 1</li>
              <li>Sound 2</li>
              <li>Sound 3</li>
            </ul>
            <button onClick={() => setShowNotifyModal(false)}>Close</button>
          </div>
        </div>
      )}

      {/* New Chat Modal */}
      {showNewChatModal && (
        <NewChatModal
          onClose={() => setShowNewChatModal(false)}
          onSelectContact={(contact) => {
            let chat = chats.find((chat) => chat.sender_mobile === contact.mobile);
        
            if (chat) {
                setSelectedChat(chat);
                fetchConversation(chat.chat_id);
            } else {
                const newChat = {
                    chat_id: `new-${contact.id}`, 
                    sender_name: contact.name,
                    sender_mobile: contact.mobile,
                };
  
                setChats((prevChats) => [newChat, ...prevChats]);
 
                setSelectedChat(newChat);
                fetchConversation(newChat.chat_id);
            }
        
            setShowNewChatModal(false);
        }}
        />
      )}
    </div>
  );
};

const AvatarPlaceholder = ({ seed }) => {
  const letter = seed ? seed.charAt(0).toUpperCase() : "?";
  return <div className="avatar-placeholder">{letter}</div>;
};

export default ChatComponent;
