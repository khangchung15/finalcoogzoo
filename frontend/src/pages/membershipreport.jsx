import React, { useState, useEffect } from 'react';
import './membershipreport.css';

const MembershipReport = () => {
  const [reportData, setReportData] = useState({
    membershipTypes: [],
    memberActivity: [],
    exhibitPopularity: [],
    demographics: [],
    totalRevenue: 0,
    totalMembers: 0,
    activeMembers: 0,
    expiringMembers: 0
  });
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [error, setError] = useState('');

  const membershipTypes = ['basic', 'vip', 'premium'];

  useEffect(() => {
    if (startDate && endDate) {
      fetchReportData();
    }
  }, [startDate, endDate, selectedTypes]);

  const fetchReportData = async () => {
    setLoading(true);
    setError('');
    
    try {
      const queryParams = new URLSearchParams({
        startDate,
        endDate,
        types: selectedTypes.join(',')
      });
      
      const response = await fetch(`http://localhost:5000/membership-report?${queryParams}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch report data');
      }

      const data = await response.json();
      setReportData(data);
    } catch (error) {
      setError(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const toggleMembershipType = (type) => {
    setSelectedTypes(prev => 
      prev.includes(type)
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };

  const formatCurrency = (amount) => {
    const num = Number(amount) || 0;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(num);
  };

  const formatPercentage = (value) => {
    const num = Number(value) || 0;
    return `${num.toFixed(1)}%`;
  };

  if (loading) {
    return (
      <div className="membership-report-container">
        <h1>Membership Analysis Report</h1>
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

  if (error) {
    return (
      <div className="membership-report-container">
        <h1>Membership Analysis Report</h1>
        <div className="error-message">{error}</div>
      </div>
    );
  }

  return (
    <div className="membership-report-container">
      <h1>Membership Analysis Report</h1>
      
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

        <div className="type-filters">
          <h3>Filter by Membership Type:</h3>
          <div className="type-buttons">
            {membershipTypes.map((type) => (
              <button
                key={type}
                onClick={() => toggleMembershipType(type)}
                className={`type-button ${selectedTypes.includes(type) ? 'selected' : ''}`}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
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
          <h3>Total Members</h3>
          <p>{reportData.totalMembers}</p>
        </div>
        <div className="summary-card">
          <h3>Active Members</h3>
          <p>{reportData.activeMembers}</p>
        </div>
        <div className="summary-card">
          <h3>Expiring Soon</h3>
          <p>{reportData.expiringMembers}</p>
        </div>
      </div>

      <div className="report-details">
        <div className="membership-types">
          <h2>Membership Distribution</h2>
          <table>
            <thead>
              <tr>
                <th>Type</th>
                <th>Count</th>
                <th>Revenue</th>
                <th>% of Total</th>
              </tr>
            </thead>
            <tbody>
              {reportData.membershipTypes.map((type) => (
                <tr key={type.type}>
                  <td>{type.type}</td>
                  <td>{type.count}</td>
                  <td>{formatCurrency(type.revenue)}</td>
                  <td>{formatPercentage(type.percentage)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="member-activity">
          <h2>Member Activity</h2>
          <table>
            <thead>
              <tr>
                <th>Member Type</th>
                <th>Active Members</th>
                <th>Tickets Purchased</th>
                <th>Ticket Revenue</th>
              </tr>
            </thead>
            <tbody>
              {reportData.memberActivity.map((activity, index) => (
                <tr key={index}>
                  <td>{activity.Member_Type}</td>
                  <td>{activity.active_members}</td>
                  <td>{activity.tickets_purchased}</td>
                  <td>{formatCurrency(activity.ticket_revenue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="exhibit-popularity">
          <h2>Popular Exhibits by Member Type</h2>
          <table>
            <thead>
              <tr>
                <th>Member Type</th>
                <th>Exhibit</th>
                <th>Visit Count</th>
              </tr>
            </thead>
            <tbody>
              {reportData.exhibitPopularity.map((exhibit, index) => (
                <tr key={index}>
                  <td>{exhibit.Member_Type}</td>
                  <td>{exhibit.exhibit_name}</td>
                  <td>{exhibit.visit_count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="demographics">
          <h2>Member Demographics</h2>
          <table>
            <thead>
              <tr>
                <th>Member Type</th>
                <th>Avg Age</th>
                <th>Under 25</th>
                <th>25-40</th>
                <th>Over 40</th>
              </tr>
            </thead>
            <tbody>
              {reportData.demographics.map((demo, index) => (
                <tr key={index}>
                  <td>{demo.Member_Type}</td>
                  <td>{Math.round(demo.avg_age)}</td>
                  <td>{demo.under_25}</td>
                  <td>{demo.age_25_40}</td>
                  <td>{demo.over_40}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default MembershipReport;