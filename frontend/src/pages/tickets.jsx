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
  }, [isCustomer, userEmail, purchaseSuccess]);

  const fetchExhibits = async () => {
    try {
      const response = await fetch('https://coogzootestbackend-phi.vercel.app/exhibits');
      if (response.ok) {
        const data = await response.json();
        console.log('Fetched exhibits:', data); // For debugging
        setExhibits(data);
      } else {
        console.error('Failed to fetch exhibits');
      }
    } catch (error) {
      console.error('Error fetching exhibits:', error);
    }
  };

  const fetchPurchasedTickets = async () => {
    try {
      setLoading(true);
      const response = await fetch(`https://coogzootestbackend-phi.vercel.app/purchased-tickets?email=${userEmail}`);
      if (response.ok) {
        const data = await response.json();
        setPurchasedTickets(data);
      } else {
        console.error('Failed to fetch purchased tickets');
      }
    } catch (error) {
      console.error('Error fetching purchased tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTicketSelection = (ticketType) => {
    setSelectedTicket(ticketType);
  };

  const handleExhibitSelection = (e) => {
    const selectedValue = e.target.value ? parseInt(e.target.value, 10) : '';
    setSelectedExhibit(selectedValue);
  };

  const handlePurchase = async (e) => {
    e.preventDefault();

    if (!selectedTicket || !selectedExhibit) {
      alert('Please select a ticket type and an exhibit.');
      return;
    }

    try {
      const response = await fetch('https://coogzootestbackend-phi.vercel.app/tickets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: userEmail,
          ticketType: selectedTicket.type,
          price: selectedTicket.price,
          exhibitId: selectedExhibit,
        }),
      });

      if (response.ok) {
        setSelectedTicket(null);
        setSelectedExhibit('');
        setPurchaseSuccess(true);
        await fetchPurchasedTickets();
        setTimeout(() => setPurchaseSuccess(false), 5000);
      } else {
        throw new Error('Purchase failed');
      }
    } catch (error) {
      console.error('Error purchasing ticket:', error);
      alert('Failed to purchase ticket. Please try again.');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="tickets-container">
      <h1>Purchase Tickets</h1>

      {isCustomer ? (
        <>
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

              <label htmlFor="exhibitSelect">Choose an Exhibit:</label>
              <select
                id="exhibitSelect"
                value={selectedExhibit || ''}  // Use empty string when no value is selected
                onChange={handleExhibitSelection}
                required
              >
                <option value="">Select an Exhibit</option>
                {exhibits.map((exhibit) => (
                  <option key={exhibit.id} value={exhibit.id}>
                    {exhibit.name}
                  </option>
                ))}
              </select>
              <button type="submit" className="purchase-button">
                Purchase Ticket
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
                {purchasedTickets.map((ticket) => (
                  <div key={ticket.Ticket_ID} className="purchased-ticket-card">
                    <h3>{ticket.Ticket_Type} Ticket</h3>
                    <div className="ticket-details">
                      <p><strong>Purchase Date:</strong> {formatDate(ticket.Purchase_Date)}</p>
                      <p><strong>Price:</strong> ${ticket.Price}</p>
                      <p><strong>Receipt ID:</strong> {ticket.Receipt_ID}</p>
                      <p><strong>Exhibit:</strong> {ticket.Exhibit_Name || 'N/A'}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p>No tickets purchased yet.</p>
            )}
          </div>
        </>
      ) : (
        <div className="no-access">
          Please create a customer account to purchase tickets.
        </div>
      )}
    </div>
  );
};

export default TicketsPage;