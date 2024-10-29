import React from 'react';
import { FaMapMarkerAlt, FaPhoneAlt, FaEnvelope } from 'react-icons/fa';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <h3>Today's Hours</h3>
        <p>7am-6pm</p>
        <ul className="footer-links">
          <li>
            <FaMapMarkerAlt className="icon" />
            74513 Main Avenue, Houston, TX 12345
          </li>
          <li>
            <FaPhoneAlt className="icon" />
            +1 (832) 572 4189
          </li>
          <li>
            <FaEnvelope className="icon" />
            info@coogzoo.com
          </li>
        </ul>
        <button className="contact-button">Contact Us</button>
      </div>
      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} CoogZoo. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;