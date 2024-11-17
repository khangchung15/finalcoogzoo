import React, { useState, useEffect } from 'react';
import './animals.css';

const Animal = () => {
  const [animals, setAnimals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [exhibits, setExhibits] = useState([]);
  const [selectedExhibit, setSelectedExhibit] = useState('');

  useEffect(() => {
    const fetchShowcase = async () => {
      try {
        const response = await fetch('https://coogzootestbackend-phi.vercel.app/showcases');
        if (!response.ok) {
          throw new Error('Failed to fetch animals');
        }
        const data = await response.json();
        
        // Sort animals alphabetically by name
        const sortedAnimals = data.sort((a, b) => 
          a.name.localeCompare(b.name)
        );
        setAnimals(sortedAnimals);

        // Get unique exhibit locations
        const uniqueExhibits = Array.from(
          new Set(sortedAnimals.map(animal => animal.location))
        ).filter(Boolean); // Remove any null/undefined values
        
        setExhibits(uniqueExhibits);
      } catch (err) {
        console.error('Error fetching animals:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchShowcase();
  }, []);

  const handleExhibitChange = (event) => {
    setSelectedExhibit(event.target.value);
  };

  // Filter animals by selected exhibit
  const filteredAnimals = selectedExhibit
    ? animals.filter(animal => animal.location === selectedExhibit)
    : animals;

  if (loading) {
    return (
      <div className="loading-container">
        <p>Loading animals...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <p>Error: {error}</p>
        <p>Please try refreshing the page or contact support if the problem persists.</p>
      </div>
    );
  }

  return (
    <div className="animals-container">
      <h1 className="text-3xl font-bold mb-6">
        Browse through our pages of animals to see who you can visit!
      </h1>

      <div className="exhibit-filter mb-6">
        <label htmlFor="exhibit" className="mr-2">
          Filter by exhibit:
        </label>
        <select 
          id="exhibit" 
          onChange={handleExhibitChange}
          className="p-2 border rounded"
        >
          <option value="">All Exhibits</option>
          {exhibits.map(exhibitName => (
            <option key={exhibitName} value={exhibitName}>
              {exhibitName}
            </option>
          ))}
        </select>
      </div>

      <div className="animals-list grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAnimals.length > 0 ? (
          filteredAnimals.map((animal) => (
            <div 
              key={animal.id} 
              className="animal-card bg-white rounded-lg shadow-md overflow-hidden"
            >
              {animal.imageLink && (
                <img 
                  src={animal.imageLink} 
                  alt={animal.name} 
                  className="w-full h-48 object-cover"
                />
              )}
              <div className="p-4">
                <h4 className="text-xl font-semibold mb-2">{animal.name}</h4>
                <p className="mb-1">
                  <strong>Scientific Name:</strong> {animal.scientificName}
                </p>
                <p className="mb-1">
                  <strong>Habitat:</strong> {animal.habitat}
                </p>
                <p className="mb-1">
                  <strong>Fun Fact:</strong> {animal.funFact}
                </p>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-8">
            No animals found for the selected exhibit.
          </div>
        )}
      </div>
    </div>
  );
};

export default Animal;