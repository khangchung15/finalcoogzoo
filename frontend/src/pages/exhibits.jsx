import React, { useState, useEffect } from 'react';
import './exhibits.css';

const Exhibits = () => {
  const [exhibits, setExhibits] = useState([]);
  const [error, setError] = useState(null);
  const [latestExhibit, setLatestExhibit] = useState(null);

  useEffect(() => {
    const fetchExhibits = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/exhibits`);
        if (!response.ok) throw new Error('Failed to fetch exhibits');
        const data = await response.json();
        
        // Sort exhibits by ID to find the latest one
        const sortedExhibits = [...data].sort((a, b) => b.ID - a.ID);
        const newest = sortedExhibits.find(exhibit => exhibit.is_new);
        
        setExhibits(data);
        setLatestExhibit(newest);
      } catch (err) {
        setError(err.message);
      }
    };

    fetchExhibits();
    // Fetch every 5 minutes
    const interval = setInterval(fetchExhibits, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  if (error) return <div>Error: {error}</div>;

  return (
    <div className="exhibits-container">
      {/* Latest Exhibit Banner */}
      {latestExhibit && (
        <div className="latest-exhibit-banner">
          <div className="banner-content">
            <div className="new-badge">New!</div>
            <h3>{latestExhibit.Name}</h3>
            <p>{latestExhibit.Location}</p>
          </div>
        </div>
      )}

      <h1>Exhibits List</h1>
      <div className="exhibits-list">
        {exhibits.map((exhibit) => (
          <div 
            className={`exhibit-card ${exhibit.is_new ? 'new-exhibit' : ''}`} 
            key={exhibit.ID}
          >
            {exhibit.Image_Link && (
              <img src={exhibit.Image_Link} alt={exhibit.Name} className="exhibit-image" />
            )}
            <h4>{exhibit.Name}</h4>
            <p><strong>Location:</strong> {exhibit.Location}</p>
            <p><strong>Type:</strong> {exhibit.Type}</p>
            <p><strong>Hours:</strong> {exhibit.Hours}</p>
            {exhibit.is_closed ? (
              <>
                <p style={{ color: 'red' }}><strong>Closed:</strong> {exhibit.closure_reason}</p>
                {exhibit.closure_start && exhibit.closure_end && (
                  <p>
                    <strong>Closed from:</strong>{' '}
                    {new Date(exhibit.closure_start).toLocaleDateString()} to{' '}
                    {new Date(exhibit.closure_end).toLocaleDateString()}
                  </p>
                )}
              </>
            ) : (
              <p style={{ color: 'green' }}><strong>Status:</strong> Open</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Exhibits;