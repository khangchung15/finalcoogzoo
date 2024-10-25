import React, { useState, useEffect } from 'react';
import './exhibits.css'; // Import your CSS file

const Exhibits = () => {
  const [exhibits, setExhibits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchExhibits = async () => {
      try {
        const response = await fetch('http://localhost:5000/exhibits');
        if (!response.ok) {
          throw new Error('Failed to fetch exhibits');
        }
        const data = await response.json();
        setExhibits(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchExhibits();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="exhibits-container">
      <h1>Exhibits List</h1>
      <div className="exhibits-list">
        {exhibits.map((exhibit) => (
          <div className="exhibit-card" key={exhibit.ID}>
            <img src={exhibit.Image_Link} alt={exhibit.Name} className="exhibit-image" />
            <h4>{exhibit.Name}</h4>
            <p><strong>Location:</strong> {exhibit.Location}</p>
            <p><strong>Type:</strong> {exhibit.Type}</p>
            <p><strong>Hours:</strong> {exhibit.Hours}</p>
            {exhibit.is_closed ? (
              <>
                <p style={{ color: 'red' }}><strong>Closed:</strong> {exhibit.closure_reason}</p>
                <p><strong>Closed from:</strong> {new Date(exhibit.closure_start).toLocaleDateString()} to {new Date(exhibit.closure_end).toLocaleDateString()}</p>
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
