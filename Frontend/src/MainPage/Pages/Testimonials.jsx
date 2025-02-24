import React, { useState, useEffect } from "react";
import axios from "axios";
import "../Styles/testimonials.css";
import { FaChevronLeft, FaChevronRight, FaQuoteLeft } from "react-icons/fa";

const Testimonials = () => {
  const [testimonials, setTestimonials] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Fetch data from a local JSON (or replace with your API endpoint)
  useEffect(() => {
    axios
      .get("/testimonials.json") // or your actual API endpoint
      .then((res) => {
        setTestimonials(res.data);
      })
      .catch((err) => {
        console.error("Error fetching testimonials:", err);
      });
  }, []);

  // Helper to wrap the index around the array length
  const getIndex = (offset) => {
    return (currentIndex + offset + testimonials.length) % testimonials.length;
  };

  // Handlers for navigation
  const goPrev = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };
  const goNext = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  // If no testimonials loaded yet
  if (!testimonials.length) {
    return <p style={{ textAlign: "center" }}>Loading testimonials...</p>;
  }

  // Indices for the three visible slides
  const prevIndex = getIndex(-1);
  const activeIndex = getIndex(0);
  const nextIndex = getIndex(1);

  return (
    <section className="testimonials-container mt-5 container">
      <div className="testimonials-heading">
        <h3>Over 8,000 customers</h3>
        <p>
          What some of our 8,000+ customers across 100+ countries think of WatsCRM.
        </p>
      </div>

      <div className="slider">
        <button className="nav-btn prev-btn" onClick={goPrev}>
          <FaChevronLeft />
        </button>

        <div className="slide-wrapper">
          {/* Previous Slide */}
          <div className="slide prev-slide">
            <div className="quote-icon">
              <FaQuoteLeft />
            </div>
            <blockquote>{testimonials[prevIndex].quote}</blockquote>
            <p className="desc">{testimonials[prevIndex].desc}</p>
            <h4 className="author">
              {testimonials[prevIndex].name} <span>({testimonials[prevIndex].title})</span>
            </h4>
          </div>

          {/* Active Slide */}
          <div className="slide active-slide">
            <div className="quote-icon">
              <FaQuoteLeft />
            </div>
            <blockquote>{testimonials[activeIndex].quote}</blockquote>
            <p className="desc">{testimonials[activeIndex].desc}</p>
            <h4 className="author">
              {testimonials[activeIndex].name} <span>({testimonials[activeIndex].title})</span>
            </h4>
          </div>

          {/* Next Slide */}
          <div className="slide next-slide">
            <div className="quote-icon">
              <FaQuoteLeft />
            </div>
            <blockquote>{testimonials[nextIndex].quote}</blockquote>
            <p className="desc">{testimonials[nextIndex].desc}</p>
            <h4 className="author">
              {testimonials[nextIndex].name} <span>({testimonials[nextIndex].title})</span>
            </h4>
          </div>
        </div>

        <button className="nav-btn next-btn" onClick={goNext}>
          <FaChevronRight />
        </button>
      </div>
    </section>
  );
};

export default Testimonials;
