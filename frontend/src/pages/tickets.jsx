import React, { useState } from 'react';
import './tickets.css';

const TicketPurchase = () => {
  const [customerId, setCustomerId] = useState('');
  const [ticketType, setTicketType] = useState('adult'); // Default ticket type
  const [price, setPrice] = useState(20); // Default price for adult ticket
  const [message, setMessage] = useState('');

  const handlePurchase = async (e) => {
    e.preventDefault();
    
    const ticketData = {
      customerId,
      ticketType,
      price,
    };

    try {
      const response = await fetch('http://localhost:5000/tickets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(ticketData),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(`Ticket purchased successfully! Receipt ID: ${data.receiptId}`);
      } else {
        setMessage(`Error: ${data.message}`);
      }
    } catch (error) {
      console.error('Error during ticket purchase:', error);
      setMessage('An error occurred while purchasing the ticket.');
    }
  };

  return (
    <div>
      <h2>Purchase Ticket</h2>
      <form onSubmit={handlePurchase}>
        <div>
          <label>
            Customer ID:
            <input
              type="text"
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
              required
            />
          </label>
        </div>
        <div>
          <label>
            Ticket Type:
            <select
              value={ticketType}
              onChange={(e) => setTicketType(e.target.value)}
            >
              <option value="adult">Adult</option>
              <option value="child">Child</option>
              <option value="senior">Senior</option>
            </select>
          </label>
        </div>
        <div>
          <label>
            Price:
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
            />
          </label>
        </div>
        <button type="submit">Purchase Ticket</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
};

export default TicketPurchase;