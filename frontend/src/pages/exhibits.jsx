import React, { useState, useEffect } from 'react';
import './exhibits.css';

const Exhibits = () => {
  const [exhibits, setExhibits] = useState([]);
  const [error, setError] = useState(null);
  const [latestExhibit, setLatestExhibit] = useState(null);
  const [showBanner, setShowBanner] = useState(true);

  useEffect(() => {
    const fetchExhibits = async () => {
      try {
        const response = await fetch(`http://localhost:5000/public-exhibits`);
        if (!response.ok) throw new Error('Failed to fetch exhibits');
        const data = await response.json();
        const sortedExhibits = [...data].sort((a, b) => b.id - a.id);
        const newest = sortedExhibits.find(exhibit => exhibit.is_new);
       
        setExhibits(data);
        setLatestExhibit(newest);
      } catch (err) {
        setError(err.message);
      }
    };
    fetchExhibits();
  }, []);

  if (error) return <div>Error: {error}</div>;

  return (
    <div className="exhibits-container">
      {/* Latest Exhibit Banner */}
      {latestExhibit && showBanner && (
        <div className="latest-exhibit-banner">
          <div className="banner-content">
            <div className="new-badge">New!</div>
            <h3>{latestExhibit.name}</h3>
            <p>{latestExhibit.location}</p>
            <button 
              className="close-banner"
              onClick={() => setShowBanner(false)}
              aria-label="Close banner"
            >
              ×
            </button>
          </div>
        </div>
      )}
      <h1>Exhibits List</h1>
      <div className="exhibits-list">
        {exhibits.map((exhibit) => (
          <div className={`exhibit-card ${exhibit.is_new ? 'new-exhibit' : ''}`} key={exhibit.id}>
            {exhibit.imageLink && (
              <img src={exhibit.imageLink} alt={exhibit.name} className="exhibit-image" />
            )}
            <h4>{exhibit.name}</h4>
            <p><strong>Location:</strong> {exhibit.location}</p>
            <p><strong>Type:</strong> {exhibit.type}</p>
            <p><strong>Hours:</strong> {exhibit.hours}</p>
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