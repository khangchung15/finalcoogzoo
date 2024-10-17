import React, { useState } from 'react';
import './tickets.css';

const TicketsPage = () => {
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    email: '',
    phone: '',
    ticketType: '',
  });
  const [purchaseSuccess, setPurchaseSuccess] = useState(false);

  const ticketOptions = [
    { type: 'Child', price: 10 },
    { type: 'Adult', price: 20 },
    { type: 'Senior', price: 15 }
  ];

  const handleTicketSelection = (ticketType) => {
    setSelectedTicket(ticketType);
    setCustomerInfo({ ...customerInfo, ticketType });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCustomerInfo({ ...customerInfo, [name]: value });
  };

  const handlePurchase = (e) => {
    e.preventDefault();
    
    if (!customerInfo.name || !customerInfo.email || !customerInfo.phone || !selectedTicket) {
      alert("Please fill out all fields and select a ticket.");
      return;
    }
    console.log('Ticket purchased: ', customerInfo);

    setCustomerInfo({
      name: '',
      email: '',
      phone: '',
      ticketType: '',
    });
    setSelectedTicket(null);
    setPurchaseSuccess(true);

    setTimeout(() => setPurchaseSuccess(false), 5000);
  };

  return (
    <div className="tickets-container">
      <h1>Purchase Tickets</h1>

      <div className="ticket-selection">
        {ticketOptions.map((ticket) => (
          <div key={ticket.type} className="ticket-card">
            <h3>{ticket.type} Ticket</h3>
            <p>Price: <span>${ticket.price}</span></p>
            <button
              className="purchase-button"
              onClick={() => handleTicketSelection(ticket.type)}
            >
              Select {ticket.type} Ticket
            </button>
          </div>
        ))}
      </div>

      {selectedTicket && (
        <form className="customer-info-form" onSubmit={handlePurchase}>
          <h3>Enter Your Information</h3>
          <label>Name:</label>
          <input
            type="text"
            name="name"
            value={customerInfo.name}
            onChange={handleInputChange}
            required
          />
          <label>Email:</label>
          <input
            type="email"
            name="email"
            value={customerInfo.email}
            onChange={handleInputChange}
            required
          />
          <label>Phone:</label>
          <input
            type="tel"
            name="phone"
            value={customerInfo.phone}
            onChange={handleInputChange}
            required
          />
          <label>Selected Ticket Type: {selectedTicket}</label>
          <button type="submit" className="purchase-button">
            Purchase {selectedTicket} Ticket
          </button>
        </form>
      )}

      {purchaseSuccess && (
        <div className="purchase-success">
          Ticket purchased successfully!
        </div>
      )}
    </div>
  );
};

export default TicketsPage;
