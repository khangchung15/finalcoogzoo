import React, { useState, useEffect } from 'react';
import './manageAnimals.css';

function ManageAnimals({ animalData, setAnimalData, addAnimal, animalId, setAnimalId,showSidebar }) {
    const [animals, setAnimals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [updateData, setUpdateData] = useState({}); // state for storing update form data
    const [showUpdateForm, setShowUpdateForm] = useState(false); // toggle for showing update form
    const [modalMessage, setModalMessage] = useState(''); // modal message for feedback

  // fetch animal information from the database
  useEffect(() => {
    const fetchManageAnimals = async () => {
      try {
        const response = await fetch('http://localhost:5000/animals');
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
    fetchManageAnimals();
  }, []);

  const handleEditClick = (animal) => {
    setUpdateData(animal);
    setShowUpdateForm(true);
    console.log("Editing animal:", animal); // check if data is correct
    console.log("Show Update Form:", showUpdateForm);
  };

  const updateAnimal = async () => {
    const validationError = validateAnimalData(updateData);
    if (validationError) {
      setModalMessage(validationError);
      return;
    }
    try {
      const response = await fetch(`http://localhost:5000/update-animal?id=${updateData.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      });
      const data = await response.json();
      if (response.ok) {
        setModalMessage('Animal updated successfully.');
        setAnimals(animals.map((ani) => (ani.id === updateData.id ? { ...ani, ...updateData } : ani)));
        setShowUpdateForm(false); // close modal on success
      } else {
        setModalMessage(data.message || 'Error updating animal.');
      }
    } catch (error) {
      console.error('Error:', error);
      setModalMessage('An error occurred while attempting to update the animal.');
    }
  };

  const handleDeleteAnimal = async () => {
    try {
      const response = await fetch(`http://localhost:5000/remove-animal?id=${animalId}`, {
        method: 'DELETE',
      });
  
      const data = await response.json();
      if (response.ok) {
        setModalMessage('Animal soft-deleted successfully.');
        setAnimals(animals.filter(ani => ani.id !== parseInt(animalId, 10)));
      } else {
        setModalMessage(data.message || 'Error deleting animal.');
      }
    } catch (error) {
      console.error('Error:', error);
      setModalMessage('An error occurred while attempting to delete the animal.');
    }
  };

  // shared validation function for both entry and update forms
  const validateAnimalData = (data) => {
    if (!data.name || !data.scientificName || !data.species || !data.birthDate || !data.height|| !data.weight || !data.status || !data.cageID || !data.exhibitID) {
      return "Please fill out all required fields.";
    }

    if (data.status === 'inactive' && !data.statusReason) {
        return "Please provide a reason for inactive status.";
    }
    return null;
  };

  const filteredAnimals = animals.filter((animal) =>
    animal.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    animal.species.toLowerCase().includes(searchQuery.toLowerCase()) ||
    animal.status.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // close modal
  const closeModal = () => setModalMessage('');

  // validate and add animal
  const validateAndAddAnimal = () => {
    const validationError = validateAnimalData(animalData);
    if (validationError) {
      setModalMessage(validationError);
      return;
    }
    addAnimal(); // call your function to add the animal.
  };

  return (
    <div className={`manage-animals-container ${showSidebar ? '' : 'sidebar-collapsed'}`}>
      <div className="form-sections-wrapper">
        {/* Exhibit Entry Form */}
        <div className="manage-animals">
          <h2>Animal Entry Form</h2>
          <input
            type="text"
            placeholder="Name (required)"
            value={animalData.name}
            onChange={(e) => setAnimalData({ ...animalData, name: e.target.value })}
            required
          />
          <input
            type="text"
            placeholder="Scientific Name (required)"
            value={animalData.scientificName}
            onChange={(e) => setAnimalData({ ...animalData, scientificName: e.target.value })}
            required
          />
          <input
            type="text"
            placeholder="Species (required)"
            value={animalData.species}
            onChange={(e) => setAnimalData({ ...animalData, species: e.target.value })}
            required
          />
          <input
            type="date"
            placeholder="Birth Date (required)"
            value={animalData.birthDate}
            onChange={(e) => setAnimalData({ ...animalData, birthDate: e.target.value })}
            required
          />
          <input
            type="number"
            placeholder="Height in meters (required)"
            value={animalData.height}
            onChange={(e) => setAnimalData({ ...animalData, height: e.target.value })}
            required
          />
          <input
            type="number"
            placeholder="Weight in kg (required)"
            value={animalData.weight}
            onChange={(e) => setAnimalData({ ...animalData, weight: e.target.value })}
            required
          />
          <select
            value={animalData.status}
            onChange={(e) => setAnimalData({ ...animalData, status: e.target.value })}
            required
          >
            <option value="">Select Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          {animalData.status === "inactive" && (
            <>
              <input
                type="text"
                placeholder="Reason for Inactive Status (required)"
                value={animalData.statusReason}
                onChange={(e) => setAnimalData({ ...animalData, statusReason: e.target.value })}
                required
              />
            </>
          )}
          <input
            type="number"
            placeholder="Cage ID (required)"
            value={animalData.cageID}
            onChange={(e) => setAnimalData({ ...animalData, cageID: e.target.value })}
            required
          />
          <input
            type="number"
            placeholder="Exhibit ID (required)"
            value={animalData.exhibitID}
            onChange={(e) => setAnimalData({ ...animalData, exhibitID: e.target.value })}
            required
          />
          <button onClick={validateAndAddAnimal}>Add Animal</button>
        </div>
      </div>  
      
      {/* display animal information */}
      <div className="animal-list">
        <h2>Animal List</h2>
        <input
          type="text"
          placeholder="Search Animals..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-input"
        />
        {loading ? (
          <p>Loading...</p>
        ) : error ? (
          <p className="error">{error}</p>
        ) : (
          <>
            <table className="animal-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Scientific Name</th>
                  <th>Species</th>
                  <th>Birth Date</th>
                  <th>Height in Meters</th>
                  <th>Weight in KGs</th>
                  <th>Status</th>
                  <th>Status Reason</th>
                  <th>Cage ID</th>
                  <th>Exhibit ID</th>
                  <th>Edit</th>
                </tr>
              </thead>
              <tbody>
                {filteredAnimals.map((animal) => (
                  <tr key={animal.id}>
                    <td>{animal.id}</td>
                    <td>{animal.name}</td>
                    <td>{animal.scientificName}</td>
                    <td>{animal.species}</td>
                    <td>{animal.birthDate}</td>
                    <td>{animal.height}</td>
                    <td>{animal.weight}</td>
                    <td>{animal.status}</td>
                    <td>{animal.statusReason || "N/A"}</td>
                    <td>{animal.cageID}</td>
                    <td>{animal.exhibitID}</td>
                    <td><button onClick={() => handleEditClick(animal)}>Edit</button></td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Remove Animal Section */}
            <div className="remove-animal-section">
              <h2>Remove Animal</h2>
              <input
                type="number"
                placeholder="Animal ID (required)"
                value={animalId}
                onChange={(e) => setAnimalId(e.target.value)}
                required
              />
              <button onClick={handleDeleteAnimal}>Remove Animal</button>
            </div>
          </>
        )}
      </div>
        
      {/* Update Animal Form */}
      {showUpdateForm && (
        <div className="modal">
          <div className="modal-content">
            <button className="close-button" onClick={() => setShowUpdateForm(false)}></button>
            <h2>Edit Animal</h2>
            <input
              type="text"
              placeholder="Name"
              value={updateData.name}
              onChange={(e) => setUpdateData({ ...updateData, name: e.target.value })}
              required
            />
            <input
              type="text"
              placeholder="Scientific Name"
              value={updateData.scientificName}
              onChange={(e) => setUpdateData({ ...updateData, scientificName: e.target.value })}
              required
            />
            <input
              type="text"
              placeholder="Species"
              value={updateData.species}
              onChange={(e) => setUpdateData({ ...updateData, species: e.target.value })}
              required
            />
            <input
              type="date"
              placeholder="Birth Date"
              value={updateData.birthDate}
              onChange={(e) => setUpdateData({ ...updateData, birthDate: e.target.value })}
              required
            />
            <input
              type="number"
              placeholder="Height in meters"
              value={updateData.height}
              onChange={(e) => setUpdateData({ ...updateData, height: e.target.value })}
              required
            />
            <input
              type="number"
              placeholder="Weight in kg"
              value={updateData.weight}
              onChange={(e) => setUpdateData({ ...updateData, weight: e.target.value })}
              required
            />
            <select
              value={updateData.status}
              onChange={(e) => setUpdateData({ 
                ...updateData, 
                status: e.target.value,
                statusReason: e.target.value === 'active' ? '' : updateData.statusReason 
              })}
              required
            >
              <option value="">Select Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            {updateData.status === "inactive" && (
              <>
                <input
                  type="text"
                  className="status-reason-input"
                  placeholder="Reason for Inactive Status"
                  value={updateData.statusReason || ''}
                  onChange={(e) => setUpdateData({ ...updateData, statusReason: e.target.value })}
                  required
                />
              </>
            )}
            <input
              type="number"
              placeholder="Cage ID"
              value={updateData.cageID}
              onChange={(e) => setUpdateData({ ...updateData, cageID: e.target.value })}
              required
            />
            <input
              type="number"
              placeholder="Exhibit ID"
              value={updateData.exhibitID}
              onChange={(e) => setUpdateData({ ...updateData, exhibitID: e.target.value })}
              required
            />
            <button onClick={updateAnimal}>Save Changes</button>
          </div>
        </div>
      )}

      {/* Modal for feedback */}
      {modalMessage && (
        <div className="modal">
          <div className="modal-content">
            <p>{modalMessage}</p>
            <button onClick={closeModal}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ManageAnimals;