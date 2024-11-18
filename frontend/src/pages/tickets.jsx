import React, { useState, useEffect } from 'react';
import { useAuth } from '../components/AuthContext';
import './tickets.css';

const TicketsPage = () => {
  const { userRole, userEmail } = useAuth();
  const isCustomer = userRole === 'Customer';

  const [selectedTicket, setSelectedTicket] = useState(null);
  const [purchaseSuccess, setPurchaseSuccess] = useState(false);
  const [purchasedTickets, setPurchasedTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [exhibits, setExhibits] = useState([]);
  const [selectedExhibit, setSelectedExhibit] = useState('');
  const [exhibitsLoading, setExhibitsLoading] = useState(true);
  const [error, setError] = useState('');

  const ticketOptions = [
    { type: 'Child', price: 10, description: 'Ages 3-12' },
    { type: 'Adult', price: 20, description: 'Ages 13-64' },
    { type: 'Senior', price: 15, description: 'Ages 65+' },
  ];

  useEffect(() => {
    const fetchData = async () => {
      if (isCustomer && userEmail) {
        try {
          setLoading(true);
          await fetchPurchasedTickets();
          await fetchExhibits();
        } catch (error) {
          console.error('Error fetching data:', error);
          setError('Failed to load ticket information');
        } finally {
          setLoading(false);
        }
      }
    };
    fetchData();
  }, [isCustomer, userEmail, purchaseSuccess]);

  const fetchExhibits = async () => {
    try {
      setExhibitsLoading(true);
      const response = await fetch('https://finalcoogzoobackend.vercel.app/exhibits');
      if (!response.ok) {
        throw new Error('Failed to fetch exhibits');
      }
      const data = await response.json();
      
      const openExhibits = data.filter(exhibit => !exhibit.isClosed);
      setExhibits(openExhibits);
    } catch (error) {
      console.error('Error fetching exhibits:', error);
      setError('Failed to load exhibits');
    } finally {
      setExhibitsLoading(false);
    }
  };

  const fetchPurchasedTickets = async () => {
    try {
      if (!userEmail) {
        console.error('No user email provided');
        return;
      }
      const response = await fetch(`https://finalcoogzoobackend.vercel.app/purchased-tickets?email=${encodeURIComponent(userEmail)}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch tickets: ${response.status}`);
      }
  
      const data = await response.json();
      if (Array.isArray(data)) {
        setPurchasedTickets(data);
      } else {
        console.error('Unexpected response format:', data);
        setPurchasedTickets([]);
      }
    } catch (error) {
      console.error('Error fetching purchased tickets:', error);
      setPurchasedTickets([]);
      setError('Failed to load purchased tickets');
    }
  };

  const handleTicketSelection = (ticket) => {
    setSelectedTicket(ticket);
    setSelectedExhibit('');
    setError('');
  };

  const handleExhibitSelection = (e) => {
    const value = e.target.value;
    const selectedValue = value ? parseInt(value, 10) : '';
    setSelectedExhibit(selectedValue);
    setError('');
  };

  const handlePurchase = async (e) => {
    e.preventDefault();
    setError('');

    if (!selectedTicket || !selectedExhibit) {
      setError('Please select a ticket type and an exhibit.');
      return;
    }

    try {
      const response = await fetch('https://finalcoogzoobackend.vercel.app/tickets', {
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

      const data = await response.json();

      if (response.ok && data.success) {
        setSelectedTicket(null);
        setSelectedExhibit('');
        setPurchaseSuccess(true);
        await fetchPurchasedTickets();
        setTimeout(() => setPurchaseSuccess(false), 5000);
      } else {
        throw new Error(data.message || 'Purchase failed');
      }
    } catch (error) {
      console.error('Error purchasing ticket:', error);
      setError(error.message || 'Failed to purchase ticket. Please try again.');
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
      
      {error && <div className="error-message">{error}</div>}

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

          <div className="exhibit-selection">
            <label htmlFor="exhibitSelect">Choose an Exhibit:</label>
            {exhibitsLoading ? (
              <p>Loading exhibits...</p>
            ) : exhibits.length > 0 ? (
              <select
                id="exhibitSelect"
                value={selectedExhibit || ''}
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
            ) : (
              <p>No exhibits available</p>
            )}
          </div>

          <button 
            type="submit" 
            className="purchase-button"
            disabled={!selectedExhibit || exhibitsLoading}
          >
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
                  {ticket.Exhibit_Location && (
                    <p><strong>Location:</strong> {ticket.Exhibit_Location}</p>
                  )}
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