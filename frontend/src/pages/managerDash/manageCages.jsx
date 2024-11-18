import React, { useState, useEffect } from 'react';
import './manageCages.css';

function ManageCages({ cageData, setCageData, addCage, cageId, setCageId }) {
  const [cages, setCages] = useState([]);
  const [exhibits, setExhibits] = useState([]);
  const [loading, setLoading] = useState({ cages: true, exhibits: true });
  const [error, setError] = useState({ cages: null, exhibits: null });
  const [searchQuery, setSearchQuery] = useState('');
  const [updateData, setUpdateData] = useState({});
  const [showUpdateForm, setShowUpdateForm] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  
  // Custom fetch function with retry logic
  const fetchWithRetry = async (url, options = {}, retries = 3, delay = 1000) => {
    for (let i = 0; i < retries; i++) {
      try {
        const response = await fetch(url, options);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
      } catch (error) {
        if (i === retries - 1) throw error;
        await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
      }
    }
  };

  // Fetch cages with improved error handling
  useEffect(() => {
    const fetchCages = async () => {
      setLoading(prev => ({ ...prev, cages: true }));
      try {
        const data = await fetchWithRetry('https://coogzoobackend.vercel.app/cages');
        setCages(data);
        setError(prev => ({ ...prev, cages: null }));
      } catch (err) {
        console.error('Error fetching cages:', err);
        setError(prev => ({ ...prev, cages: 'Failed to fetch cages. Please try refreshing the page.' }));
      } finally {
        setLoading(prev => ({ ...prev, cages: false }));
      }
    };

    fetchCages();
  }, []);

  // Fetch exhibits with improved error handling
  useEffect(() => {
    const fetchExhibits = async () => {
      setLoading(prev => ({ ...prev, exhibits: true }));
      try {
        const data = await fetchWithRetry('https://coogzoobackend.vercel.app/exhibits');
        setExhibits(data);
        setError(prev => ({ ...prev, exhibits: null }));
      } catch (err) {
        console.error('Error fetching exhibits:', err);
        setError(prev => ({ ...prev, exhibits: 'Failed to fetch exhibits. Please try refreshing the page.' }));
      } finally {
        setLoading(prev => ({ ...prev, exhibits: false }));
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
      const response = await fetchWithRetry(
        `https://coogzoobackend.vercel.app/update-cage?id=${updateData.id}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updateData),
        }
      );

      setModalMessage('Cage updated successfully.');
      setCages(cages.map((cag) => (cag.id === updateData.id ? { ...cag, ...updateData } : cag)));
      setShowUpdateForm(false);
    } catch (error) {
      console.error('Error updating cage:', error);
      setModalMessage('Failed to update cage. Please try again.');
    }
  };

  const handleDeleteCage = async () => {
    try {
      await fetchWithRetry(
        `https://coogzoobackend.vercel.app/remove-cage?id=${cageId}`,
        { method: 'DELETE' }
      );

      setModalMessage('Cage removed successfully.');
      setCages(cages.filter(cag => cag.id !== parseInt(cageId, 10)));
    } catch (error) {
      console.error('Error deleting cage:', error);
      setModalMessage('Failed to remove cage. Please try again.');
    }
  };

  const validateCageData = (data) => {
    if (!data.size || !data.type || !data.exhibitID) {
      return "Please fill out all required fields.";
    }
    return null;
  };

  const filteredCages = cages.filter((cage) =>
    cage.size.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cage.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const closeModal = () => setModalMessage('');

  const validateAndAddCage = () => {
    const validationError = validateCageData(cageData);
    if (validationError) {
      setModalMessage(validationError);
      return;
    }
    addCage();
  };

  // Show loading state if either cages or exhibits are loading
  if (loading.cages || loading.exhibits) {
    return (
      <div className="loading-container">
        <p>Loading data...</p>
      </div>
    );
  }

  // Show error state if either fetch failed
  if (error.cages || error.exhibits) {
    return (
      <div className="error-container">
        <p>{error.cages || error.exhibits}</p>
        <button onClick={() => window.location.reload()}>Retry</button>
      </div>
    );
  }

  return (
    <div className="manage-cages-container">
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
            onChange={(e) => setCageData({ ...cageData, exhibitID: e.target.value })}
            required
          >
            <option value="">Select Exhibit</option>
            {exhibits.map((exhibit) => (
              <option key={exhibit.id} value={exhibit.id}>
                {exhibit.name}
              </option>
            ))}
          </select>

          <button 
            onClick={validateAndAddCage}
            className="submit-button"
          >
            Add Cage
          </button>
        </div>
      </div>

      {/* Display Cage Information */}
      <div className="cage-list">
        <h2>Cage Records</h2>
        <input
          type="text"
          placeholder="Search cages..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-input"
        />

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
                <td>
                  {exhibits.find(e => e.id === parseInt(cage.exhibitID))?.name || cage.exhibitID}
                </td>
                <td>
                  <button 
                    onClick={() => handleEditClick(cage)}
                    className="edit-button"
                  >
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Remove cage section */}
        <div className="remove-cage-section">
          <h2>Remove Cage</h2>
          <input
            type="number"
            placeholder="Cage ID (required)"
            value={cageId}
            onChange={(e) => setCageId(e.target.value)}
            required
          />
          <button 
            onClick={handleDeleteCage}
            className="delete-button"
          >
            Remove Cage
          </button>
        </div>
      </div>

      {/* Update cage modal */}
      {showUpdateForm && (
        <div className="modal">
          <div className="modal-content">
            <button 
              className="close-button"
              onClick={() => setShowUpdateForm(false)}
            >
              ×
            </button>
            <h2>Edit Cage</h2>
            
            <select
              value={updateData.size}
              onChange={(e) => setUpdateData({ ...updateData, size: e.target.value })}
            >
              <option value="">Select Size</option>
              <option value="small">Small</option>
              <option value="medium">Medium</option>
              <option value="large">Large</option>
            </select>

            <select
              value={updateData.type}
              onChange={(e) => setUpdateData({ ...updateData, type: e.target.value })}
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
                onChange={(e) => setUpdateData({ ...updateData, inUse: e.target.checked })}
              />
              In use?
            </label>

            <select
              value={updateData.exhibitID}
              onChange={(e) => setUpdateData({ ...updateData, exhibitID: e.target.value })}
            >
              <option value="">Select Exhibit</option>
              {exhibits.map((exhibit) => (
                <option key={exhibit.id} value={exhibit.id}>
                  {exhibit.name}
                </option>
              ))}
            </select>

            <button 
              onClick={updateCage}
              className="save-button"
            >
              Save Changes
            </button>
          </div>
        </div>
      )}

      {/* Feedback modal */}
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