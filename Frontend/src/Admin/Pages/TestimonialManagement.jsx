import React, { useState, useEffect } from "react";
import axios from "axios";
import BASE_URL from "../../BaseUrl";
import Swal from "sweetalert2";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

import { FaTrash } from "react-icons/fa";
import "../Styles/testimonialmanagement.css"; 

const TestimonialManagement = () => {
  const [testimonials, setTestimonials] = useState([]);
  const [token, setToken] = useState("");

  // Form data for adding a testimonial
  const [form, setForm] = useState({
    title: "",
    description: "",
    reviewer_name: "",
    reviewer_position: "",
  });

  // On mount, get token & fetch existing testimonials
  useEffect(() => {
    const storedToken = localStorage.getItem("adminToken");
    if (!storedToken) {
      window.location.href = "/admin/login";
    } else {
      setToken(storedToken);
      fetchTestimonials();
    }
    // eslint-disable-next-line
  }, []);

  // Fetch all testimonials from the backend
  const fetchTestimonials = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/admin/get_testi`);
      if (res.data.success) {
        setTestimonials(res.data.data);
      }
    } catch (err) {
      console.error("Error fetching testimonials:", err);
    }
  };

  // Handle form changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // Handle add testimonial
  const handleAddTestimonial = async (e) => {
    e.preventDefault();
    const { title, description, reviewer_name, reviewer_position } = form;
    if (!title || !description || !reviewer_name || !reviewer_position) {
      return Swal.fire({
        icon: "warning",
        title: "Missing fields",
        text: "Please fill all fields",
      });
    }

    try {
      const res = await axios.post(
        `${BASE_URL}/api/admin/add_testimonial`,
        { title, description, reviewer_name, reviewer_position },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (res.data.success) {
        Swal.fire({
          icon: "success",
          title: "Added",
          text: "Testimonial was added successfully",
          timer: 2000,
          showConfirmButton: false,
        });
        // Clear form & refresh list
        setForm({ title: "", description: "", reviewer_name: "", reviewer_position: "" });
        fetchTestimonials();
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: res.data.msg || "Failed to add testimonial",
        });
      }
    } catch (error) {
      console.error("Error adding testimonial:", error);
      Swal.fire({
        icon: "error",
        title: "Server Error",
        text: "Something went wrong while adding testimonial",
      });
    }
  };

  // Handle delete testimonial
  const handleDeleteTestimonial = async (id) => {
    try {
      const res = await axios.post(
        `${BASE_URL}/api/admin/del_testi`,
        { id },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (res.data.success) {
        Swal.fire({
          icon: "success",
          title: "Deleted",
          text: "Testimonial was deleted",
          timer: 2000,
          showConfirmButton: false,
        });
        fetchTestimonials();
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: res.data.msg || "Failed to delete testimonial",
        });
      }
    } catch (error) {
      console.error("Error deleting testimonial:", error);
      Swal.fire({
        icon: "error",
        title: "Server Error",
        text: "Something went wrong while deleting testimonial",
      });
    }
  };

  // React Slick settings
  const sliderSettings = {
    dots: true,
    infinite: false,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    autoplay: false,
    responsive: [
      {
        breakpoint: 1024,
        settings: { slidesToShow: 2 },
      },
      {
        breakpoint: 600,
        settings: { slidesToShow: 1 },
      },
    ],
  };

  return (
    <div className="testimonial-management-container">
      <h2>Testimonial</h2>
      <p>Add or delete frontend testimonial</p>

      {/* Form for adding a new testimonial */}
      <form className="testimonial-form" onSubmit={handleAddTestimonial}>
       
        <div className="testimonial-form-row">
          <label>Title</label>
          <input
            type="text"
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="Title"
          />
        </div>

        <div className="testimonial-form-row">
          <label>Description</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            rows="3"
            placeholder="Enter testimonial description"
          />
        </div>
       
        <div className="testimonial-top">
        <div className="testimonial-form-row">
          <label>Reviewer name</label>
          <input
            type="text"
            name="reviewer_name"
            value={form.reviewer_name}
            onChange={handleChange}
            placeholder="Reviewer name"
          />
        </div>

        <div className="testimonial-form-row">
          <label>Reviewer position</label>
          <input
            type="text"
            name="reviewer_position"
            value={form.reviewer_position}
            onChange={handleChange}
            placeholder="Reviewer position"
          />
        </div>
        </div>

        <button type="submit" className="add-btn">+ Add</button>
      </form>

      {/* Slider to display testimonials */}
      <div className="testimonial-slider">
        {testimonials.length === 0 ? (
          <p>No testimonials found.</p>
        ) : (
          <Slider {...sliderSettings}>
            {testimonials.map((testi) => (
              <div key={testi.id} className="testimonial-card">
                {/* Delete icon */}
                <button
                  className="delete-icon"
                  onClick={() => handleDeleteTestimonial(testi.id)}
                >
                  <FaTrash />
                </button>

                <blockquote className="testimonial-description">
                  “{testi.description}”
                </blockquote>

                <h4 className="testimonial-title">{testi.title}</h4>
                <p className="testimonial-reviewer">
                  {testi.reviewer_name} <br />
                  <span className="testimonial-position">
                    {testi.reviewer_position}
                  </span>
                </p>
              </div>
            ))}
          </Slider>
        )}
      </div>
    </div>
  );
};

export default TestimonialManagement;
