import React, { useState, useEffect } from 'react';
import './tickets.css';
import { useAuth } from '../components/AuthContext';

const TicketsPage = () => {
  const { userRole, userEmail } = useAuth();
  const isCustomer = userRole?.toLowerCase() === 'customer';

  const [selectedTicket, setSelectedTicket] = useState(null);
  const [purchaseSuccess, setPurchaseSuccess] = useState(false);
  const [purchasedTickets, setPurchasedTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [exhibits, setExhibits] = useState([]);
  const [selectedExhibit, setSelectedExhibit] = useState('');
  const [exhibitsLoading, setExhibitsLoading] = useState(true);
  const [error, setError] = useState(null);


  const ticketOptions = [
    { type: 'Child', price: 10, description: 'Ages 3-12' },
    { type: 'Adult', price: 20, description: 'Ages 13-64' },
    { type: 'Senior', price: 15, description: 'Ages 65+' },
  ];

  useEffect(() => {
    if (isCustomer && userEmail) {
      fetchPurchasedTickets();
      fetchExhibits();
    }
  }, [isCustomer, userEmail]);

  const fetchExhibits = async () => {
    try {
      setExhibitsLoading(true);
      setError(null);
      const response = await fetch('https://coogzootestbackend-phi.vercel.app/exhibits');
      if (!response.ok) {
        throw new Error('Failed to fetch exhibits');
      }
      const data = await response.json();
      console.log('Fetched exhibits:', data);
      setExhibits(data.filter(exhibit => !exhibit.isClosed));
    } catch (error) {
      console.error('Error fetching exhibits:', error);
      setError('Failed to load exhibits. Please try again later.');
    } finally {
      setExhibitsLoading(false);
    }
  };

  const fetchPurchasedTickets = async () => {
    try {
      setLoading(true);
      const response = await fetch(`https://coogzootestbackend-phi.vercel.app/purchased-tickets?email=${encodeURIComponent(userEmail)}`);
      if (!response.ok) {
        throw new Error('Failed to fetch purchased tickets');
      }
      const data = await response.json();
      console.log('Fetched purchased tickets:', data);
      setPurchasedTickets(data);
    } catch (error) {
      console.error('Error fetching purchased tickets:', error);
      setError('Failed to load purchase history. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (e) => {
    e.preventDefault();

    if (!selectedTicket || !selectedExhibit) {
      setError('Please select both a ticket type and an exhibit.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const purchaseData = {
        email: userEmail,
        ticketType: selectedTicket.type,
        price: selectedTicket.price,
        exhibitId: selectedExhibit,
      };

      console.log('Sending purchase request:', purchaseData);

      const response = await fetch('https://coogzootestbackend-phi.vercel.app/tickets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(purchaseData),
      });

      const responseData = await response.json();
      console.log('Purchase response:', responseData);

      if (!response.ok) {
        throw new Error(responseData.message || 'Failed to purchase ticket');
      }

      setSelectedTicket(null);
      setSelectedExhibit('');
      setPurchaseSuccess(true);
      await fetchPurchasedTickets();
      
      setTimeout(() => setPurchaseSuccess(false), 5000);
    } catch (error) {
      console.error('Error purchasing ticket:', error);
      setError(error.message || 'Failed to purchase ticket. Please try again.');
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
        <h1>Purchase Tickets</h1>
        <div className="no-access">
          <p>Please log in as a customer to purchase tickets.</p>
          <p>Current role: {userRole || 'Not logged in'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="tickets-container">
      <h1>Purchase Tickets</h1>

      {error && (
        <div className="error-message">
          {error}
          <button className="close-error" onClick={() => setError(null)}>×</button>
        </div>
      )}

      {purchaseSuccess && (
        <div className="purchase-success">
          Ticket purchased successfully!
        </div>
      )}

      <div className="ticket-selection">
        {ticketOptions.map((ticket) => (
          <div 
            key={ticket.type} 
            className={`ticket-card ${selectedTicket?.type === ticket.type ? 'selected' : ''}`}
          >
            <h3>{ticket.type} Ticket</h3>
            <p className="ticket-price">Price: <span>${ticket.price.toFixed(2)}</span></p>
            <p className="ticket-description">{ticket.description}</p>
            <button
              className={`purchase-button ${selectedTicket?.type === ticket.type ? 'selected' : ''}`}
              onClick={() => handleTicketSelection(ticket)}
              disabled={loading}
            >
              {selectedTicket?.type === ticket.type ? 'Selected' : `Select ${ticket.type} Ticket`}
            </button>
          </div>
        ))}
      </div>

      {selectedTicket && (
        <form className="customer-info-form" onSubmit={handlePurchase}>
          <h3>Select Your Exhibit</h3>
          <div className="selected-ticket-info">
            <p>Selected Ticket: {selectedTicket.type} - ${selectedTicket.price.toFixed(2)}</p>
          </div>

          <div className="exhibit-selection">
            <label htmlFor="exhibitSelect">Choose an Exhibit:</label>
            {exhibitsLoading ? (
              <div className="loading-spinner">Loading exhibits...</div>
            ) : (
              <select
                id="exhibitSelect"
                value={selectedExhibit || ''}
                onChange={handleExhibitSelection}
                required
                disabled={loading}
              >
                <option value="">Select an Exhibit</option>
                {exhibits.map((exhibit) => (
                  <option key={exhibit.id} value={exhibit.id}>
                    {exhibit.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          <button 
            type="submit" 
            className="purchase-button submit"
            disabled={loading || exhibitsLoading || !selectedExhibit}
          >
            {loading ? 'Processing...' : 'Purchase Ticket'}
          </button>
        </form>
      )}

      <div className="purchased-tickets-section">
        <h2>Your Purchased Tickets</h2>
        {loading ? (
          <div className="loading-spinner">Loading your tickets...</div>
        ) : purchasedTickets.length > 0 ? (
          <div className="tickets-grid">
            {purchasedTickets.map((ticket) => (
              <div key={ticket.Ticket_ID} className="purchased-ticket-card">
                <h3>{ticket.Ticket_Type} Ticket</h3>
                <div className="ticket-details">
                  <p><strong>Purchase Date:</strong> {formatDate(ticket.Purchase_Date)}</p>
                  <p><strong>Price:</strong> ${parseFloat(ticket.Price).toFixed(2)}</p>
                  <p><strong>Receipt ID:</strong> {ticket.Receipt_ID}</p>
                  <p><strong>Exhibit:</strong> {ticket.Exhibit_Name || 'N/A'}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="no-tickets">No tickets purchased yet.</p>
        )}
      </div>
    </div>
  );
};

export default TicketsPage;