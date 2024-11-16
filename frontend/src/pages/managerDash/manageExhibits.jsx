import React, { useState, useEffect } from 'react';
import './manageExhibits.css';

function ManageExhibits({ exhibitData, setExhibitData, addExhibit, exhibitId, setExhibitId, showSidebar }) {
  const [exhibits, setExhibits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [updateData, setUpdateData] = useState({}); // State for storing update form data
  const [showUpdateForm, setShowUpdateForm] = useState(false); // Toggle for showing update form
  const [modalMessage, setModalMessage] = useState(''); // Modal message for feedback

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

  // Populate update form when editing an exhibit
  const handleEditClick = (exhibit) => {
    setUpdateData(exhibit);
    setShowUpdateForm(true);
    console.log("Editing exhibit:", exhibit);
    console.log("Show Update Form:", showUpdateForm);
  };

  const updateExhibit = async () => {
    const validationError = validateExhibitData(updateData);
    if (validationError) {
      setModalMessage(validationError);
      return;
    }
    try {
      const response = await fetch(`https://coogzootestbackend-phi.vercel.app/update-exhibit?id=${updateData.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      });
      const data = await response.json();
      if (response.ok) {
        setModalMessage('Exhibit updated successfully.');
        setExhibits(exhibits.map((exh) => (exh.id === updateData.id ? { ...exh, ...updateData } : exh)));
        setShowUpdateForm(false); // close modal on success
      } else {
        setModalMessage(data.message || 'Error updating exhibit.');
      }
    } catch (error) {
      console.error('Error:', error);
      setModalMessage('An error occurred while attempting to update the exhibit.');
    }
  };

  const handleDeleteExhibit = async () => {
    try {
      const response = await fetch(`https://coogzootestbackend-phi.vercel.app/remove-exhibit?id=${exhibitId}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      if (response.ok) {
        setModalMessage('Exhibit soft-deleted successfully.');
        setExhibits(exhibits.filter(exh => exh.id !== parseInt(exhibitId, 10)));
      } else {
        setModalMessage(data.message || 'Error deleting exhibit.');
      }
    } catch (error) {
      console.error('Error:', error);
      setModalMessage('An error occurred while attempting to delete the exhibit.');
    }
  };

  // Shared validation function for both entry and update forms
  const validateExhibitData = (data) => {
    if (!data.name || !data.location || !data.description || !data.hours || !data.type || !data.imageLink) {
      return "Please fill out all required fields.";
    }
    if (data.isClosed) {
      if (!data.closureReason) {
        return "If the exhibit is closed, provide a reason.";
      }
      if (!data.closureStart) {
        return "If the exhibit is closed, provide a start date.";
      }
      if (!data.closureEnd) {
        return "If the exhibit is closed, provide an end date.";
      }
    }
    return null;
  };

  // Filter exhibits based on the search query
  const filteredExhibits = exhibits.filter((exhibit) =>
    exhibit.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    exhibit.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
    exhibit.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Close modal
  const closeModal = () => setModalMessage('');

  // Validate and add exhibit
  const validateAndAddExhibit = () => {
    const validationError = validateExhibitData(exhibitData);
    if (validationError) {
      setModalMessage(validationError);
      return;
    }
    addExhibit(); // Call your function to add the exhibit.
  };

  return (
    <div className={`manage-exhibits-container ${showSidebar ? '' : 'sidebar-collapsed'}`}>
      <div className="form-sections-wrapper">
        {/* Exhibit Entry Form */}
        <div className="manage-exhibits">
          <h2>Exhibit Entry Form</h2>
          <input
            type="text"
            placeholder="Name (required)"
            value={exhibitData.name}
            onChange={(e) => setExhibitData({ ...exhibitData, name: e.target.value })}
            required
          />
          <input
            type="text"
            placeholder="Location (required)"
            value={exhibitData.location}
            onChange={(e) => setExhibitData({ ...exhibitData, location: e.target.value })}
            required
          />
          <input
            type="text"
            placeholder="Description (required)"
            value={exhibitData.description}
            onChange={(e) => setExhibitData({ ...exhibitData, description: e.target.value })}
            required
          />
          <input
            type="text"
            placeholder="Hours (required)"
            value={exhibitData.hours}
            onChange={(e) => setExhibitData({ ...exhibitData, hours: e.target.value })}
            required
          />
          <select
            value={exhibitData.type}
            onChange={(e) => setExhibitData({ ...exhibitData, type: e.target.value })}
            required
          >
            <option value="">Select Type (required)</option>
            <option value="Aviary">Aviary</option>
            <option value="Aquarium">Aquarium</option>
            <option value="Petting Zoo">Petting Zoo</option>
            <option value="Others">Others</option>
          </select>
          <label>
            <input
              type="checkbox"
              checked={exhibitData.isClosed}
              onChange={(e) => setExhibitData({ ...exhibitData, isClosed: e.target.checked })}
            />
            Closed?
          </label>
          {exhibitData.isClosed && (
            <>
              <input
                type="text"
                placeholder="Closure Reason (if closed)"
                value={exhibitData.closureReason}
                onChange={(e) => setExhibitData({ ...exhibitData, closureReason: e.target.value })}
              />
              <input
                type="date"
                placeholder="Closure Start Date (if closed)"
                value={exhibitData.closureStart}
                onChange={(e) => setExhibitData({ ...exhibitData, closureStart: e.target.value })}
              />
              <input
                type="date"
                placeholder="Closure End Date"
                value={exhibitData.closureEnd}
                onChange={(e) => setExhibitData({ ...exhibitData, closureEnd: e.target.value })}
              />
            </>
          )}
          <input
            type="text"
            placeholder="Image Link"
            value={exhibitData.imageLink}
            onChange={(e) => setExhibitData({ ...exhibitData, imageLink: e.target.value })}
          />
          <button onClick={validateAndAddExhibit}>Add Exhibit</button>
        </div>
      </div>  
      
      {/* display employee information */}
      <div className="exhibit-list">
        <h2>Exhibit List</h2>
        <input
          type="text"
          placeholder="Search exhibits..."
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
            <table className="exhibit-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Location</th>
                  <th>Description</th>
                  <th>Hours</th>
                  <th>Type</th>
                  <th>Closed?</th>
                  <th>Closure Reason</th>
                  <th>Start Date</th>
                  <th>End Date</th>
                  <th>Image Link</th>
                  <th>Edit</th>
                </tr>
              </thead>
              <tbody>
                {filteredExhibits.map((exhibit) => (
                  <tr key={exhibit.id}>
                    <td>{exhibit.id}</td>
                    <td>{exhibit.name}</td>
                    <td>{exhibit.location}</td>
                    <td>{exhibit.description}</td>
                    <td>{exhibit.hours}</td>
                    <td>{exhibit.type}</td>
                    <td>{exhibit.isClosed ? "Yes" : "No"}</td>
                    <td>{exhibit.closureReason || "N/A"}</td>
                    <td>{exhibit.closureStart || "N/A"}</td>
                    <td>{exhibit.closureEnd || "N/A"}</td>
                    <td>{exhibit.imageLink || "N/A"}</td>
                    <td><button onClick={() => handleEditClick(exhibit)}>Edit</button></td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Remove Exhibit Section */}
            <div className="remove-exhibit-section">
              <h2>Remove Exhibit</h2>
              <input
                type="number"
                placeholder="Exhibit ID (required)"
                value={exhibitId}
                onChange={(e) => setExhibitId(e.target.value)}
                required
              />
              <button onClick={handleDeleteExhibit}>Remove Exhibit</button>
            </div>
          </>
        )}
      </div>
        
      {/* Update Exhibit Form */}
      {showUpdateForm && (
        <div className="modal">
          <div className="modal-content">
            <button className="close-button" onClick={() => setShowUpdateForm(false)}></button>
            <h2>Edit Exhibit</h2>
            <input
              type="text"
              placeholder="Name"
              value={updateData.name}
              onChange={(e) => setUpdateData({ ...updateData, name: e.target.value })}
              required
            />
            <input
              type="text"
              placeholder="Location"
              value={updateData.location}
              onChange={(e) => setUpdateData({ ...updateData, location: e.target.value })}
              required
            />
            <input
              type="text"
              placeholder="Description"
              value={updateData.description}
              onChange={(e) => setUpdateData({ ...updateData, description: e.target.value })}
              required
            />
            <input
              type="text"
              placeholder="Hours"
              value={updateData.hours}
              onChange={(e) => setUpdateData({ ...updateData, hours: e.target.value })}
              required
            />
            <select
              value={updateData.type}
              onChange={(e) => setUpdateData({ ...updateData, type: e.target.value })}
              required
            >
              <option value="">Select Type (required)</option>
              <option value="Aviary">Aviary</option>
              <option value="Aquarium">Aquarium</option>
              <option value="Petting Zoo">Petting Zoo</option>
              <option value="Others">Others</option>
            </select>
            <label>
              <input
                type="checkbox"
                checked={updateData.isClosed}
                onChange={(e) => setUpdateData({ ...updateData, isClosed: e.target.checked })}
              />
              Closed?
            </label>
            {updateData.isClosed && (
              <>
                <input
                  type="text"
                  placeholder="Closure Reason"
                  value={updateData.closureReason || ''}
                  onChange={(e) => setUpdateData({ ...updateData, closureReason: e.target.value })}
                />
                <input
                  type="date"
                  placeholder="Closure Start Date"
                  value={updateData.closureStart || ''}
                  onChange={(e) => setUpdateData({ ...updateData, closureStart: e.target.value })}
                />
                <input
                  type="date"
                  placeholder="Closure End Date"
                  value={updateData.closureEnd || ''}
                  onChange={(e) => setUpdateData({ ...updateData, closureEnd: e.target.value })}
                />
              </>
            )}
            <input
              type="text"
              placeholder="Image Link"
              value={updateData.imageLink}
              onChange={(e) => setUpdateData({ ...updateData, imageLink: e.target.value })}
            />
            <button onClick={updateExhibit}>Save Changes</button>
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

export default ManageExhibits;