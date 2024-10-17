import React, { useState } from 'react';
import './contactus.css';

const ContactUs = () => {
  const [contactInfo, setContactInfo] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setContactInfo({
      ...contactInfo,
      [name]: value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!contactInfo.name || !contactInfo.email || !contactInfo.message) {
      alert("Please fill in all the fields.");
      return;
    }

    console.log('Contact information submitted:', contactInfo);

    setContactInfo({
      name: '',
      email: '',
      message: ''
    });
    setSubmitted(true);

    setTimeout(() => setSubmitted(false), 5000);
  };

  return (
    <div className="contactus-container">
      <h1>Contact Us</h1>

      <form className="contactus-form" onSubmit={handleSubmit}>
        <label htmlFor="name">Name:</label>
        <input
          type="text"
          id="name"
          name="name"
          value={contactInfo.name}
          onChange={handleInputChange}
          required
        />

        <label htmlFor="email">Email:</label>
        <input
          type="email"
          id="email"
          name="email"
          value={contactInfo.email}
          onChange={handleInputChange}
          required
        />

        <label htmlFor="message">Message:</label>
        <textarea
          id="message"
          name="message"
          value={contactInfo.message}
          onChange={handleInputChange}
          required
        ></textarea>

        <button type="submit" className="submit-button">Send Message</button>
      </form>

      {submitted && <div className="submit-success">Your message has been sent successfully!</div>}
    </div>
  );
};

export default ContactUs;
