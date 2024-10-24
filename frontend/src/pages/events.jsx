import React, { useState, useEffect } from 'react';
import './events.css';

const Events = () => {
  const [events, setEvents] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/events');
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

  const getMonthName = (date) => {
    return date.toLocaleString('default', { month: 'long' });
  };

  const handleMonthChange = (direction) => {
    const newDate = new Date(selectedDate);
    newDate.setMonth(selectedDate.getMonth() + direction);
    setSelectedDate(newDate);
  };

  const renderBasicCalendar = () => {
    const daysInMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0).getDate();
    const firstDay = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1).getDay();

    const calendarDays = [];

    for (let i = 0; i < firstDay; i++) {
      calendarDays.push(<td key={`empty-${i}`}></td>);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      calendarDays.push(
        <td key={day} className={day === selectedDate.getDate() ? 'selected' : ''}>
          {day}
        </td>
      );
    }

    const rows = [];
    for (let i = 0; i < calendarDays.length; i += 7) {
      rows.push(
        <tr key={`row-${i / 7}`}>
          {calendarDays.slice(i, i + 7)}
        </tr>
      );
    }

    return (
      <table className="basic-calendar">
        <thead>
          <tr>
            <th>Sun</th>
            <th>Mon</th>
            <th>Tue</th>
            <th>Wed</th>
            <th>Thu</th>
            <th>Fri</th>
            <th>Sat</th>
          </tr>
        </thead>
        <tbody>{rows}</tbody>
      </table>
    );
  };

  const formatDate = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };
  if (loading) {
    return <p>Loading events...</p>;
  }

  if (error) {
    return <p>Error: {error}</p>;
  }

  return (
    <div className="events-page">
      <div className="header-section">
        <img
          src="https://www.timeoutabudhabi.com/cloud/timeoutabudhabi/2023/05/23/SeaWorld-Abu-Dhabi-grand-opening-celebration-1.jpg"
          alt="Zoo Header"
          className="header-image"
        />
        <h1>Welcome to CoogZoo Events</h1>
        <p>Discover our amazing animal exhibits and upcoming events!</p>
      </div>

      <div className="events-layout">
        <div className="schedule-container">
          <h2>Upcoming Events</h2>
          <p>{selectedDate.toDateString()}</p>

          <table className="schedule-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Start Time</th>
                <th>End Time</th>
                <th>Event</th>
                <th>Location</th>
              </tr>
            </thead>
            <tbody>
            {events.map(event => {
  // Format the time string (assuming the input format is 'HH:MM:SS')
  const formatTime = (timeString) => {
    const [hours, minutes, seconds] = timeString.split(':'); // Split the time string
    const date = new Date(); // Create a new date object
    date.setHours(hours, minutes, seconds); // Set the time on the date object
    
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }); // 12-hour format with AM/PM
  };

  return (
    <tr key={event.Id}>
      {/* Keep the date the same as before */}
      <td>{formatDate(event.Date)}</td>
      {/* Format StartTime and EndTime */}
      <td>{formatTime(event.StartTime)}</td>
      <td>{formatTime(event.EndTime)}</td>
      <td>{event.Name}</td>
      <td>{event.Location}</td>
    </tr>
  );
})}

            </tbody>
          </table>
        </div>

        <div className="calendar-container">
          <div className="calendar-header">
            <button onClick={() => handleMonthChange(-1)}>←</button>
            <span>{getMonthName(selectedDate)} {selectedDate.getFullYear()}</span>
            <button onClick={() => handleMonthChange(1)}>→</button>
          </div>
          {renderBasicCalendar()}
        </div>
      </div>
    </div>
  );
};

export default Events;
