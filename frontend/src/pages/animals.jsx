import React, { useState, useEffect } from 'react';
import './animals.css'; // Import your CSS file

const Animal = () => {
  const [animals, setAnimals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAnimals = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/animals');
        if (!response.ok) {
          throw new Error('Failed to fetch animals');
        }
        const data = await response.json();
        setAnimals(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAnimals();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="animals-container">
      <h1>Animals List</h1>
      <div className="animals-list">
        {animals.map((animal) => (
          <div className="animal-card" key={animal.ID}>
            {/* Add an image tag for displaying animal images */}
            <img src={animal.Image_Link} alt={animal.Name} className="animal-image" />
            <h4>{animal.Name}</h4>
            <p><strong>Scientific Name:</strong> {animal.Scientific_Name}</p>
            <p><strong>Habitat:</strong> {animal.Habitat}</p>
            <p><strong>Species:</strong> {animal.Species}</p>
            <p><strong>Date of Birth:</strong> {new Date(animal.Date_Of_Birth).toLocaleDateString()}</p>
            <p><strong>Height:</strong> {animal.Height} m</p>
            <p><strong>Weight:</strong> {animal.Weight} kg</p>
            <p><strong>Fun Fact:</strong> {animal.Fun_Fact}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Animal;
