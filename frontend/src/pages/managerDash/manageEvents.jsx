import React, { useState, useEffect } from 'react';
import './manageEvents.css';
function ManageEvents({ eventData, setEventData, addEvent, eventId, setEventId, showSidebar }) {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [updateData, setUpdateData] = useState({}); // state for storing update form data
    const [showUpdateForm, setShowUpdateForm] = useState(false); // toggle for showing update form
    const [modalMessage, setModalMessage] = useState(''); // modal message for feedback
    // fetch event information from the database
    useEffect(() => {
        const fetchEvents = async () => {
        
          try { 
            const response = await fetch('https://finalcoogzoobackend.vercel.app/events');
            if (!response.ok) {
              throw new Error('Failed to fetch events');
            }
            const data = await response.json();
            setEvents(data);
          } catch (err) {
            setError(err.message);
          } finally {
            setLoading(false);
          }
        };
        fetchEvents();
      }, []);
    const handleEditClick = (event) => {
        setUpdateData(event);
        setShowUpdateForm(true);
        console.log("Editing event:", event); // check if data is correct
        console.log("Show Update Form:", showUpdateForm);
    };
    const updateEvent = async () => {
        const validationError = validateEventData(updateData);
        if (validationError) {
          setModalMessage(validationError);
          return;
        }
        try {
          const response = await fetch(`https://finalcoogzoobackend.vercel.app/update-event?id=${updateData.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updateData),
          });
          const data = await response.json();
          if (response.ok) {
            setModalMessage('Event updated successfully.');
            setEvents(events.map((eve) => (eve.id === updateData.id ? { ...eve, ...updateData } : eve)));
            setShowUpdateForm(false); // close modal on success
          } else {
            setModalMessage(data.message || 'Error updating event.');
          }
        } catch (error) {
          console.error('Error:', error);
          setModalMessage('An error occurred while attempting to update the event.');
        };
    };
    const handleDeleteEvent = async () => {
        try {
          const response = await fetch(`https://finalcoogzoobackend.vercel.app/remove-event?id=${eventId}`, {
            method: 'DELETE',
          });
  
          const data = await response.json();
          if (response.ok) {
            setModalMessage('Event deleted successfully.');
            setEvents(events.filter(eve => eve.id !== parseInt(eventId, 10)));
          } else {
            setModalMessage(data.message || 'Error deleting event.');
          }
        } catch (error) {
          console.error('Error:', error);
          setModalMessage('An error occurred while attempting to delete the event.');
        }
    };
    const validateEventData = (data) => {
        if (!data.name || !data.description || !data.date || !data.startTime || !data.endTime || !data.location) {
          return "Please fill out all required fields.";
        }
        return null;
      };
    const filteredEvents = events.filter((event) =>
      event.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.date.toLowerCase().includes(searchQuery.toLowerCase())
    );
    // Close modal
    const closeModal = () => setModalMessage('');
    // Validate and add event
    const validateAndAddEvent = () => {
      const validationError = validateEventData(eventData);
      if (validationError) {
        setModalMessage(validationError);
        return;
      }
      addEvent();
    };
    return (
        <div className={`manage-events-container ${showSidebar ? '' : 'sidebar-collapsed'}`}>
          <div className="form-sections-wrapper">
            {/* events Entry Form */}
            <div className="manage-events">
              <h2>Event Entry Form</h2>
              <input
                type="text"
                placeholder="Name (required)"
                value={eventData.name}
                onChange={(e) => setEventData({ ...eventData, name: e.target.value })}
                required
              />
              <input
                type="text"
                placeholder="Description (required)"
                value={eventData.description}
                onChange={(e) => setEventData({ ...eventData, description: e.target.value })}
                required
              />
              <input
                type="date"
                placeholder="Date (required)"
                value={eventData.date}
                onChange={(e) => setEventData({ ...eventData, date: e.target.value })}
                required
              />
              <input
                type="time"
                placeholder="Start Time (required)"
                value={eventData.startTime}
                onChange={(e) => setEventData({ ...eventData, startTime: e.target.value })}
                required
              />
              <input
                type="time"
                placeholder="End Time (required)"
                value={eventData.endTime}
                onChange={(e) => setEventData({ ...eventData, endTime: e.target.value })}
                required
              />
              <input
                type="text"
                placeholder="Location"
                value={eventData.location}
                onChange={(e) => setEventData({ ...eventData, location: e.target.value })}
                required
              />
              <button onClick={validateAndAddEvent}>Add Event</button>
            </div>
          </div>  
          
          {/* display Event information */}
          <div className="event-list">
            <h2>Event Records</h2>
            <input
              type="text"
              placeholder="Search events..."
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
                <table className="event-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Name</th>
                      <th>Description</th>
                      <th>Date</th>
                      <th>Start Time</th>
                      <th>End Time</th>
                      <th>Location</th>
                      <th>Edit</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredEvents.map((event) => (
                      <tr key={event.id}>
                        <td>{event.id}</td>
                        <td>{event.name}</td>
                        <td>{event.description}</td>
                        <td>{event.date}</td>
                        <td>{event.startTime}</td>
                        <td>{event.endTime}</td>
                        <td>{event.location}</td>
                        <td><button onClick={() => handleEditClick(event)}>Edit</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
  
                {/* Remove Event Section */}
                <div className="remove-event-section">
                  <h2>Remove Event</h2>
                  <input
                    type="number"
                    placeholder="Event ID (required)"
                    value={eventId}
                    onChange={(e) => setEventId(e.target.value)}
                    required
                  />
                  <button onClick={handleDeleteEvent}>Remove Event</button>
                </div>
              </>
            )}
          </div>
            
          {/* Update Event Form */}
          {showUpdateForm && (
            <div className="modal">
              <div className="modal-content">
                <button className="close-button" onClick={() => setShowUpdateForm(false)}></button>
                <h2>Edit Event</h2>
                <input
                  type="text"
                  placeholder="Name"
                  value={updateData.name}
                  onChange={(e) => setUpdateData({ ...updateData, name: e.target.value })}
                  required
                />
                <input
                  type="text"
                  placeholder="description"
                  value={updateData.description}
                  onChange={(e) => setUpdateData({ ...updateData, description: e.target.value })}
                  required
                />
                <input
                  type="date"
                  placeholder="Date"
                  value={updateData.date}
                  onChange={(e) => setUpdateData({ ...updateData, date: e.target.value })}
                  required
                />
                <input
                  type="time"
                  placeholder="Start Time"
                  value={updateData.startTime}
                  onChange={(e) => setUpdateData({ ...updateData, startTime: e.target.value })}
                  required
                />
                <input
                  type="time"
                  placeholder="End Time"
                  value={updateData.endTime}
                  onChange={(e) => setUpdateData({ ...updateData, endTime: e.target.value })}
                  required
                />
                <input
                  type="text"
                  placeholder="Location"
                  value={updateData.location}
                  onChange={(e) => setUpdateData({ ...updateData, location: e.target.value })}
                  required
                />
                <button onClick={updateEvent}>Save Changes</button>
              </div>
            </div>
          )}
  
          {/* Modal for feedback */}
          {modalMessage && (
            <div className="modal">
            <div className="modal-content">
                <p className="modal-message">{modalMessage}</p>
                <button onClick={closeModal}>Close</button>
              </div>
            </div>
          )}
        </div>
      );
};
export default ManageEvents;