
import React from "react"; 
import { Link } from "react-router-dom";
import { FaCheck } from "react-icons/fa";
import "../Styles/pricing.css";

function Pricing() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const details = [
    {
      title: "Trial Plan",
      description: "A 10-day free trial allowing users to explore essential features before committing to a paid plan.",
      price: "Ksh 0/=",
      privileges: [
        "Chat tags",
        "Chat notes",
        "Automated chatbot",
        "Cloud API access",
      ],
    },
    {
      title: "Basic Plan",
      description: "A cost-effective 30-day plan designed for individuals and small businesses seeking essential chat automation features.",
      price: "Ksh 500/=",
      privileges: [
        "Chat tags",
        "Chat notes",
        "Automated chatbot",
        "Cloud API access",
      ],
    },
    {
      title: "Premium Plan",
      description: "A comprehensive 90-day plan tailored for businesses requiring advanced automation and seamless customer engagement.",
      price: "Ksh 5,000/=",
      privileges: [
        "Chat tags",
        "Chat notes",
        "Advanced chatbot automation",
        "Full Cloud API integration",
      ],
    },
  ];
  

  return (
    <div className="pricingContainer">
      <h2 className="price-head">Packages</h2>
      <div className="pricing-grid">
        {details.map((plan, index) => (
          <div key={index} className="pricing-card">
            <h3>{plan.title}</h3>
            <p>{plan.description}</p>
            <h4 className="price-tag">Privileges</h4>
            <div className="tag">{plan.price}</div>
            <ul className="privileges">
              {plan.privileges.map((privilege, i) => (
                <li key={i}>
                  <FaCheck className="check-icon" /> {privilege}
                </li>
              ))}
            </ul>
            <Link to="/user/dashboard" className="btn butto" onClick={scrollToTop}>
              Get Started
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Pricing;
