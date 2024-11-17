import React, { useState, useEffect } from 'react';
import './manageCages.css';

function ManageCages({ cageData, setCageData, addCage, cageId, setCageId }) {
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
        const response = await fetch('https://coogzootestbackend-phi.vercel.app/cages');
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
      const response = await fetch(`https://coogzootestbackend-phi.vercel.app/update-cage?id=${updateData.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      });
      const data = await response.json();
      if (response.ok) {
        setModalMessage('Cage updated successfully.');
        setCages(cages.map((cag) => (cag.id === updateData.id ? { ...cag, ...updateData } : cag)));
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
    try {
      const response = await fetch(`https://coogzootestbackend-phi.vercel.app/remove-cage?id=${cageId}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      if (response.ok) {
        setModalMessage('Cage soft-deleted successfully.');
        setCages(cages.filter(cag => cag.id != parseInt(cageId, 10)));
      } else {
        setModalMessage(data.message || 'Error deleting cage.');
      }
    } catch (error) {
      console.error('Error:', error);
      setModalMessage('An error occurred while attempting to delete the cage.');
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
    <div className={`manage-cages-container`}>
      <div className="form-sections-wrapper">
        {/* Cage Entry Form */}
        <div className="manage-cages">
            <h2>Cage Entry Form</h2>
            <select
                value={cageData.size}
                onChange={(e) => setCageData({ ...cageData, size: e.target.value })}
                required
            >
                <option value="">Select Size</option>
                <option value="small">Small</option>
                <option value="medium">Medium</option>
                <option value="large">Large</option>
            </select>
            <select
                value={cageData.type}
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
                    checked={cageData.inUse}
                    onChange={(e) => setCageData({ ...cageData, inUse: e.target.checked })}
                />
                In use?
            </label>
            <label>Assign to Exhibit</label>
            <select
                value={cageData.exhibitID}
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
                            <th>Exhibit</th>
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
                  <input
                    type="number"
                    placeholder="Cage ID (required)"
                    value={cageId}
                    onChange={(e) => setCageId(e.target.value)}
                    required
                  />
                  <button onClick={handleDeleteCage}>Remove Cage</button>
                </div>
            </>
        )}
      </div>

      {/*update cage modal*/}
       {showUpdateForm && (
        <div className="modal">
            <div className="modal-content">
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
      )}

      {/* Modal with improved visibility */}
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

export default ManageCages;