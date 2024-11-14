import React, { useState, useEffect, useCallback } from 'react';
import './tickets.css';
import { useAuth } from '../components/AuthContext';

const TicketsPage = () => {
  const { userRole, userEmail } = useAuth();
  const isCustomer = userRole === 'Customer';

  const [selectedTicket, setSelectedTicket] = useState(null);
  const [purchaseSuccess, setPurchaseSuccess] = useState(false);
  const [purchasedTickets, setPurchasedTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const ticketOptions = [
    { type: 'Child', price: 10, description: 'Ages 3-12' },
    { type: 'Adult', price: 20, description: 'Ages 13-64' },
    { type: 'Senior', price: 15, description: 'Ages 65+' },
  ];

  // Separate function to fetch tickets that can be called when needed
  const fetchPurchasedTickets = useCallback(async () => {
    if (!isCustomer || !userEmail) return;

    try {
      setLoading(true);
      setError(null);
      const response = await fetch(
        `https://coogzootestbackend-phi.vercel.app/purchased-tickets?email=${encodeURIComponent(userEmail)}`,
        {
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch purchased tickets');
      }

      const data = await response.json();
      setPurchasedTickets(data);
    } catch (error) {
      console.error('Error fetching purchased tickets:', error);
      setError('Failed to load tickets. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [isCustomer, userEmail]);

  // Initial fetch on component mount
  useEffect(() => {
    fetchPurchasedTickets();
  }, [fetchPurchasedTickets]);

  const handleTicketSelection = (ticketType) => {
    setSelectedTicket(ticketType);
  };

  const handlePurchase = async (e) => {
    e.preventDefault();

    if (!selectedTicket) {
      alert('Please select a ticket type.');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('https://coogzootestbackend-phi.vercel.app/tickets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: userEmail,
          ticketType: selectedTicket.type,
          price: selectedTicket.price
        }),
      });

      if (!response.ok) {
        throw new Error('Purchase failed');
      }

      setSelectedTicket(null);
      setPurchaseSuccess(true);
      
      // Wait a brief moment before fetching updated tickets
      setTimeout(async () => {
        await fetchPurchasedTickets();
        setPurchaseSuccess(false);
      }, 1000);
      
    } catch (error) {
      console.error('Error purchasing ticket:', error);
      alert('Failed to purchase ticket. Please try again.');
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

      <div className="ticket-selection">
        {ticketOptions.map((ticket) => (
          <div key={ticket.type} className="ticket-card">
            <h3>{ticket.type} Ticket</h3>
            <p>Price: <span>${ticket.price}</span></p>
            <p>{ticket.description}</p>
            <button
              className="purchase-button"
              onClick={() => handleTicketSelection(ticket)}
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
          <button type="submit" className="purchase-button" disabled={loading}>
            {loading ? 'Processing...' : 'Purchase Ticket'}
          </button>
        </form>
      )}

      {purchaseSuccess && (
        <div className="purchase-success">
          Ticket purchased successfully!
        </div>
      )}

      {/* Purchased Tickets Section */}
      <div className="purchased-tickets-section">
        <h2>Your Purchased Tickets</h2>
        {error && <div className="error-message">{error}</div>}
        {loading ? (
          <p>Loading your tickets...</p>
        ) : purchasedTickets.length > 0 ? (
          <div className="tickets-grid">
            {purchasedTickets.sort((a, b) => new Date(b.Purchase_Date) - new Date(a.Purchase_Date)).map((ticket) => (
              <div key={ticket.ID} className="purchased-ticket-card">
                <h3>{ticket.Ticket_Type} Ticket</h3>
                <div className="ticket-details">
                  <p><strong>Purchase Date:</strong> {formatDate(ticket.Purchase_Date)}</p>
                  <p><strong>Price:</strong> ${ticket.Price}</p>
                  <p><strong>Receipt ID:</strong> {ticket.Receipt_ID}</p>
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