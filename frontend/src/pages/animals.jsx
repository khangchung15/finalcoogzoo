import React, { useState, useEffect } from 'react';
import './animals.css'; // Import your CSS file

const Animal = () => {
  const [animals, setAnimals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [exhibits, setExhibits] = useState([]); // State for holding available exhibits
  const [selectedExhibit, setSelectedExhibit] = useState(''); // State for selected exhibit

  useEffect(() => {
    // Fetch animals and exhibits when component mounts
    const fetchAnimalsAndExhibits = async () => {
      try {
        const animalResponse = await fetch('https://coogzootestbackend.vercel.app/animals');
        if (!animalResponse.ok) {
          throw new Error('Failed to fetch animals');
        }
        const animalData = await animalResponse.json();
        console.log(animalData);

        // Sort animals alphabetically by name
        const sortedAnimals = animalData.sort((a, b) => a.Name.localeCompare(b.Name));
        setAnimals(sortedAnimals);

        // Get the unique exhibit names from the sorted animal data
        const uniqueExhibits = Array.from(new Set(sortedAnimals.map(animal => animal.Location)));
        setExhibits(uniqueExhibits);

      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAnimalsAndExhibits();
  }, []);

  // Handle exhibit filter change
  const handleExhibitChange = (event) => {
    setSelectedExhibit(event.target.value);
  };

  // Filter animals by selected exhibit
  const filteredAnimals = selectedExhibit
    ? animals.filter(animal => animal.Location === selectedExhibit)
    : animals;

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="animals-container">
      <h1>Browse through our pages of animals to see who you can visit!</h1>

      {/* Dropdown for selecting an exhibit */}
      <div className="exhibit-filter">
        <label htmlFor="exhibit">filter by exhibit: </label>
        <select id="exhibit" onChange={handleExhibitChange}>
          <option value="">All Exhibits</option>
          {exhibits.map(exhibitName => (
            <option key={exhibitName} value={exhibitName}>
              {exhibitName}
            </option>
          ))}
        </select>
      </div>

      <div className="animals-list">
        {filteredAnimals.length > 0 ? (
          filteredAnimals.map((animal) => (
            <div className="animal-card" key={animal.ID}>
              <img src={animal.Image_Link} alt={animal.Name} className="animal-image" />
              <h4>{animal.Name}</h4>
              <p><strong>Scientific Name:</strong> {animal.Scientific_Name}</p>
              <p><strong>Habitat:</strong> {animal.Habitat}</p>
              { /*<p><strong>Species:</strong> {animal.Species}</p>*/ }
              <p><strong>Fun Fact:</strong> {animal.Fun_Fact}</p>
            </div>
          ))
        ) : (
          <div>No animals found for the selected exhibit.</div>
        )}
      </div>
    </div>
  );
};

export default Animal;