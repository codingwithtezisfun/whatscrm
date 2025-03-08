import React, { useState, useEffect, useRef } from "react";
import io from "socket.io-client";
import axios from "axios";
import {
  FaSearch,
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
import "../Styles/chat.css";
import Swal from "sweetalert2";
import { jwtDecode } from "jwt-decode";
import { IoFilter } from "react-icons/io5";
import { FaTrash, FaUserPlus, FaTag } from "react-icons/fa";

import chime from "../../assets/notifications/notification-18-270129.mp3";
import ding from "../../assets/notifications/notification-22-270130.mp3";
import alertSound from "../../assets/notifications/notification-pluck-off-269290.mp3";
import notify from "../../assets/notifications/notification-sound-2-253324.mp3";
import treble from "../../assets/notifications/simple-notification-152054.mp3";

const ChatComponent = () => {
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [search, setSearch] = useState("");
  const [messageText, setMessageText] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");
  const [attachment, setAttachment] = useState(null);

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
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const toggleDropdown = () => {
    setDropdownOpen((prev) => !prev);
  };

  const handleClickOutside = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setDropdownOpen(false);
    }
  };

  const [showTagModal, setShowTagModal] = useState(false);
  const [showSaveContactModal, setShowSaveContactModal] = useState(false);
  const [contactDetails, setContactDetails] = useState({
    contactName: "",
    phoneNumber: "",
    phoneBookName: "Default",
    phoneBookId: "default-id"
  });
  const [tagName, setTagName] = useState("");

  const [phonebooks, setPhonebooks] = useState([]);
    const [loadingPB, setLoadingPB] = useState(false);

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

//add  defaulst notification sound if none on mount
  useEffect(() => {
    const storedSound = localStorage.getItem("notificationSound");
    if (!storedSound) {
      const defaultOption = notificationOptions.find(opt => opt.label.toLowerCase() === "notify");
      const defaultSound = defaultOption ? defaultOption.url : "";
      localStorage.setItem("notificationSound", defaultSound);
      setNotificationSound(defaultSound);
    } else {
      setNotificationSound(storedSound);
    }
  }, []);
  

    useEffect(() => {
      console.log("Initializing socket connection...");
      fetchChats();

      // ====================
      // Sockets Connection
      // ====================

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

    socketRef.current.on("update_conversations", (data) => {
      console.log("Received update_conversations event:", data);
    
      if (data.notificationOff) { 
        // Get the sound from state or localStorage
        const soundUrl = notificationSound || localStorage.getItem("notificationSound");
        if (soundUrl) {
          const audio = new Audio(soundUrl);
          audio.play().catch(err => console.error("Error playing sound:", err));
        }
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
        fetchTags();
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
    fetchChatStatus(chat.chat_id);
  };
  
  const [statusFilter, setStatusFilter] = useState(""); 
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);

  const sortedChats = chats
  .filter(chat =>
    (chat.sender_name || "").toLowerCase().includes(search.toLowerCase()) ||
    (chat.sender_mobile || "").toLowerCase().includes(search.toLowerCase())
  )
  .filter(chat =>
    statusFilter ? chat.chat_status === statusFilter : true
  )
  .sort((a, b) =>
    sortOrder === "asc"
      ? (a.sender_name || "").localeCompare(b.sender_name || "")
      : (b.sender_name || "").localeCompare(a.sender_name || "")
  );

  const handleSortToggle = () => {
    setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
  };

  const filterDropdownRef = useRef(null);

useEffect(() => {
  const handleClickOutside = (event) => {
    if (filterDropdownRef.current && !filterDropdownRef.current.contains(event.target)) {
      setShowFilterDropdown(false);
    }
  };

  document.addEventListener("mousedown", handleClickOutside);
  return () => {
    document.removeEventListener("mousedown", handleClickOutside);
  };
}, []);


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

  // Render interactive reply button
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

  const updateChatStatus = async (status) => {
    try {
      await axios.post(
        `${BASE_URL}/api/inbox/update_chat_status`,
        { chatId: selectedChat.chat_id, status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Update the local state to reflect the new status
      setSelectedChat({ ...selectedChat, chat_status: status });
      fetchChats();
    } catch (error) {
      console.error("Failed to update chat status", error);
      Swal.fire({
        icon: "error",
        title: "Update Failed",
        text: error.response?.data?.msg || "Unable to update status.",
      });
    }
  };

  const fetchChatStatus = async (chatId) => {
    try {
      const response = await axios.get(`${BASE_URL}/api/inbox/get_chat_status/${chatId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (response.data.success) {
        setSelectedChat(prevChat => ({
          ...prevChat,
          chat_status: response.data.status
        }));
      } else {
        console.error("Failed to fetch chat status:", response.data.msg);
      }
    } catch (error) {
      console.error("Error fetching chat status:", error);
    }
  };

  const deleteChat = async (chatId) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This action will permanently delete the chat!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });
  
    if (!result.isConfirmed) return;
  
    try {
      const res = await axios.post(
        `${BASE_URL}/api/inbox/del_chat`,
        { chatId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
  
      if (res.data.success) {
        Swal.fire("Deleted!", res.data.msg, "success");
        setChats(chats.filter(chat => chat.chat_id !== chatId));
        setSelectedChat(null);
      } else {
        Swal.fire("Error", res.data.msg, "error");
      }
    } catch (error) {
      console.error("Error deleting chat:", error);
      Swal.fire("Error", "Could not delete the chat", "error");
    }
  };

  const loadPhonebooks = async () => {
    setLoadingPB(true);
    try {
      const res = await axios.get(`${BASE_URL}/api/phonebook/get_by_uid`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.success && Array.isArray(res.data.data)) {
        const mappedPhonebooks = res.data.data.map(pb => ({
          id: pb.id,
          phonebook_name: pb.name 
        }));
  
        setPhonebooks(mappedPhonebooks);
      } else {
        setPhonebooks([]);
      }
    } catch (error) {
      console.error("Error fetching phonebooks:", error);
      setPhonebooks([]);
    } finally {
      setLoadingPB(false);
    }
  };
  
  
  
  useEffect(() => {
    if (showSaveContactModal) {
      console.log("Loading phonebooks..."); 
      loadPhonebooks();
    }
  }, [showSaveContactModal]);
    
  
  const checkAndSaveContact = async (mobile) => {
  console.log(mobile + "mobile");
  
    try {
      const res = await axios.post(
        `${BASE_URL}/api/user/check_contact`,
        { mobile },
        { headers: { Authorization: `Bearer ${token}` } }
      );
  
      if (res.data.success) {
        Swal.fire("Info", "This contact already exists in your phonebook.", "info");
      } else {
        const defaultPhonebook =
          Array.isArray(res.data.phonebook) && res.data.phonebook.length > 0
            ? res.data.phonebook[0]
            : { id: "default-id", phonebook_name: "Default" };
  
        setShowSaveContactModal(true);
        setContactDetails({
          contactName: selectedChat.sender_name,
          phoneNumber: mobile,
          phoneBookName: defaultPhonebook.phonebook_name,
          phoneBookId: defaultPhonebook.id,
          var1: "",
          var2: "",
          var3: "",
          var4: "",
          var5: ""
        });
      }
    } catch (error) {
      Swal.fire("error", "Error checking contact:", "error");
    }
  };
  
  
  const saveContact = async () => {
    try {
      const res = await axios.post(
        `${BASE_URL}/api/user/save_contact`,
        contactDetails,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        Swal.fire("Success", res.data.msg, "success");
        setShowSaveContactModal(false);
      } else {
        Swal.fire("Error", res.data.msg, "error");
      }
    } catch (error) {
      console.error("Error saving contact:", error);
      Swal.fire("Error", "Failed to save contact", "error");
    }
  };

  useEffect(() => {
    if (showTagModal) {;
    }
  }, [showTagModal]);
  

  const saveTag = async () => {
    if (!tagName.trim()) {
      Swal.fire("Warning", "Please enter a tag", "warning");
      return;
    }
    try {
      const res = await axios.post(
        `${BASE_URL}/api/user/push_tag`,
        { chatId: selectedChat.chat_id, tag: tagName },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        Swal.fire("Success", res.data.msg, "success");
        // setShowTagModal(false);
        fetchChats();
        fetchTags();
      } else {
        Swal.fire("Error", res.data.msg, "error");
      }
    } catch (error) {
      console.error("Error adding tag:", error);
      Swal.fire("Error", "Could not add tag", "error");
    }
  };

const [chatTags, setChatTags] = useState([]);

const fetchTags = async () => {
  if (!selectedChat || !selectedChat.chat_id) return;

  try {
    const res = await axios.get(`${BASE_URL}/api/user/get_tags/${selectedChat.chat_id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (res.data.success) {
      setChatTags(res.data.tags || []);
    } else {
      setChatTags([]);
    }
  } catch (error) {
    console.error("Error fetching tags:", error);
    setChatTags([]);
  }
};

// Fetch tags when the modal opens
useEffect(() => {
  if (showTagModal) {
    fetchTags();
  }
}, [showTagModal]);

  const deleteTag = async (tag) => {
    try {
      await axios.post(`${BASE_URL}/api/user/del_tag`, { chatId: selectedChat.chat_id, tag }, {
        headers: { Authorization: `Bearer ${token}` },
      });
  
      Swal.fire("Deleted!", "Tag has been removed.", "success");
      fetchTags();
    } catch (error) {
      console.error("Failed to delete tag:", error);
      Swal.fire("Error", "Could not delete the tag.", "error");
    }
  };

  const getAvatarColor = (name) => {
    const colors = [
      "#FF0000", "#FF4D4D", "#FF6666", "#FF3333", "#CC0000", 
      "#FFA500", "#FFB347", "#FFC04C", "#FF8C00",           
      "#008000", "#32CD32", "#00FF7F", "#2E8B57",           
      "#0000FF", "#1E90FF", "#6495ED", "#4682B4",            
      "#808080", "#A9A9A9", "#C0C0C0", "#D3D3D3",             
      "#000000", "#222222", "#333333", "#444444",             
      "#00FFFF", "#00CED1", "#40E0D0", "#48D1CC", "#5F9EA0"    
    ];
    if (!name) return colors[0];
    // Use the char code of the first letter modulo the number of colors
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  const AvatarPlaceholder = ({ seed }) => {
    const color = getAvatarColor(seed);
    const letter = seed ? seed.charAt(0).toUpperCase() : "?";
    return (
      <div className="avatar-placeholder" style={{ backgroundColor: color }}>
        {letter}
      </div>
    );
  }; 
  // ======================
  // Notification sounds
  // ======================
  const [notificationSound, setNotificationSound] = useState(localStorage.getItem("notificationSound") || "");
  const [showBellDropdown, setShowBellDropdown] = useState(false);

  const notificationOptions = [
    { label: "Chime", url: chime },
    { label: "Ding", url: ding },
    { label: "Alert", url: alertSound },
    { label: "Notify", url: notify },
    { label: "Treble", url: treble }
  ];
  

  const bellDropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutsideBell = (event) => {
      if (bellDropdownRef.current && !bellDropdownRef.current.contains(event.target)) {
        setShowBellDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutsideBell);
    return () => {
      document.removeEventListener("mousedown", handleClickOutsideBell);
    };
  }, []);

  const handleNotificationSelect = (soundUrl) => {
    setNotificationSound(soundUrl);
    localStorage.setItem("notificationSound", soundUrl);
    setShowBellDropdown(false);
    
    const audio = new Audio(soundUrl);
    audio.play().catch(err => console.error("Error playing sound:", err));
  };
  

  

  return (
    <div className="chat-container">
      <div className="chat-sidebar">
        <div className="sidebar-top">
        <div className="_search-container d-flex flex-row align-items-center">
          <div className="_search-box me-2">
            <FaSearch className="icon" />
            <input
              type="text"
              placeholder="Search by name/mobile"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button
              className="_filter-button"
              onClick={() => setShowFilterDropdown((prev) => !prev)}
            >
           <IoFilter />
            </button>
          </div>

          {showFilterDropdown && (
          <div className="_filter-dropdown" ref={filterDropdownRef}>
            <div className="_filter-row">
              <label>Sort Order:</label>
              <button
                className="_sort-button"
                onClick={() => {
                  handleSortToggle();
                  setShowFilterDropdown(false);
                }}
              >
                {sortOrder === "asc" ? "Ascending ⬆" : "Descending ⬇"}
              </button>
            </div>
            <div className="_filter-row">
              <label>Filter by Status:</label>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setShowFilterDropdown(false);
                }}
              >
                <option value="">All</option>
                <option value="open">Open</option>
                <option value="pending">Pending</option>
                <option value="resolved">Resolved</option>
              </select>
            </div>
          </div>
        )}

        <div className="_search-icons">
          <FaBell
            className="icon bell-icon"
            onClick={() => setShowBellDropdown(prev => !prev)}
          />
          {showBellDropdown && (
            <div className="bell-dropdown" ref={bellDropdownRef}>
              <ul>
                {notificationOptions.map(opt => (
                  <li key={opt.label} onClick={() => handleNotificationSelect(opt.url)}>
                    {opt.label}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>


        </div>
        </div>

        <div className="chat-list">
          {sortedChats.length === 0 && (
            <p className="no-chats">No chats found</p>
          )}

          {sortedChats.map((chat) => (
            <div
              key={chat.chat_id}
              className={`chat-item ${selectedChat?.chat_id === chat.chat_id ? "active" : ""}`}
              onClick={() => handleChatClick(chat)}
            >
              <div className="chat-avatar" style={{ backgroundColor: getAvatarColor(chat.sender_name) }}>
                {chat.sender_name?.charAt(0)?.toUpperCase() || "?"}
              </div>

              <div className="chat-info">
                <div>
                <p className="chat-name">{chat.sender_name}</p>
                <p className="chat-mobile">{chat.sender_mobile}</p>
                </div>
                <div>
                <p className={`chat-status ${
                  chat.chat_status === "open"
                    ? "status-open"
                    : chat.chat_status === "pending"
                    ? "status-pending"
                    : "status-resolved"
                }`}>
                  {chat.chat_status.charAt(0).toUpperCase() + chat.chat_status.slice(1)}
                </p>
                </div>
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
                <div className="header-left">
                  <h3 className="chat-room-name">{selectedChat.sender_name}</h3>
                  <p className="chat-room-last-seen">Last seen recently</p>
                </div>

                <div className="header-right">
                  {/* Delete Chat Icon */}
                  <FaTrash
                    className="header-icon delete-contact-icon me-4"
                    onClick={() => deleteChat(selectedChat.chat_id)}
                    title="Delete Chat"
                  />

                  {/* Save Contact Icon */}
                  <FaUserPlus
                    className="header-icon save-contact-icon me-4"
                    onClick={() => checkAndSaveContact(selectedChat.sender_mobile)}
                    title="Save Contact"
                  />

                  {/* Add Chat Tag Icon */}
                  <FaTag
                    className="header-icon tag-icon me-4"
                    onClick={() => setShowTagModal(true)}
                    title="Add Tag"
                  />

              
                  <div className="btn-group" ref={dropdownRef}>
                    <button className="btn dropdown-toggle" onClick={toggleDropdown}>
                      {selectedChat?.chat_status || "Select Status"}
                    </button>

                    {dropdownOpen && (
                      <div className="dropdown-menu show">
                        <button
                          className={`dropdown-item ${selectedChat?.chat_status === "open" ? "active" : ""}`}
                          onClick={() => {
                            updateChatStatus("open");
                            setDropdownOpen(false);
                          }}
                        >
                          Open
                        </button>
                        <button
                          className={`dropdown-item ${selectedChat?.chat_status === "pending" ? "active" : ""}`}
                          onClick={() => {
                            updateChatStatus("pending");
                            setDropdownOpen(false);
                          }}
                        >
                          Pending
                        </button>
                        <button
                          className={`dropdown-item ${selectedChat?.chat_status === "solved" ? "active" : ""}`}
                          onClick={() => {
                            updateChatStatus("solved");
                            setDropdownOpen(false);
                          }}
                        >
                          Resolved
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
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
      {showTagModal && (
        <div className="__modal">
          <div className="__modal-content">
            <h4>Add Tag</h4>
            <input
              type="text"
              placeholder="Enter tag" className="w-100"
              value={tagName}
              onChange={(e) => setTagName(e.target.value)}
            />
            <button className=" w-100" onClick={saveTag}>Save Tag</button>
            <button className="tag-close-btn w-100" onClick={() => setShowTagModal(false)}>Cancel</button>

            {/* Display Existing Tags */}
            <div className="tag-list">
              <h4>Existing Tags:</h4>
              {chatTags.length > 0 ? (
                chatTags.map((tag, index) => (
                  <div key={index} className="tag-item">
                    <span className="tag-name">{tag}</span>
                    <button className="delete-tag" onClick={() => deleteTag(tag)}>✖</button>
                  </div>
                ))
              ) : (
                <p>No tags added yet.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {showSaveContactModal && (
      <div className="___modal">
        <div className="___modal-content">
          <div>
          <h3>Save Contact</h3>
          <label>Name:</label>
          <input
            type="text"
            value={contactDetails.contactName}
            onChange={(e) =>
              setContactDetails({ ...contactDetails, contactName: e.target.value })
            }
          />
          </div>
          <div>
          <label>Phone Number:</label>
          <input
            type="text"
            value={contactDetails.phoneNumber}
            onChange={(e) =>
              setContactDetails({ ...contactDetails, phoneNumber: e.target.value })
            }
          />
          </div>
          <div>
          <label>Phonebook:</label>
          <select
            value={contactDetails.phoneBookId}
            onChange={(e) => {
              const selectedId = e.target.value;
              const selectedPb = phonebooks.find((pb) => pb.id === selectedId);
              setContactDetails({
                ...contactDetails,
                phoneBookId: selectedId,
                phoneBookName: selectedPb ? selectedPb.phonebook_name : ""
              });
            }}
          >
            <option value="">Select Phonebook</option>
            {phonebooks.map((pb) => (
              <option key={pb.id} value={pb.id}>
                {pb.phonebook_name}
              </option>
            ))}
          </select>
          </div>
          <div>
          {/* Optional additional fields */}
          <label>Var1:</label>
          <input
            type="text"
            value={contactDetails.var1 || ""}
            onChange={(e) =>
              setContactDetails({ ...contactDetails, var1: e.target.value })
            }
          />
          </div>
          <div>
          <label>Var2:</label>
          <input
            type="text"
            value={contactDetails.var2 || ""}
            onChange={(e) =>
              setContactDetails({ ...contactDetails, var2: e.target.value })
            }
          />
          </div>
          <div>
          <label>Var3:</label>
          <input
            type="text"
            value={contactDetails.var3 || ""}
            onChange={(e) =>
              setContactDetails({ ...contactDetails, var3: e.target.value })
            }
          />
          </div>
          <div>
          <label>Var4:</label>
          <input
            type="text"
            value={contactDetails.var4 || ""}
            onChange={(e) =>
              setContactDetails({ ...contactDetails, var4: e.target.value })
            }
          />
          </div>
          <div>
          <label>Var5:</label>
          <input
            type="text"
            value={contactDetails.var5 || ""}
            onChange={(e) =>
              setContactDetails({ ...contactDetails, var5: e.target.value })
            }
          />
          </div>
          
          <button onClick={saveContact}>Save</button>
          <button onClick={() => setShowSaveContactModal(false)}>Cancel</button>
        </div>
      </div>
    )}

    </div>
  );
};

export default ChatComponent;
