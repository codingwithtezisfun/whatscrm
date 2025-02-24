import React from "react";
import "../Styles/features.css"; 
import { FaBullhorn, FaRobot, FaComments } from "react-icons/fa";
import { TiTick } from "react-icons/ti";

const featuresData = [
  {
    icon: <FaBullhorn className="feature-icon" />,
    title: "Broadcast",
    points: [
      "Maximize campaign reach and interaction through WhatsApp messages with exceptional response rates.",
      "Organize contacts efficiently, categorize them, and tailor messages for targeted communication.",
      "Foster lasting customer connections and cultivate sales opportunities by consistently engaging with your audience through WhatsApp interactions."
    ]
  },
  {
    icon: <FaRobot className="feature-icon" />,
    title: "Chatbots",
    points: [
      "Generate instant responses to frequent inquiries effortlessly using no-code chatbots.",
      "Streamline personalized communication and mass messaging with automated solutions.",
      "Increase sales by efficiently converting customer interactions into actionable leads through WhatsApp."
    ]
  },
  {
    icon: <FaComments className="feature-icon" />,
    title: "Online Chat CRM",
    points: [
      "Collaborate seamlessly across your team by sharing the Wati inbox, delivering exceptional support via WhatsApp.",
      "Easily incorporate customer context with pre-built integrations, enhancing communication efficiency.",
      "Deliver timely post-sales updates, manage order inquiries, and promptly address support issues via WhatsApp."
    ]
  }
];

const Features = () => {
  return (
    <section className="features">
      <h2>Features</h2>
      <div className="features-grid">
        {featuresData.map((feature, index) => (
          <div key={index} className="feature-card">
            {feature.icon}
            <h3>{feature.title}</h3>
            <div className="feature-points">
              {feature.points.map((point, i) => (
                <p key={i}><TiTick className="tick-icon" /> {point}</p>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Features;
