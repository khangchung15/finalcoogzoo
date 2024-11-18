import React, { useState, useEffect } from 'react';
import './ticketreport.css';

const TicketReport = () => {
  const [reportData, setReportData] = useState({
    ticketTypes: [],
    exhibitPopularity: [],
    totalRevenue: 0,
    totalTickets: 0
  });
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [exhibits, setExhibits] = useState([]); // Keep track of all exhibits
  const [selectedExhibits, setSelectedExhibits] = useState([]); // Keep track of selected exhibits
  const [error, setError] = useState('');

  // Fetch exhibits first
  useEffect(() => {
    const fetchExhibits = async () => {
      try {
        const response = await fetch('https://finalcoogzoobackend.vercel.app/exhibits');
        if (!response.ok) {
          throw new Error('Failed to fetch exhibits');
        }
        const data = await response.json();
        console.log('Fetched exhibits:', data);
        setExhibits(data);
      } catch (error) {
        console.error('Error fetching exhibits:', error);
        setError('Failed to fetch exhibits');
      }
    };

    fetchExhibits();
  }, []);

  // Fetch report data when dates or selected exhibits change
  useEffect(() => {
    const fetchReportData = async () => {
      if (!startDate || !endDate) return;
  
      setLoading(true);
      setError('');
  
      try {
        const queryParams = new URLSearchParams({
          startDate,
          endDate,
          exhibits: selectedExhibits.join(',')
        });
  
        console.log('Query params:', queryParams.toString());
  
        const response = await fetch(`https://finalcoogzoobackend.vercel.app/ticket-report?${queryParams}`);
        console.log('Response status:', response.status);
        
        if (!response.ok) {
          const errorText = await response.text(); // Get the error message as text
          console.error('Error response:', errorText);
          throw new Error(`Failed to fetch report data: ${errorText}`);
        }
  
        const data = await response.json();
        console.log('Received data:', data);
        
        if (!data) {
          throw new Error('No data received from server');
        }
  
        setReportData(data);
      } catch (error) {
        console.error('Full error:', error);
        setError(error.message || 'Failed to fetch report data');
      } finally {
        setLoading(false);
      }
    };
  
    fetchReportData();
  }, [startDate, endDate, selectedExhibits]);

  const toggleExhibit = (exhibitId) => {
    setSelectedExhibits(prev => 
      prev.includes(exhibitId)
        ? prev.filter(id => id !== exhibitId)
        : [...prev, exhibitId]
    );
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };

  if (loading && !exhibits.length) {
    return <div>Loading exhibits...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="ticket-report-container">
      <h1>Ticket Sales Report</h1>
      
      <div className="filters-section">
        <div className="date-filters">
          <div className="date-input-group">
            <label htmlFor="start-date">Start Date:</label>
            <input
              type="date"
              id="start-date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div className="date-input-group">
            <label htmlFor="end-date">End Date:</label>
            <input
              type="date"
              id="end-date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </div>

        <div className="exhibit-filters">
          <h3>Filter by Exhibits:</h3>
          <div className="exhibit-buttons">
            {exhibits.map((exhibit) => (
              <button
                key={exhibit.id}
                onClick={() => toggleExhibit(exhibit.id)}
                className={`exhibit-button ${selectedExhibits.includes(exhibit.id) ? 'selected' : ''}`}
              >
                {exhibit.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading ? (
        <div>Loading report data...</div>
      ) : (
        <>
          <div className="report-summary">
            <div className="summary-card">
              <h3>Total Revenue</h3>
              <p>{formatCurrency(reportData.totalRevenue)}</p>
            </div>
            <div className="summary-card">
              <h3>Total Tickets</h3>
              <p>{reportData.totalTickets}</p>
            </div>
            <div className="summary-card">
              <h3>Average Price per Ticket</h3>
              <p>{formatCurrency(reportData.totalTickets ? reportData.totalRevenue / reportData.totalTickets : 0)}</p>
            </div>
          </div>

          <div className="report-details">
            <div className="ticket-types">
              <h2>Ticket Types Distribution</h2>
              <table>
                <thead>
                  <tr>
                    <th>Ticket Type</th>
                    <th>Count</th>
                    <th>Revenue</th>
                    <th>Percentage</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.ticketTypes.map((type) => (
                    <tr key={type.type}>
                      <td>{type.type}</td>
                      <td>{type.count}</td>
                      <td>{formatCurrency(type.revenue)}</td>
                      <td>{type.percentage}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="exhibit-popularity">
              <h2>Exhibit Popularity</h2>
              <table>
                <thead>
                  <tr>
                    <th>Exhibit</th>
                    <th>Tickets Sold</th>
                    <th>Revenue</th>
                    <th>Percentage</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.exhibitPopularity.map((exhibit) => (
                    <tr key={exhibit.name}>
                      <td>{exhibit.name}</td>
                      <td>{exhibit.tickets}</td>
                      <td>{formatCurrency(exhibit.revenue)}</td>
                      <td>{exhibit.percentage}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default TicketReport;