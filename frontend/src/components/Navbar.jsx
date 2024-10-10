import React, { useState } from 'react';
import { Link } from 'react-router-dom'; 
import './Navbar.css';
import LoginButton from './LoginButton';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <nav className="navbar">
      <div className="navbar-logo">
      <Link to="/">CoogZoo</Link>
      </div>
      <div className="navbar-toggle" onClick={toggleMenu}>
        ☰
      </div>
      <ul className={`navbar-links ${isOpen ? 'open' : ''}`}>
      <li><Link to="/animals" onClick={toggleMenu}>Animals</Link></li>
      <li><Link to="/exhibits" onClick={toggleMenu}>Exhibits</Link></li>
      <li><Link to="/tickets" onClick={toggleMenu}>Tickets</Link></li>
      <li><Link to="/membership" onClick={toggleMenu}>Membership</Link></li>
      <li><Link to="/events" onClick={toggleMenu}>Events</Link></li>
      <li><Link to="/contact" onClick={toggleMenu}>Contact Us</Link></li>
      </ul>
      <LoginButton></LoginButton>
    </nav>
  );
};

export default Navbar;