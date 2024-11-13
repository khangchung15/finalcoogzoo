import React, { useState, useEffect } from 'react';
import './manageCages.css';

function ManageCages({ cageData, setCageData, addCage, cageId, setCageId, showSidebar }) {
  const [cages, setCages] = useState([]);
  const [exhibits, setExhibits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [updateData, setUpdateData] = useState({});
  const [showUpdateForm, setShowUpdateForm] = useState(false);
  const [modalMessage, setModalMessage] = useState('');

  // Add error logging to debug API calls
  const fetchWithLogging = async (url, options = {}) => {
    try {
      console.log(`Fetching from: ${url}`);
      const response = await fetch(url, options);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log(`Received data:`, data);
      return data;
    } catch (error) {
      console.error(`Fetch error for ${url}:`, error);
      throw error;
    }
  };

  // Fetch cage information
  useEffect(() => {
    const fetchCages = async () => {
      try {
        const data = await fetchWithLogging('https://coogzootestbackend-phi.vercel.appcages');
        setCages(data);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching cages:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCages();
  }, []);

  // Fetch exhibit information
  useEffect(() => {
    const fetchExhibits = async () => {
      try {
        const data = await fetchWithLogging('https://coogzootestbackend-phi.vercel.appexhibits');
        setExhibits(data);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching exhibits:', err);
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
      const response = await fetch(`https://coogzootestbackend-phi.vercel.appupdate-cage?id=${updateData.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      });
      const data = await response.json();
      if (response.ok) {
        setModalMessage('Cage updated successfully.');
        setCages(cages.map((cage) => (cage.id === updateData.id ? { ...cage, ...updateData } : cage)));
        setShowUpdateForm(false);
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
      const response = await fetch(`https://coogzootestbackend-phi.vercel.appremove-cage?id=${cageId}`, {
        method: 'DELETE',
      });
  
      const data = await response.json();
      if (response.ok) {
        setModalMessage('Cage soft-deleted successfully.');
        setCages(cages.filter(cage => cage.id !== parseInt(cageId, 10)));
      } else {
        setModalMessage(data.message || 'Error deleting cage.');
      }
    } catch (error) {
      console.error('Error:', error);
      setModalMessage('An error occurred while attempting to delete the cage.');
    }
  };

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
      {/* modal for feedback */}
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