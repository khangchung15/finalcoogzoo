import React, { useState, useEffect } from 'react';

const TicketsPage = ({ userRole = 'Customer', userEmail }) => {
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [purchaseSuccess, setPurchaseSuccess] = useState(false);
  const [purchasedTickets, setPurchasedTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [exhibits, setExhibits] = useState([]);
  const [selectedExhibit, setSelectedExhibit] = useState('');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Rest of the component remains exactly the same...
  const isCustomer = userRole === 'Customer';

  const ticketOptions = [
    { type: 'Child', price: 10, description: 'Ages 3-12' },
    { type: 'Adult', price: 20, description: 'Ages 13-64' },
    { type: 'Senior', price: 15, description: 'Ages 65+' },
  ];

  const fetchExhibits = async () => {
    try {
      const response = await fetch('https://coogzootestbackend-phi.vercel.app/exhibits');
      if (response.ok) {
        const data = await response.json();
        setExhibits(data);
      } else {
        console.error('Failed to fetch exhibits');
      }
    } catch (error) {
      console.error('Error fetching exhibits:', error);
    }
  };

  useEffect(() => {
    if (isCustomer && userEmail) {
      fetchPurchasedTickets();
      fetchExhibits();
    }
  }, [isCustomer, userEmail, refreshTrigger]);

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

  const handleTicketSelection = (ticket) => {
    setSelectedTicket(ticket);
  };

  const handleExhibitSelection = (e) => {
    setSelectedExhibit(e.target.value);
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
        setRefreshTrigger(prev => prev + 1);
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

  if (!userEmail) {
    return (
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">Purchase Tickets</h1>
        <div className="text-red-500">Please log in to purchase tickets.</div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Purchase Tickets</h1>

      {isCustomer ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {ticketOptions.map((ticket) => (
              <div key={ticket.type} className="border rounded-lg p-4 shadow">
                <h3 className="text-lg font-semibold mb-2">{ticket.type} Ticket</h3>
                <p className="mb-2">Price: <span className="font-bold">${ticket.price}</span></p>
                <p className="mb-4">{ticket.description}</p>
                <button
                  className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                  onClick={() => handleTicketSelection(ticket)}
                >
                  Select {ticket.type} Ticket
                </button>
              </div>
            ))}
          </div>

          {selectedTicket && (
            <form className="mb-6 p-4 border rounded-lg" onSubmit={handlePurchase}>
              <h3 className="text-lg font-semibold mb-4">Anyday Access to the Zoo</h3>
              <p className="mb-4">Selected Ticket: {selectedTicket.type} - ${selectedTicket.price}</p>

              <label className="block mb-2" htmlFor="exhibitSelect">Choose an Exhibit:</label>
              <select
                id="exhibitSelect"
                value={selectedExhibit}
                onChange={handleExhibitSelection}
                required
                className="w-full p-2 border rounded mb-4"
              >
                <option value="">Select an Exhibit</option>
                {exhibits.map((exhibit) => (
                  <option key={exhibit.ID} value={exhibit.ID}>
                    {exhibit.Name}
                  </option>
                ))}
              </select>

              <button 
                type="submit" 
                className="w-full bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
              >
                Purchase Ticket
              </button>
            </form>
          )}

          {purchaseSuccess && (
            <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6">
              Ticket purchased successfully!
            </div>
          )}

          <div className="mt-8">
            <h2 className="text-xl font-bold mb-4">Your Purchased Tickets</h2>
            {loading ? (
              <p>Loading your tickets...</p>
            ) : purchasedTickets.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {purchasedTickets.map((ticket) => (
                  <div key={ticket.Ticket_ID} className="border rounded-lg p-4 shadow">
                    <h3 className="text-lg font-semibold mb-2">{ticket.Ticket_Type} Ticket</h3>
                    <div>
                      <p className="mb-1"><strong>Purchase Date:</strong> {formatDate(ticket.Purchase_Date)}</p>
                      <p className="mb-1"><strong>Price:</strong> ${ticket.Price}</p>
                      <p className="mb-1"><strong>Receipt ID:</strong> {ticket.Receipt_ID}</p>
                      <p className="mb-1"><strong>Exhibit:</strong> {ticket.Exhibit_Name || 'N/A'}</p>
                      <p><strong>Status:</strong> {ticket.is_used ? "Used" : "Not Used"}</p>
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
        <div className="text-red-500">
          Please create a customer account to purchase tickets.
        </div>
      )}
    </div>
  );
};

export default TicketsPage;