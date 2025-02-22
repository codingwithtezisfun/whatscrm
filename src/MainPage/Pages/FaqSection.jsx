import React, { useState } from "react";
import { FaChevronDown, FaChevronUp, FaQuestionCircle } from "react-icons/fa";
import "../Styles/faq.css"; // Importing custom styles

const faqs = [
  {
    question: "Can I use my existing WhatsApp number?",
    answer:
      "Yes, you can use an existing WhatsApp number. However, before onboarding, you must first delete the WhatsApp account linked to that number. If you wish to back up your WhatsApp text messages for restoration in WhatsApp CRM, you can use our Chat backup plugin.",
  },
  {
    question: "How secure is my data with WhatsApp CRM?",
    answer:
      "We prioritize security by implementing end-to-end encryption and advanced security protocols to ensure your data remains safe.",
  },
  {
    question: "Is there a free trial available?",
    answer:
      "Yes! We offer a 10-day free trial that allows you to explore all features before committing to a paid plan.",
  },
  {
    question: "Can I integrate WhatsApp CRM with other tools?",
    answer:
      "Absolutely! WhatsApp CRM supports integration with multiple third-party tools to enhance your workflow efficiency.",
  },
];

const FAQSection = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="faq-container container mt-5">
      <h2 className="faq-title">
        <FaQuestionCircle className="faq-icon" /> Frequently Asked Questions
      </h2>
      <div className="faq-grid">
        {faqs.map((faq, index) => (
          <div
            key={index}
            className={`faq-card ${openIndex === index ? "active" : ""}`}
          >
            <button
              onClick={() => toggleFAQ(index)}
              className="faq-question"
            >
              {faq.question}
              {openIndex === index ? <FaChevronUp /> : <FaChevronDown />}
            </button>
            <div className={`faq-answer ${openIndex === index ? "show" : ""}`}>
              <p>{faq.answer}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default FAQSection;
