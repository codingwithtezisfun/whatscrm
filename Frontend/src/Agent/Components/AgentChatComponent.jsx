import React, { useState, useEffect, useRef } from "react";
import io from "socket.io-client";
import axios from "axios";
import {
  FaSearch,
  FaFilter,
  FaBell,
  FaPaperclip,
  FaPaperPlane,
  FaStar,
  FaTimes,
  FaMicrophone,
  FaRegSmile,
} from "react-icons/fa";
import { LiaCheckDoubleSolid } from "react-icons/lia";
import { MdCheck } from "react-icons/md";
import Picker from "emoji-picker-react";
import BASE_URL from "../../BaseUrl";
import "../../User/Styles/chat.css";
import Swal from "sweetalert2";
import { jwtDecode } from "jwt-decode";

const AgentChatComponent = () => {
  // Existing state declarations
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [search, setSearch] = useState("");
  const [messageText, setMessageText] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");
  const [attachment, setAttachment] = useState(null);

  // New state for emoji picker and voice recording
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showReactionPickerForMsg, setShowReactionPickerForMsg] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedChunks, setRecordedChunks] = useState([]);
  const mediaRecorderRef = useRef(null);

  const token = localStorage.getItem("userToken");
  const { uid } = jwtDecode(token);

  const messagesEndRef = useRef(null);
  const socketRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    console.log("Initializing socket connection...");
    fetchChats();

    socketRef.current = io(BASE_URL, {
      auth: { token },
      transports: ["websocket"],
    });
    console.log("Socket connected:", socketRef.current);
    socketRef.current.emit("user_connected", { userId: uid });

    socketRef.current.on("update_chats", async (data) => {
      console.log("Received update_chats event:", data);
      await fetchChats();
      if (selectedChat?.chat_id) {
        if (data.chats.some((c) => c.chat_id === selectedChat.chat_id)) {
          fetchConversation(selectedChat.chat_id);
        }
      }
    });

    socketRef.current.on("push_new_msg", (data) => {
      console.log("Received push_new_msg event:", data);
      if (selectedChat && data.chatId === selectedChat.chat_id) {
        setMessages((prev) => [...prev, data.msg]);
      }
      console.log("New message logged:", data.msg);
    });

    socketRef.current.on("update_delivery_status", (data) => {
      console.log("Received update_delivery_status event:", data);
      if (selectedChat && data.chatId === selectedChat.chat_id) {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.metaChatId === data.msgId ? { ...msg, status: data.status } : msg
          )
        );
      }
    });

    socketRef.current.on("push_new_reaction", (data) => {
      console.log("Received push_new_reaction event:", data);
      if (selectedChat && data.chatId === selectedChat.chat_id) {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.metaChatId === data.msgId ? { ...msg, reaction: data.reaction } : msg
          )
        );
      }
    });

    return () => {
      if (socketRef.current) {
        console.log("Disconnecting socket...");
        socketRef.current.disconnect();
      }
    };
  }, [uid, selectedChat?.chat_id]);

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
    setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
  };

  const sortedChats = [...chats]
    .filter(
      (chat) =>
        (chat?.sender_name || "").toLowerCase().includes(search.toLowerCase()) ||
        (chat?.sender_mobile || "").toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) =>
      sortOrder === "asc"
        ? (a.sender_name || "").localeCompare(b.sender_name || "")
        : (b.sender_name || "").localeCompare(a.sender_name || "")
    );

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

  const handleAttachmentClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleAttachmentChange = async (e) => {
    const file = e.target.files[0];
    if (!file || !selectedChat) return;
    e.target.value = null;
    const reader = new FileReader();
    reader.onloadend = () => {
      setAttachment({
        file,
        preview: reader.result,
        fileType: file.type,
        fileName: file.name,
      });
    };
    reader.readAsDataURL(file);
  };

  const handleSendAttachment = async () => {
    if (!attachment || !selectedChat) return;
    try {
      const { file, fileType } = attachment;
      console.log("Sending attachment of type:", fileType);
      const uploadedUrl = await dummyUploadFile(file);
      let endpoint = "";
      let payload = {};
      if (fileType.startsWith("image/")) {
        endpoint = "/api/inbox/send_image";
        payload = {
          url: uploadedUrl,
          toNumber: selectedChat.sender_mobile,
          toName: selectedChat.sender_name,
          chatId: selectedChat.chat_id,
          caption: "",
        };
      } else if (fileType.startsWith("video/")) {
        endpoint = "/api/inbox/send_video";
        payload = {
          url: uploadedUrl,
          toNumber: selectedChat.sender_mobile,
          toName: selectedChat.sender_name,
          chatId: selectedChat.chat_id,
          caption: "",
        };
      } else if (fileType.startsWith("audio/")) {
        endpoint = "/api/inbox/send_audio";
        payload = {
          url: uploadedUrl,
          toNumber: selectedChat.sender_mobile,
          toName: selectedChat.sender_name,
          chatId: selectedChat.chat_id,
        };
      } else {
        endpoint = "/api/inbox/send_doc";
        payload = {
          url: uploadedUrl,
          toNumber: selectedChat.sender_mobile,
          toName: selectedChat.sender_name,
          chatId: selectedChat.chat_id,
          caption: "",
        };
      }
      const res = await axios.post(`${BASE_URL}${endpoint}`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.success) {
        console.log("Attachment sent successfully");
        setAttachment(null);
      } else {
        console.error("Attachment send failed:", res.data.msg);
        Swal.fire({
          icon: "error",
          title: "Attachment Failed",
          text: res.data.msg || "Something went wrong. Please try again.",
        });
      }
    } catch (err) {
      console.error("Error sending attachment:", err);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err.message || "An unexpected error occurred.",
      });
    }
  };

  const dummyUploadFile = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve(reader.result);
      };
      reader.readAsDataURL(file);
    });
  };

  // New function to send reactions via socket
  const handleSendReaction = (msg, emoji) => {
    if (!selectedChat) return;
    socketRef.current.emit("push_new_reaction", {
      chatId: selectedChat.chat_id,
      msgId: msg.metaChatId,
      reaction: emoji,
    });
    setMessages((prev) =>
      prev.map((m) =>
        m.metaChatId === msg.metaChatId ? { ...m, reaction: emoji } : m
      )
    );
    setShowReactionPickerForMsg(null);
  };


  const onEmojiClick = (emojiData, event) => {
    setMessageText((prev) => prev + emojiData.emoji);
    setShowEmojiPicker(false);
  };
  

  // Voice recording: start recording using MediaRecorder API
  const startRecording = async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      alert("Your browser does not support voice recording");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      setRecordedChunks([]);
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          setRecordedChunks((prev) => prev.concat(e.data));
        }
      };
      mediaRecorder.onstop = handleVoiceRecordingStop;
      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Error accessing microphone", error);
    }
  };

  // Stop recording and send voice message
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  // When recording stops, send the audio blob as a voice message
  const handleVoiceRecordingStop = async () => {
    const blob = new Blob(recordedChunks, { type: "audio/webm" });
    const reader = new FileReader();
    reader.onloadend = async () => {
      const voiceUrl = reader.result;
      try {
        const payload = {
          url: voiceUrl,
          toNumber: selectedChat.sender_mobile,
          toName: selectedChat.sender_name,
          chatId: selectedChat.chat_id,
        };
        const res = await axios.post(`${BASE_URL}/api/inbox/send_audio`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.data.success) {
          Swal.fire({
            icon: "error",
            title: "Voice Message Failed",
            text: res.data.msg || "Something went wrong. Please try again.",
          });
        }
      } catch (err) {
        console.error("Error sending voice message:", err);
      }
    };
    reader.readAsDataURL(blob);
  };

  // Render message status
  const renderMessageStatus = (msg) => {
    if (msg.route === "OUTGOING") {
      if (msg.status === "read") {
        return <LiaCheckDoubleSolid className="message-status-read" />;
      } else if (msg.status === "delivered") {
        return <LiaCheckDoubleSolid className="message-status-delivered" />;
      } else {
        return <MdCheck className="message-status-sent" />;
      }
    }
    return null;
  };

  // Render interactive reply buttons if applicable
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

  // Render message content based on type
  const renderMessageContent = (msg) => {
    if (msg.msgContext?.text?.body) {
      return <span className="message-text">{msg.msgContext.text.body}</span>;
    } else if (msg.msgContext?.image?.link) {
      return (
        <img
          src={msg.msgContext.image.link}
          alt="Sent"
          className="message-img"
        />
      );
    } else if (msg.msgContext?.video?.link) {
      return (
        <video controls className="message-video">
          <source src={msg.msgContext.video.link} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      );
    } else if (msg.msgContext?.document?.link) {
      return (
        <div className="message-doc">
          <p>{msg.msgContext.document.caption || "Document"}</p>
        </div>
      );
    } else if (msg.msgContext?.audio?.link) {
      return (
        <audio controls className="message-audio">
          <source src={msg.msgContext.audio.link} type="audio/webm" />
          Your browser does not support the audio element.
        </audio>
      );
    }
    return <span className="message-text">Unsupported message type</span>;
  };

  const AvatarPlaceholder = ({ seed }) => {
    const letter = seed ? seed.charAt(0).toUpperCase() : "?";
    return <div className="avatar-placeholder">{letter}</div>;
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
          <FaBell className="icon bell-icon" />
        </div>
        <div className="chat-list">
          {sortedChats.length === 0 && (
            <p className="no-chats">No chats found</p>
          )}
          {sortedChats.map((chat) => (
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
                    className={`chat_message mt-4 ${
                      msg.route === "OUTGOING" ? "chat_receiver" : "chat-sender"
                    }`}
                  >
                    <span className="chat_name">{msg.senderName}</span>
                    {msg.star && <FaStar className="star-icon" />}
                    {renderMessageContent(msg)}
                    {renderInteractiveReply(msg)}
                    <span className="chat_timestemp">
                      {new Date(msg.timestamp * 1000).toLocaleTimeString()}
                    </span>
                    {renderMessageStatus(msg)}
                    <div className="message-reaction">{msg.reaction}</div>
                    {/* <button
                      className="reaction-btn"
                      onClick={() =>
                        setShowReactionPickerForMsg(
                          showReactionPickerForMsg === msg.metaChatId
                            ? null
                            : msg.metaChatId
                        )
                      }
                    >
                      <FaRegSmile />
                    </button>
                    {showReactionPickerForMsg === msg.metaChatId && (
                      <div className="reaction-picker">
                        <Picker
                          onEmojiClick={(e, emojiObj) =>
                            handleSendReaction(msg, emojiObj.emoji)
                          }
                        />
                      </div>
                    )} */}
                  </div>
                ))
              )}
            </div>
            {attachment && (
              <div className="attachment-preview">
                <div className="attachment-content">
                  {attachment.fileType.startsWith("image/") ? (
                    <img
                      src={attachment.preview}
                      alt="attachment preview"
                      className="attachment-img"
                    />
                  ) : attachment.fileType.startsWith("video/") ? (
                    <video controls className="attachment-video">
                      <source
                        src={attachment.preview}
                        type={attachment.fileType}
                      />
                      Your browser does not support the video tag.
                    </video>
                  ) : attachment.fileType.startsWith("audio/") ? (
                    <audio controls className="attachment-audio">
                      <source
                        src={attachment.preview}
                        type={attachment.fileType}
                      />
                      Your browser does not support the audio element.
                    </audio>
                  ) : (
                    <div className="attachment-doc">
                      <p>{attachment.fileName}</p>
                    </div>
                  )}
                </div>
                <button
                  className="attachment-close"
                  onClick={() => setAttachment(null)}
                >
                  <FaTimes />
                </button>
                <button
                  className="send-attachment-btn"
                  onClick={handleSendAttachment}
                >
                  Send Attachment
                </button>
              </div>
            )}
            <div className="chat-footer">
              <button className="attach-btn" onClick={handleAttachmentClick}>
                <FaPaperclip />
              </button>
              <input
                type="file"
                ref={fileInputRef}
                style={{ display: "none" }}
                onChange={handleAttachmentChange}
              />
              <button
                className="emoji-btn"
                onClick={() => setShowEmojiPicker((prev) => !prev)}
              >
                <FaRegSmile />
              </button>
              {showEmojiPicker && (
                <div className="emoji-picker-container">
                  <Picker onEmojiClick={onEmojiClick} />
                </div>
              )}
              <button
                className="mic-btn"
                onMouseDown={startRecording}
                onMouseUp={stopRecording}
              >
                <FaMicrophone color={isRecording ? "red" : "inherit"} />
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
    </div>
  );
};

export default AgentChatComponent;
