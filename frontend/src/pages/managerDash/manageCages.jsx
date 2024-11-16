import React, { useState, useEffect } from 'react';
import './manageCages.css';

function ManageCages({ cageData, setCageData, addCage, cageId, setCageId, showSidebar }) {
  const [cages, setCages] = useState([]);
  const [exhibits, setExhibits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [updateData, setUpdateData] = useState({}); // State for storing update form data
  const [showUpdateForm, setShowUpdateForm] = useState(false); // Toggle for showing update form
  const [modalMessage, setModalMessage] = useState(''); // Modal message for feedback

  // fetch cage information from the database
  useEffect(() => {
    const fetchCages = async () => {
      try {
        const response = await fetch('http://localhost:5000/cages');
        if (!response.ok) {
          throw new Error('Failed to fetch cages');
        }
        const data = await response.json();
        setCages(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchCages();
  }, []);

  // fetch exhibit information from the database
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

  const handleEditClick = (cage) => {
    setUpdateData(cage);
    setShowUpdateForm(true);
  };

  const updateCage = async () => {
    const validationError = validateCageData(updateData);
    if (validationError) {
      setModalMessage(validationError);
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/update-cage?id=${updateData.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      });
      const data = await response.json();
      if (response.ok) {
        setModalMessage('Cage updated successfully.');
        setCages(cages.map((cage) => (cage.id === updateData.id ? { ...cage, ...updateData } : cage)));
        setShowUpdateForm(false); // Close the update modal on success
      } else {
        setModalMessage(data.message || 'Error updating cage.');
      }
    } catch (error) {
      console.error('Error:', error);
      setModalMessage('An error occurred while attempting to update the cage.');
    }
  };

  const handleDeleteCage = async () => {
    // Convert cageId to number and validate
    const id = parseInt(cageId);
    
    // Basic validation
    if (!cageId || isNaN(id)) {
      setModalMessage('Please enter a valid cage ID');
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/remove-cage?id=${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      
      if (response.ok) {
        // Successfully deleted
        setModalMessage(data.message);
        // Update local state to remove the cage
        setCages(prevCages => prevCages.filter(cage => cage.id !== id));
        // Clear input
        setCageId('');
        
        // Optional: Refresh the cage list from server
        const refreshResponse = await fetch('http://localhost:5000/cages');
        if (refreshResponse.ok) {
          const refreshedCages = await refreshResponse.json();
          setCages(refreshedCages);
        }
      } else {
        // Server returned an error
        setModalMessage(data.message || 'Error removing cage');
      }
    } catch (error) {
      console.error('Error:', error);
      setModalMessage('An error occurred while attempting to remove the cage');
    }
  };

// shared validation function for both entry and update forms
  const validateCageData = (data) => {
    if (!data.size || !data.type || !data.exhibitID ) {
      return "Please fill out all required fields.";
    }
    return null;
  };

  // filter cages based on the search query
  const filteredCages = cages.filter((cage) =>
    cage.size.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cage.type.toLowerCase().includes(searchQuery.toLowerCase())
  );  

  // close modal
  const closeModal = () => setModalMessage('');

  // validate and add cage
  const validateAndAddCage = () => {
    const validationError = validateCageData(cageData);
    if (validationError) {
      setModalMessage(validationError);
      return;
    }
    addCage(); // Call your function to add the cage.
  };

  return (
    <div className={`manage-cages-container ${showSidebar ? '' : 'sidebar-collapsed'}`}>
      <div className="form-sections-wrapper">
        {/* cage entry form */}
        <div className="manage-cages">
            <h2>Cage Entry Form</h2>
            <select
                value={cageData.size || ""}
                onChange={(e) => setCageData({ ...cageData, size: e.target.value })}
                required
            >
                <option value="">Select Size</option>
                <option value="small">Small</option>
                <option value="medium">Medium</option>
                <option value="large">Large</option>
            </select>
            <select
                value={cageData.type || ""}
                onChange={(e) => setCageData({ ...cageData, type: e.target.value })}
                required
            >
                <option value="">Select Type</option>
                <option value="Mammal">Mammal</option>
                <option value="Fish">Fish</option>
                <option value="Amphibian">Amphibian</option>
                <option value="Reptile">Reptile</option>
                <option value="Invertebrate">Invertebrate</option>
                <option value="Bird">Bird</option>
            </select>
            <label>
                <input
                    type="checkbox"
                    checked={cageData.inUse || ""}
                    onChange={(e) => setCageData({ ...cageData, inUse: e.target.checked })}
                />
                In use?
            </label>

            <label>Assign to Exhibit</label>
            <select
                value={cageData.exhibitID || ""}
                onChange={(e) => setCageData({...cageData, exhibitID: e.target.value })}
                required
            >
                <option value="">Select Exhibit</option>
                {exhibits.map((exhibit) => (
                    <option key={exhibit.id} value={exhibit.id}>
                        {exhibit.name}
                    </option>
                ))}
            </select>

            <button onClick={validateAndAddCage}>Add Cage</button>
        </div>
      </div>
      {/*update cage modal*/}
       {showUpdateForm && (
        <div className="modal">
            <div className="modal-content">
                <div className="modal-header">
                    <button className="close-button" onClick={() => setShowUpdateForm(false)}></button>
                    <h2>Edit Cage</h2>
                    {/* form fields pre-filled with updateData */}
                    <label>Size</label>
                    <select
                        value={updateData.size}
                        onChange={(e) => setUpdateData({ ...updateData, size: e.target.value })}
                    >
                        <option value="">Select Size</option>
                        <option value="small">Small</option>
                        <option value="medium">Medium</option>
                        <option value="large">Large</option>
                    </select>

                    <label>Type</label>
                    <select
                        value={updateData.type}
                        onChange={(e) => setUpdateData({ ...updateData, type: e.target.value})}
                    >
                        <option value="">Select Type</option>
                        <option value="Mammal">Mammal</option>
                        <option value="Fish">Fish</option>
                        <option value="Amphibian">Amphibian</option>
                        <option value="Reptile">Reptile</option>
                        <option value="Invertebrate">Invertebrate</option>
                        <option value="Bird">Bird</option>
                    </select>

                    <label>
                        <input
                            type="checkbox"
                            checked={updateData.inUse}
                            onChange={(e) => setUpdateData({ ...updateData, inUse: !!e.target.checked })}
                        />
                        In use?
                    </label>

                    <label>Assign to Exhibit</label>
                    <select
                        value={updateData.exhibitID}
                        onChange={(e) => setUpdateData({...updateData, exhibitID: e.target.value })}
                    >
                        <option value="">Select Exhibit</option>
                        {exhibits.map((exhibit) => (
                            <option key={exhibit.id} value={exhibit.id}>
                                {exhibit.name}
                            </option>
                        ))}
                    </select>
                    <button onClick={updateCage}>Save Changes</button>
                </div>
            </div>
        </div>
      )}
      {/*Display Cage Information */}
      <div className="cage-list">
        <h2>Cage Records</h2>
        <input
            type="text"
            placeholder="Search cages..."
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
                <table className="cage-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Size</th>
                            <th>Type</th>
                            <th>In Use?</th>
                            <th>Assigned Exhibit</th>
                            <th>Edit</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredCages.map((cage) => (
                            <tr key={cage.id}>
                                <td>{cage.id}</td>
                                <td>{cage.size}</td>
                                <td>{cage.type}</td>
                                <td>{cage.inUse ? "Yes" : "No"}</td>
                                <td>{cage.exhibitID}</td>
                                <td><button onClick={() => handleEditClick(cage)}>Edit</button></td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* remove cage section */}
                <div className="remove-cage-section">
                  <h2>Remove Cage</h2>
                  <div className="input-group">
                    <input
                      type="number"
                      placeholder="Enter Cage ID"
                      value={cageId}
                      onChange={(e) => setCageId(e.target.value)}
                      min="1"
                      className="cage-id-input"
                    />
                    <button 
                      onClick={handleDeleteCage}
                      className="remove-button"
                    >
                      Remove Cage
                    </button>
                  </div>
                  {cages.length > 0 && (
                    <div className="available-cages">
                      <strong>Available Cage IDs:</strong> {cages.map(cage => cage.id).join(', ')}
                    </div>
                  )}
                </div>
            </>
        )}
      </div>
      {/* Modal with improved visibility */}
      {modalMessage && (
        <div className="modal">
          <div className="modal-content">
            <h3>Status</h3>
            <p>{modalMessage}</p>
            <button onClick={() => {
              setModalMessage('');
              // Optionally refresh the page or data after closing modal
            }}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ManageCages;