import React, { useState, useEffect } from 'react';
import './manageExhibits.css';
import showSidebar from './managerdash';

function ManageExhibits({ exhibitData, setExhibitData, addExhibit, exhibitId, setExhibitId, deleteExhibit,showSidebar }) {
  const [exhibits, setExhibits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [updateData, setUpdateData] = useState({}); // State for storing update form data
  const [showUpdateForm, setShowUpdateForm] = useState(false); // Toggle for showing update form
  const [modalMessage, setModalMessage] = useState(''); // Modal message for feedback

  // Fetch exhibit information from the database
  useEffect(() => {
    const fetchExhibits = async () => {
      try {
        const response = await fetch('https://coogzootestbackend.vercel.app/exhibits');
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

  // Shared validation function for both entry and update forms
  const validateExhibitData = (data) => {
    if (!data.name || !data.location || !data.hours || !data.type) {
      return "Please fill out all required fields.";
    }
    if (data.is_closed && (!data.closure_reason || !data.closure_start)) {
      return "If the exhibit is closed, provide a reason and start date.";
    }
    return null;
  };

  // Filter exhibits based on the search query
  const filteredExhibits = exhibits.filter((exhibit) =>
    exhibit.Name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    exhibit.Location.toLowerCase().includes(searchQuery.toLowerCase()) ||
    exhibit.Type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleUpdateExhibit = async () => {
    console.log("Attempting to update with:", updateData); // Log data before sending
    const validationError = validateExhibitData(updateData);
    if (validationError) {
      setModalMessage(validationError);
      return;
    }

    try {
      const response = await fetch(`https://coogzootestbackend.vercel.app/update-exhibit?id=${updateData.ID}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      });

      const result = await response.json();
      console.log("Response from update:", result); // Log response from server

      if (response.ok) {
        setModalMessage('Exhibit updated successfully');
        setExhibits((prev) =>
          prev.map((ex) => (ex.ID === updateData.ID ? { ...ex, ...updateData } : ex))
        );
        setShowUpdateForm(false);
      } else {
        setModalMessage(result.message);
      }
    } catch (error) {
      console.log("Error during update fetch:", error); // Log any fetch errors
      setModalMessage('Error updating exhibit');
    }
  };
  
  // Populate update form when editing an exhibit
  const handleEditClick = (exhibit) => {
    console.log("Editing exhibit:", exhibit); // Debugging
    setUpdateData(exhibit);
    setShowUpdateForm(true);
  };

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
              checked={exhibitData.is_closed}
              onChange={(e) => setExhibitData({ ...exhibitData, is_closed: e.target.checked })}
            />
            Closed?
          </label>
          {exhibitData.is_closed && (
            <>
              <input
                type="text"
                placeholder="Closure Reason (if closed)"
                value={exhibitData.closure_reason}
                onChange={(e) => setExhibitData({ ...exhibitData, closure_reason: e.target.value })}
              />
              <input
                type="date"
                placeholder="Closure Start Date (if closed)"
                value={exhibitData.closure_start}
                onChange={(e) => setExhibitData({ ...exhibitData, closure_start: e.target.value })}
              />
              <input
                type="date"
                placeholder="Closure End Date"
                value={exhibitData.closure_end}
                onChange={(e) => setExhibitData({ ...exhibitData, closure_end: e.target.value })}
              />
            </>
          )}
          <input
            type="text"
            placeholder="Image Link"
            value={exhibitData.Image_Link}
            onChange={(e) => setExhibitData({ ...exhibitData, Image_Link: e.target.value })}
          />
          <button onClick={validateAndAddExhibit}>Add Exhibit</button>
        </div>

        {/* Update Exhibit Form */}
        {showUpdateForm && (
          <div className="update-form-section">
            <h2>Update Exhibit</h2>
            <input
              type="text"
              placeholder="Name (required)"
              value={updateData.Name}
              onChange={(e) => setUpdateData({ ...updateData, Name: e.target.value })}
              required
            />
            <input
              type="text"
              placeholder="Location (required)"
              value={updateData.Location}
              onChange={(e) => setUpdateData({ ...updateData, Location: e.target.value })}
              required
            />
            <input
              type="text"
              placeholder="Hours (required)"
              value={updateData.Hours}
              onChange={(e) => setUpdateData({ ...updateData, Hours: e.target.value })}
              required
            />
            <select
              value={updateData.Type}
              onChange={(e) => setUpdateData({ ...updateData, Type: e.target.value })}
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
                checked={updateData.is_closed}
                onChange={(e) => setUpdateData({ ...updateData, is_closed: e.target.checked })}
              />
              Is Closed
            </label>
            {updateData.is_closed && (
              <>
                <input
                  type="text"
                  placeholder="Closure Reason"
                  value={updateData.closure_reason}
                  onChange={(e) => setUpdateData({ ...updateData, closure_reason: e.target.value })}
                />
                <input
                  type="date"
                  placeholder="Closure Start Date"
                  value={updateData.closure_start}
                  onChange={(e) => setUpdateData({ ...updateData, closure_start: e.target.value })}
                />
                <input
                  type="date"
                  placeholder="Closure End Date"
                  value={updateData.closure_end}
                  onChange={(e) => setUpdateData({ ...updateData, closure_end: e.target.value })}
                />
              </>
            )}
            <input
              type="text"
              placeholder="Image Link"
              value={updateData.Image_Link}
              onChange={(e) => setUpdateData({ ...updateData, Image_Link: e.target.value })}
            />
            <button onClick={handleUpdateExhibit}>Update Exhibit</button>
          </div>
        )}
      </div>

      {/* Display Exhibit Information */}
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
                  <th>Hours</th>
                  <th>Type</th>
                  <th>Is Closed</th>
                  <th>Closure Reason</th>
                  <th>Start Date</th>
                  <th>End Date</th>
                  <th>Image Link</th>
                  <th>Edit</th>
                </tr>
              </thead>
              <tbody>
              {filteredExhibits.map((exhibit) => (
                <tr key={exhibit.ID}>
                  <td>{exhibit.ID}</td>
                  <td>{exhibit.Name}</td>
                  <td>{exhibit.Location}</td>
                  <td>{exhibit.Hours}</td>
                  <td>{exhibit.Type}</td>
                  <td>{exhibit.is_closed ? "Yes" : "No"}</td>
                  <td>{exhibit.closure_reason || "N/A"}</td>
                  <td>{exhibit.closure_start || "N/A"}</td>
                  <td>{exhibit.closure_end || "N/A"}</td>
                  <td style={{ whiteSpace: 'normal', wordBreak: 'break-word', maxWidth: '200px' }}>
                    {exhibit.Image_Link || "N/A"}
                  </td>
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
              <button onClick={deleteExhibit}>Remove Exhibit</button>
            </div>
          </>
        )}
      </div>

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