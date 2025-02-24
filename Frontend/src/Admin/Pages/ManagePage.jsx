import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaPen, FaTrash, FaExternalLinkAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import BASE_URL from "../../BaseUrl";
import "../Styles/managepage.css"; 

const ManagePage = () => {
  const [selectedType, setSelectedType] = useState("");
  const [form, setForm] = useState({
    title: "",
    slug: "",
    content: "",
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [pages, setPages] = useState([]);
  const [message, setMessage] = useState("");
  const token = localStorage.getItem("adminToken");
  const navigate = useNavigate();

  // Fetch all pages on mount
  const fetchPages = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/admin/get_pages`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.success) {
        setPages(res.data.data);
      }
    } catch (error) {
      console.error("Error fetching pages", error);
    }
  };

  useEffect(() => {
    fetchPages();
  }, [token]);

  // Handle selection of page type (Privacy Policy or Terms and Conditions)
  const handleTypeSelect = (type) => {
    setSelectedType(type);
    // Pre-fill title and slug (slug should not exactly match reserved slugs)
    if (type === "Privacy Policy") {
      setForm((prev) => ({
        ...prev,
        title: "Privacy Policy",
        slug: "privacy-policy-new",
      }));
    } else if (type === "Terms and Conditions") {
      setForm((prev) => ({
        ...prev,
        title: "Terms and Conditions",
        slug: "terms-and-conditions-new",
      }));
    }
  };

  // Handle form field changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // Handle file selection
  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  // Add a new page
  const addPage = async () => {
    // Validate required fields
    if (!form.title || !form.slug || !form.content) {
      setMessage("Please fill all fields.");
      return;
    }
    if (!selectedFile) {
      setMessage("No image was selected.");
      return;
    }
    try {
      const formData = new FormData();
      formData.append("title", form.title);
      formData.append("slug", form.slug);
      formData.append("content", form.content);
      formData.append("file", selectedFile);

      const res = await axios.post(`${BASE_URL}/api/admin/add_page`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      if (res.data.success) {
        setMessage("Page was added successfully!");
        setForm({ title: "", slug: "", content: "" });
        setSelectedFile(null);
        setSelectedType("");
        fetchPages();
      } else {
        setMessage(res.data.msg || "Failed to add page.");
      }
    } catch (error) {
      console.error("Error adding page", error);
      setMessage("Something went wrong.");
    }
  };

  // Delete a page
  const deletePage = async (id) => {
    try {
      const res = await axios.post(
        `${BASE_URL}/api/admin/del_page`,
        { id },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (res.data.success) {
        setMessage("Page was deleted.");
        fetchPages();
      } else {
        setMessage(res.data.msg || "Failed to delete page.");
      }
    } catch (error) {
      console.error("Error deleting page", error);
      setMessage("Something went wrong.");
    }
  };

  // Redirect to full page view with the page id
  const openPage = (id) => {
    navigate(`/page?id=${id}`);
  };

  return (
    <div className="manage-page-container">
      <h1 className="page-title">Manage Pages</h1>
      
      {/* Selection Cards */}
      <div className="selection-cards">
        <div
          className={`card ${selectedType === "Privacy Policy" ? "active" : ""}`}
          onClick={() => handleTypeSelect("Privacy Policy")}
        >
          <div className="card-label">
            <FaPen className="pen-icon" /> Privacy Policy
          </div>
        </div>
        <div
          className={`card ${selectedType === "Terms and Conditions" ? "active" : ""}`}
          onClick={() => handleTypeSelect("Terms and Conditions")}
        >
          <div className="card-label">
            <FaPen className="pen-icon" /> Terms and Conditions
          </div>
        </div>
      </div>

      {/* Form for Adding a Page */}
      <div className="page-form">
        <div className="form-group">
          <label>Page Title</label>
          <input
            type="text"
            name="title"
            value={form.title}
            onChange={handleInputChange}
            placeholder="Enter page title"
          />
        </div>
        <div className="form-group">
          <label>Slug</label>
          <input
            type="text"
            name="slug"
            value={form.slug}
            onChange={handleInputChange}
            placeholder="Enter slug (e.g., bold, italic, underlined, H1, H2, H3, H4)"
            className="formatted-slug"
          />
        </div>
        <div className="form-group">
          <label>Content</label>
          <textarea
            name="content"
            value={form.content}
            onChange={handleInputChange}
            placeholder="Enter page content (you can include headings, bold, italic, underlined text, etc.)"
          ></textarea>
        </div>
        <div className="form-group">
          <label>Select Image</label>
          <input type="file" onChange={handleFileChange} />
        </div>
        <button className="add-btn" onClick={addPage}>
          Add Page
        </button>
        {message && <p className="form-message">{message}</p>}
      </div>

      {/* Display Added Pages */}
      <div className="pages-display">
        {pages.map((page) => (
          <div key={page.id} className="page-card">
            {page.image && (
              <img
                src={`${BASE_URL}/media/${page.image}`}
                alt={page.title}
                className="page-image"
              />
            )}
            <div className="page-content">
              <h3>{page.title}</h3>
              <p>{page.slug}</p>
              <div className="page-actions">
                <button onClick={() => deletePage(page.id)} className="action-btn delete-btn">
                  <FaTrash />
                </button>
                <button onClick={() => openPage(page.id)} className="action-btn open-btn">
                  <FaExternalLinkAlt />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ManagePage;
