import axios from "axios";
import BASE_URL from "../../BaseUrl"; 

const fetchMediaUrl = async (mediaId) => {
  const backendUri = BASE_URL;
  try {
    const response = await axios.get(`${backendUri}/meta-media/${mediaId}`);
    // The backend returns the file name (e.g., "1234567890.jpg")
    const fileName = response.data.file;
    return fileName ? `${backendUri}/meta-media/${fileName}` : "/placeholder.svg";
  } catch (error) {
    console.error("Error fetching media:", error);
    return "/placeholder.svg";
  }
};

const renderMessageContent = (msg) => {
  if (msg.msgContext?.text?.body) {
    return <span className="message-text">{msg.msgContext.text.body}</span>;
  } else if (msg.msgContext?.image) {
    const { link, id, caption } = msg.msgContext.image;
    let imageUrl = "";
    // Prefer a direct link if available, otherwise use fetched URL from our API
    if (link && !link.includes("undefined")) {
      imageUrl = link;
    } else if (id && msg.fetchedUrl) {
      imageUrl = msg.fetchedUrl;
    } else {
      imageUrl = "/placeholder.svg";
    }
    return <img src={imageUrl} alt={caption || "Sent Image"} className="message-img" />;
  } else if (msg.msgContext?.video?.link) {
    return (
      <video controls className="message-video">
        <source src={msg.msgContext.video.link} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    );
  } else if (msg.msgContext?.document) {
    const { link, id, caption } = msg.msgContext.document;
    let docUrl = "";
    if (link && !link.includes("undefined")) {
      docUrl = link;
    } else if (id && msg.fetchedUrl) {
      docUrl = msg.fetchedUrl;
    }
    return (
      <div className="message-doc">
        <a href={docUrl} target="_blank" rel="noopener noreferrer">
          {caption || "Document"} (Click to view/download)
        </a>
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

export { fetchMediaUrl, renderMessageContent };
