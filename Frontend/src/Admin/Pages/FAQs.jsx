import React, { useState, useEffect } from "react";
import { FaChevronDown, FaChevronUp, FaQuestionCircle, FaTrash } from "react-icons/fa";
import axios from "axios";
import BASE_URL from "../../BaseUrl";
import "../Styles/faq.css"; 

const FAQs = () => {
  const [faqs, setFaqs] = useState([]);
  const [openIndex, setOpenIndex] = useState(null);
  const [newFaq, setNewFaq] = useState({ question: "", answer: "" });
  const [message, setMessage] = useState("");
  const token = localStorage.getItem("adminToken");

  // Fetch all FAQs on component mount
  const fetchFaqs = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/admin/get_faq`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.success) {
        setFaqs(res.data.data);
      }
    } catch (error) {
      console.error("Error fetching FAQs", error);
    }
  };

  useEffect(() => {
    fetchFaqs();
  }, [token]);

  // Toggle FAQ answer visibility
  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewFaq((prev) => ({ ...prev, [name]: value }));
  };

  // Add a new FAQ
  const addFaq = async () => {
    if (!newFaq.question || !newFaq.answer) {
      setMessage("Please provide both question and answer.");
      return;
    }
    try {
      const res = await axios.post(
        `${BASE_URL}/api/admin/add_faq`,
        newFaq,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (res.data.success) {
        setMessage("FAQ was added.");
        setNewFaq({ question: "", answer: "" });
        fetchFaqs();
      } else {
        setMessage(res.data.msg || "Add FAQ failed.");
      }
    } catch (error) {
      console.error("Error adding FAQ", error);
      setMessage("Error adding FAQ.");
    }
  };

  // Delete a FAQ
  const deleteFaq = async (id) => {
    try {
      const res = await axios.post(
        `${BASE_URL}/api/admin/del_faq`,
        { id },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (res.data.success) {
        setMessage("FAQ was deleted.");
        fetchFaqs();
      } else {
        setMessage(res.data.msg || "Delete FAQ failed.");
      }
    } catch (error) {
      console.error("Error deleting FAQ", error);
      setMessage("Error deleting FAQ.");
    }
  };

  return (
    <section className="__faq-container">
      <h2 className="faq-title">
        <FaQuestionCircle className="faq-icon" /> Frequently Asked Questions
      </h2>

      {/* Add FAQ Form */}
      <div className="faq-form">
        <h3>Add a FAQ</h3>
        <div className="faq-form-group">
          <label>Question</label>
          <input
            type="text"
            name="question"
            value={newFaq.question}
            onChange={handleInputChange}
            placeholder="Enter your question"
          />
        </div>
        <div className="faq-form-group">
          <label>Answer</label>
          <textarea
            name="answer"
            value={newFaq.answer}
            onChange={handleInputChange}
            placeholder="Enter the answer"
          ></textarea>
        </div>
        <button onClick={addFaq} className="faq-add-btn">
          Add FAQ
        </button>
        {message && <p className="faq-message">{message}</p>}
      </div>

      {/* Display FAQs */}
      <div className="faq-grid">
        {faqs.map((faq, index) => (
          <div
            key={faq.id}
            className={`faq-card ${openIndex === index ? "active" : ""}`}
          >
            <div className="faq-header">
              <button onClick={() => toggleFAQ(index)} className="faq-question">
                {faq.question}
                {openIndex === index ? <FaChevronUp /> : <FaChevronDown />}
              </button>
              <button onClick={() => deleteFaq(faq.id)} className="faq-delete-btn">
                <FaTrash />
              </button>
            </div>
            <div className={`faq-answer ${openIndex === index ? "show" : ""}`}>
              <p>{faq.answer}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default FAQs;
