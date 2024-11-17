import React, { useState, useEffect } from 'react';
import './ticketreport.css';

const exhibitFilter = exhibits && exhibits.length > 0 ?
  `AND e.ID IN (${exhibits.map(id => parseInt(id)).join(',')})` : '';
  const queries = {
    ticketTypes: `
      SELECT
        t.Ticket_Type as type,
        COUNT(*) as count,
        SUM(t.Price) as revenue
      FROM Ticket t
      WHERE t.Purchase_Date BETWEEN ? AND ?
        ${exhibits && exhibits.length > 0 ? `AND t.Exhibit_ID IN (${exhibits})` : ''}
      GROUP BY t.Ticket_Type
      ORDER BY count DESC
    `,
   
    exhibitPopularity: `
      SELECT
        e.Name as name,
        COUNT(t.ID) as tickets,
        COALESCE(SUM(t.Price), 0) as revenue
      FROM Exhibit e
      LEFT JOIN Ticket t ON e.ID = t.Exhibit_ID AND t.Purchase_Date BETWEEN ? AND ?
      WHERE e.is_deleted = 0
        ${exhibitFilter}
      GROUP BY e.ID, e.Name
      ORDER BY tickets DESC
    `
  };
const TicketReport = () => {
  const [reportData, setReportData] = useState({
    ticketTypes: [],
    exhibitPopularity: [],
    totalRevenue: 0,
    totalTickets: 0
  });
  const [loading, setLoading] = useState(true);
  // Set default dates to current month
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [exhibits, setExhibits] = useState([]);
  const [selectedExhibits, setSelectedExhibits] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (startDate && endDate) {
      const queryParams = new URLSearchParams({
        startDate,
        endDate,
        exhibits: selectedExhibits.join(',')
      });
  
      console.log('Selected exhibits:', selectedExhibits);
      console.log('Query parameters:', queryParams.toString());
      
      const url = `https://coogzootestbackend-phi.vercel.app/ticket-report?${queryParams}`;
      console.log('Fetching from URL:', url);
  
      fetch(url)
        .then(response => {
          console.log('Response status:', response.status);
          return response.json();
        })
        .then(data => {
          console.log('Received data:', data);
          if (!data) {
            throw new Error('No data received');
          }
          setReportData(data);
          setLoading(false);
        })
        .catch(error => {
          console.error('Fetch error:', error);
          setError(error.message);
          setLoading(false);
        });
    }
  }, [startDate, endDate, selectedExhibits]);
  
  useEffect(() => {
    const fetchExhibits = async () => {
      try {
        const response = await fetch('https://coogzootestbackend-phi.vercel.app/exhibits');
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

  useEffect(() => {
    if (startDate && endDate) {
      console.log('Fetching report data with dates:', { startDate, endDate, selectedExhibits });
      fetchReportData();
    }
  }, [startDate, endDate, selectedExhibits]);

  const fetchExhibits = async () => {
    try {
      const response = await fetch('https://coogzootestbackend-phi.vercel.app/exhibits');
      if (response.ok) {
        const data = await response.json();
        console.log('Fetched exhibits:', data);
        setExhibits(data);
      } else {
        throw new Error('Failed to fetch exhibits');
      }
    } catch (error) {
      setError('Failed to fetch exhibits');
      console.error('Error fetching exhibits:', error);
    }
  };

  const fetchReportData = async () => {
    setLoading(true);
    setError('');
    
    try {
      const queryParams = new URLSearchParams({
        startDate,
        endDate,
        exhibits: selectedExhibits.join(',')
      });

      console.log('Fetching from URL:', `https://coogzootestbackend-phi.vercel.app/ticket-report?${queryParams}`);
      
      const response = await fetch(`https://coogzootestbackend-phi.vercel.app/ticket-report?${queryParams}`);
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch report data');
      }

      const data = await response.json();
      console.log('Received report data:', data);
      
      if (!data) {
        throw new Error('No data received from server');
      }

      setReportData(data);
    } catch (error) {
      setError(`Error: ${error.message}`);
      console.error('Error fetching report data:', error);
    } finally {
      setLoading(false);
    }
  };

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

  // Early return for loading state with date inputs still visible
  if (loading) {
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
        </div>
        <div className="loading-message">Loading report data...</div>
      </div>
    );
  }

  // Early return for error state with date inputs still visible
  if (error) {
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
        </div>
        <div className="error-message">{error}</div>
      </div>
    );
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
                key={exhibit.id}  // Changed from ID to id
                onClick={() => toggleExhibit(exhibit.id)}  // Changed from ID to id
                className={`exhibit-button ${selectedExhibits.includes(exhibit.id) ? 'selected' : ''}`}  // Changed from ID to id
              >
                {exhibit.name}  // Changed from Name to name if necessary
              </button>
            ))}
          </div>
        </div>
      </div>

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
          <p>{formatCurrency(reportData.totalRevenue / reportData.totalTickets)}</p>
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
    </div>
  );
};

export default TicketReport;