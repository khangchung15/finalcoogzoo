import React, { useState, useEffect } from 'react';
import './exhibits.css';

const Exhibits = () => {
  const [exhibits, setExhibits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchExhibits = async () => {
      try {
        const response = await fetch('https://coogzootestbackend-phi.vercel.app/exhibits');
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
      <h1>Our Exhibits!</h1>
      <div className="exhibits-list">
        {exhibits.map((exhibit) => (
          // Changed from exhibit.ID to exhibit.id
          <div className="exhibit-card" key={exhibit.id}>
            {/* Changed property names to match backend data */}
            <img src={exhibit.imageLink} alt={exhibit.name} className="exhibit-image" />
            <h4>{exhibit.name}</h4>
            <p><strong>Location:</strong> {exhibit.location}</p>
            <p><strong>Description:</strong> {exhibit.description}</p>
            <p><strong>Type:</strong> {exhibit.type}</p>
            <p><strong>Hours:</strong> {exhibit.hours}</p>
            {exhibit.isClosed ? (
              <>
                <p style={{ color: 'red' }}><strong>Closed:</strong> {exhibit.closureReason}</p>
                <p><strong>Closed from:</strong> {' '}
                  {exhibit.closureStart && new Date(exhibit.closureStart).toLocaleDateString()} to{' '}
                  {exhibit.closureEnd && new Date(exhibit.closureEnd).toLocaleDateString()}
                </p>
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