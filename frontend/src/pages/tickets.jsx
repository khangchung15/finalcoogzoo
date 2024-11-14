import React, { useState, useEffect } from 'react';
import './tickets.css';
import { useAuth } from '../components/AuthContext';

const TicketsPage = () => {
  const { userRole, userEmail } = useAuth();
  const isCustomer = userRole === 'Customer';

  const [selectedTicket, setSelectedTicket] = useState(null);
  const [purchaseSuccess, setPurchaseSuccess] = useState(false);
  const [purchasedTickets, setPurchasedTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [exhibits, setExhibits] = useState([]);
  const [selectedExhibit, setSelectedExhibit] = useState('');
  const [error, setError] = useState(null);

  const ticketOptions = [
    { type: 'Child', price: 10, description: 'Ages 3-12' },
    { type: 'Adult', price: 20, description: 'Ages 13-64' },
    { type: 'Senior', price: 15, description: 'Ages 65+' },
  ];

  const fetchExhibits = async () => {
    try {
      setError(null);
      const response = await fetch('https://coogzootestbackend-phi.vercel.app/exhibits', {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Cache-Control': 'no-cache'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch exhibits: ${response.status}`);
      }
      
      const data = await response.json();
      // Filter out closed exhibits
      const openExhibits = data.filter(exhibit => !exhibit.is_closed);
      setExhibits(openExhibits);
    } catch (error) {
      console.error('Error fetching exhibits:', error);
      setError('Failed to load exhibits. Please try again.');
    }
  };

  const fetchPurchasedTickets = async () => {
    if (!userEmail) return;
    
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(
        `https://coogzootestbackend-phi.vercel.app/purchased-tickets?email=${encodeURIComponent(userEmail)}`,
        {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Cache-Control': 'no-cache'
          }
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch tickets: ${response.status}`);
      }

      const data = await response.json();
      setPurchasedTickets(data);
    } catch (error) {
      console.error('Error fetching purchased tickets:', error);
      setError('Failed to load tickets. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isCustomer) {
      fetchExhibits();
      if (userEmail) {
        fetchPurchasedTickets();
      }
    }
  }, [isCustomer, userEmail, purchaseSuccess]);

  const handleTicketSelection = (ticketType) => {
    setSelectedTicket(ticketType);
  };

  const handleExhibitSelection = (e) => {
    setSelectedExhibit(e.target.value);
  };

  const handlePurchase = async (e) => {
    e.preventDefault();

    if (!selectedTicket || !selectedExhibit) {
      alert('Please select both a ticket type and an exhibit.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('https://coogzootestbackend-phi.vercel.app/tickets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: userEmail,
          ticketType: selectedTicket.type,
          price: selectedTicket.price,
          exhibitId: parseInt(selectedExhibit), // Ensure exhibitId is sent as a number
        }),
      });

      if (!response.ok) {
        throw new Error('Purchase failed');
      }

      const result = await response.json();
      setSelectedTicket(null);
      setSelectedExhibit('');
      setPurchaseSuccess(true);

      // Fetch updated tickets after successful purchase
      await fetchPurchasedTickets();
      
      setTimeout(() => setPurchaseSuccess(false), 3000);
    } catch (error) {
      console.error('Error purchasing ticket:', error);
      setError('Failed to purchase ticket. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (!isCustomer) {
    return (
      <div className="tickets-container">
        <div className="no-access">
          Please create a customer account to purchase tickets.
        </div>
      </div>
    );
  }

  return (
    <div className="tickets-container">
      <h1>Purchase Tickets</h1>
      
      {error && (
        <div className="error-message" style={{ color: 'red', margin: '10px 0' }}>
          {error}
        </div>
      )}

      <div className="ticket-selection">
        {ticketOptions.map((ticket) => (
          <div 
            key={ticket.type} 
            className={`ticket-card ${selectedTicket?.type === ticket.type ? 'selected' : ''}`}
          >
            <h3>{ticket.type} Ticket</h3>
            <p>Price: <span>${ticket.price}</span></p>
            <p>{ticket.description}</p>
            <button
              className="purchase-button"
              onClick={() => handleTicketSelection(ticket)}
              disabled={loading}
            >
              Select {ticket.type} Ticket
            </button>
          </div>
        ))}
      </div>

      {selectedTicket && (
        <form className="customer-info-form" onSubmit={handlePurchase}>
          <h3>Anyday Access to the Zoo</h3>
          <p>Selected Ticket: {selectedTicket.type} - ${selectedTicket.price}</p>
          
          <div className="form-group">
            <label htmlFor="exhibitSelect">Choose an Exhibit:</label>
            <select
              id="exhibitSelect"
              value={selectedExhibit}
              onChange={handleExhibitSelection}
              required
              className="exhibit-select"
              disabled={loading}
            >
              <option value="">Select an Exhibit</option>
              {exhibits.map((exhibit) => (
                <option key={exhibit.ID} value={exhibit.ID}>
                  {exhibit.Name}
                </option>
              ))}
            </select>
          </div>

          <button 
            type="submit" 
            className="purchase-button"
            disabled={loading || !selectedExhibit}
          >
            {loading ? 'Processing...' : 'Purchase Ticket'}
          </button>
        </form>
      )}

      {purchaseSuccess && (
        <div className="purchase-success">
          Ticket purchased successfully!
        </div>
      )}

      <div className="purchased-tickets-section">
        <h2>Your Purchased Tickets</h2>
        {loading ? (
          <p>Loading your tickets...</p>
        ) : purchasedTickets.length > 0 ? (
          <div className="tickets-grid">
            {purchasedTickets
              .sort((a, b) => new Date(b.Purchase_Date) - new Date(a.Purchase_Date))
              .map((ticket) => (
                <div key={ticket.Ticket_ID} className="purchased-ticket-card">
                  <h3>{ticket.Ticket_Type} Ticket</h3>
                  <div className="ticket-details">
                    <p><strong>Purchase Date:</strong> {formatDate(ticket.Purchase_Date)}</p>
                    <p><strong>Price:</strong> ${ticket.Price}</p>
                    <p><strong>Receipt ID:</strong> {ticket.Receipt_ID}</p>
                    <p><strong>Exhibit:</strong> {ticket.Exhibit_Name || 'N/A'}</p>
                    <p><strong>Status:</strong> {ticket.is_used ? "Used" : "Not Used"}</p>
                  </div>
                </div>
            ))}
          </div>
        ) : (
          <p>No tickets purchased yet.</p>
        )}
      </div>
    </div>
  );
};

export default TicketsPage;