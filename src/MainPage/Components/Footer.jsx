import React from "react";
import { Link } from "react-router-dom";
import {
  FaTwitter,
  FaFacebookF,
  FaInstagram,
  FaTiktok,
  FaYoutube,
  FaWhatsapp,
} from "react-icons/fa";
// import logo from "../../Assets/logo.png"; 
import "../Styles/footer.css";

const Footer = () => {
  return (
    <footer className="footer-container mt-5">
      {/* Top Section */}
      <div className="footer-top py-4">
        <div className="container">
          <div className="row text-center">
            {/* Logo in the Middle */}
            <div className="col-12">
              {/* <img src={logo} alt="WhatsCRM Logo" className="footer-logo mb-2" /> */}
              <p className="mb-4 powered-text">
                Powered by the Official WhatsApp API
              </p>
            </div>
          </div>
          <div className="row justify-content-center">
            {/* Useful Links */}
            <div className="col-6 col-md-3 mb-4">
              <h5 className="footer-title">Useful Links</h5>
              <ul className="list-unstyled">
                <li><Link to="/privacy">Privacy Policy</Link></li>
                <li><Link to="/terms">Terms & Conditions</Link></li>
                <li><Link to="/contact">Contact Us</Link></li>
              </ul>
            </div>
            {/* Pages */}
            <div className="col-6 col-md-3 mb-4">
              <h5 className="footer-title">Pages</h5>
              <ul className="list-unstyled">
                <li><Link to="/growth-potential">Unlocking Growth Potential</Link></li>
                <li><Link to="/customer-experience">Customer Experience</Link></li>
                <li><Link to="/growth">Unlocking Growth</Link></li>
                <li><Link to="/support">Customer Support</Link></li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="footer-bottom py-3">
        <div className="container">
          <div className="row align-items-center">
            {/* Left: Copyright */}
            <div className="col-md-4 text-center text-md-start mb-2 mb-md-0">
              <p>© {new Date().getFullYear()} WhatsCRM. All rights reserved.</p>
            </div>
            {/* Middle: Terms & Privacy */}
            <div className="col-md-4 text-center mb-2 mb-md-0">
              <Link to="/terms" className="me-3">Terms & Conditions</Link>
              <Link to="/privacy">Privacy Policy</Link>
            </div>
            {/* Right: Social Icons */}
            <div className="col-md-4 text-center text-md-end">
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="social-icon me-2"
              >
                <FaTwitter />
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="social-icon me-2"
              >
                <FaFacebookF />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="social-icon me-2"
              >
                <FaInstagram />
              </a>
              <a
                href="https://tiktok.com"
                target="_blank"
                rel="noopener noreferrer"
                className="social-icon me-2"
              >
                <FaTiktok />
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                className="social-icon me-2"
              >
                <FaYoutube />
              </a>
              <a
                href="https://whatsapp.com"
                target="_blank"
                rel="noopener noreferrer"
                className="social-icon"
              >
                <FaWhatsapp />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
