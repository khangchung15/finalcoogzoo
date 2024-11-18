  import React, { useState, useEffect } from 'react';
  import './manageShowcases.css';

  function ManageShowcases({ showcaseData, setShowcaseData, addShowcase, showcaseId, setShowcaseId, showSidebar }) {
    const [showcases, setShowcases] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [updateData, setUpdateData] = useState({}); // State for storing update form data
    const [showUpdateForm, setShowUpdateForm] = useState(false); // Toggle for showing update form
    const [modalMessage, setModalMessage] = useState(''); // Modal message for feedback

    // fetch showcase information from the database
    useEffect(() => {
      const fetchShowcase = async () => {
        try {
          const response = await fetch('https://finalcoogzoobackend.vercel.app/showcases');
          if (!response.ok) {
            throw new Error('Failed to fetch showcases');
          }
          const data = await response.json();
          setShowcases(data);
        } catch (err) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      };
      fetchShowcase();
    }, []);

    // Populate update form when editing an showcase
    const handleEditClick = (showcase) => {
      setUpdateData(showcase);
      setShowUpdateForm(true);
      console.log("Editing showcase:", showcase);
      console.log("Show Update Form:", showUpdateForm);
    };

    const updateShowcase = async () => {
      const validationError = validateShowcaseData(updateData);
      if (validationError) {
        setModalMessage(validationError);
        return;
      }
      try {
        const response = await fetch(`https://finalcoogzoobackend.vercel.app/update-showcase?id=${updateData.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updateData),
        });
        const data = await response.json();
        if (response.ok) {
          setModalMessage('Showcase updated successfully.');
          setShowcases(showcases.map((sho) => (sho.id === updateData.id ? { ...sho, ...updateData } : sho)));
          setShowUpdateForm(false); // close modal on success
        } else {
          setModalMessage(data.message || 'Error updating showcase.');
        }
      } catch (error) {
        console.error('Error:', error);
        setModalMessage('An error occurred while attempting to update the showcase.');
      }
    };

    const handleDeleteShowcase = async () => {
      try {
        const response = await fetch(`https://finalcoogzoobackend.vercel.app/remove-showcase?id=${showcaseId}`, {
          method: 'DELETE',
        });

        const data = await response.json();
        if (response.ok) {
          setModalMessage('Showcase deleted successfully.');
          setShowcases(showcases.filter(sho => sho.id !== parseInt(showcaseId, 10)));
        } else {
          setModalMessage(data.message || 'Error deleting showcase.');
        }
      } catch (error) {
        console.error('Error:', error);
        setModalMessage('An error occurred while attempting to delete the showcase.');
      }
    };

    // shared validation function for both entry and update forms
    const validateShowcaseData = (data) => {
      if (!data.name || !data.scientificName || !data.habitat || !data.funFact || !data.location || !data.imageLink) {
        return "Please fill out all required fields.";
      }
      return null;
    };

    // filter showcases based on the search query
    const filteredShowcases = showcases.filter((showcase) =>
      showcase.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      showcase.scientificName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      showcase.habitat.toLowerCase().includes(searchQuery.toLowerCase()) ||
      showcase.location.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Close modal
    const closeModal = () => setModalMessage('');

    // Validate and add showcase
    const validateAndAddShowcase = () => {
      const validationError = validateShowcaseData(showcaseData);
      if (validationError) {
        setModalMessage(validationError);
        return;
      }
      addShowcase(); // Call your function to add the showcase.
    };

    return (
      <div className={`manage-showcases-container ${showSidebar ? '' : 'sidebar-collapsed'}`}>
        <div className="form-sections-wrapper">
          {/* Showcase Entry Form */}
          <div className="manage-showcases">
            <h2>Showcase Entry Form</h2>
            <input
              type="text"
              placeholder="Name (required)"
              value={showcaseData.name}
              onChange={(e) => setShowcaseData({ ...showcaseData, name: e.target.value })}
              required
            />
            <input
              type="text"
              placeholder="Scientific Name (required)"
              value={showcaseData.scientificName}
              onChange={(e) => setShowcaseData({ ...showcaseData, scientificName: e.target.value })}
              required
            />
            <input
              type="text"
              placeholder="Habitat (required)"
              value={showcaseData.habitat}
              onChange={(e) => setShowcaseData({ ...showcaseData, habitat: e.target.value })}
              required
            />
            <input
              type="text"
              placeholder="Fun Fact (required)"
              value={showcaseData.funFact}
              onChange={(e) => setShowcaseData({ ...showcaseData, funFact: e.target.value })}
              required
            />
            <input
              type="text"
              placeholder="Location (required)"
              value={showcaseData.location}
              onChange={(e) => setShowcaseData({ ...showcaseData, location: e.target.value })}
              required
            />
            <input
              type="text"
              placeholder="Image Link (required)"
              value={showcaseData.imageLink}
              onChange={(e) => setShowcaseData({ ...showcaseData, imageLink: e.target.value })}
              required
            />
            <button onClick={validateAndAddShowcase}>Add Showcase</button>
          </div>
        </div>  
        
        {/* display Showcase information */}
        <div className="showcase-list">
          <h2>Showcase Records</h2>
          <input
            type="text"
            placeholder="Search showcases..."
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
              <table className="showcase-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Scientific Name</th>
                    <th>Habitat</th>
                    <th>Fun Fact</th>
                    <th>Location</th>
                    <th>Image Link</th>
                    <th>Edit</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredShowcases.map((showcase) => (
                    <tr key={showcase.id}>
                      <td>{showcase.id}</td>
                      <td>{showcase.name}</td>
                      <td>{showcase.scientificName}</td>
                      <td>{showcase.habitat}</td>
                      <td>{showcase.funFact}</td>
                      <td>{showcase.location}</td>
                      <td>{showcase.imageLink}</td>
                      <td><button onClick={() => handleEditClick(showcase)}>Edit</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Remove Showcase Section */}
              <div className="remove-showcase-section">
                <h2>Remove Showcase</h2>
                <input
                  type="number"
                  placeholder="Showcase ID (required)"
                  value={showcaseId}
                  onChange={(e) => setShowcaseId(e.target.value)}
                  required
                />
                <button onClick={handleDeleteShowcase}>Remove Showcase</button>
              </div>
            </>
          )}
        </div>
          
        {/* Update Showcase Form */}
        {showUpdateForm && (
          <div className="modal">
            <div className="modal-content">
              <button className="close-button" onClick={() => setShowUpdateForm(false)}></button>
              <h2>Edit Showcase</h2>
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
                placeholder="Habitat"
                value={updateData.habitat}
                onChange={(e) => setUpdateData({ ...updateData, habitat: e.target.value })}
                required
              />
              <input
                type="text"
                placeholder="Fun Fact"
                value={updateData.funFact}
                onChange={(e) => setUpdateData({ ...updateData, funFact: e.target.value })}
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
                placeholder="Image Link"
                value={updateData.imageLink}
                onChange={(e) => setUpdateData({ ...updateData, imageLink: e.target.value })}
                required
              />
              <button onClick={updateShowcase}>Save Changes</button>
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

  export default ManageShowcases;