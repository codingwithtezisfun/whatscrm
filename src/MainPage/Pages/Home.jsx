import React from "react";
import "../Styles/home.css"; 
import { Link } from "react-router-dom";
import home from "../../Assets/home-2.png";


const Home = () => {
  return (
    <div className="home-container">
      <div className="left">
        <h1 className="mt-5">Grow your business with <span>WhatsCRM</span></h1>
        <p>
          Personalize communication and sell more with the WhatsApp Business API
          platform that automates marketing, sales, service, and support.
        </p>
        <div className="buttons">
        <div className="buttons mt-5">
        <Link to="/signup" className="custom-btn try">
            Try Now
        </Link>
        <br />
        <Link to="/book-demo" className="demo">
            Book a Demo
        </Link>
        </div>

        </div>
      </div>
      <div className="right">
        <div className="image-placeholder">
            <img src={home} alt="homeimage" />
        </div>
      </div>
    </div>
  );
};

export default Home;
