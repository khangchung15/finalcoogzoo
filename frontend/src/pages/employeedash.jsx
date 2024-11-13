import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../components/AuthContext'; // Assuming AuthContext is already set up
import './employeedash.css';

function Employeedash() {
  const { userEmail } = useContext(AuthContext);
  const [animals, setAnimals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnimals = async () => {
      try {
        const response = await fetch(`http://localhost:5000/employee-animals?email=${userEmail}`);
        const data = await response.json();
        setAnimals(data);
      } catch (error) {
        console.error("Error fetching animal data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnimals();
  }, [userEmail]);

  return (
    <div className="employee-dashboard">
      <h1>Employee Dashboard</h1>
      <div className="animal-cards-container">
        {loading ? (
          <p>Loading...</p>
        ) : animals.length > 0 ? (
          //console.log(animals),
          animals.map((animal) => (
            <div key={animal.ID} className="animal-card">
              <h2>{animal.Name}</h2>
              <p><strong>Species:</strong> {animal.Species}</p>
              <p><strong>Cage ID:</strong> {animal.Cage_ID}</p>
              <p><strong>Location:</strong> {animal.Location}</p>
              <p><strong>Cage Type:</strong> {animal.Type}</p>
              <p><strong>Feeding Time:</strong> {animal.Feeding_Time}</p>
            </div>
          ))
        ) : (
          <p>No animals assigned to this exhibit.</p>
        )}
      </div>
    </div>
  );
}

export default Employeedash;