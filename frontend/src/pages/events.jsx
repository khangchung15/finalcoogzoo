import React, { useState, useEffect } from 'react';
import './events.css';

const Events = () => {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const fetchEvents = async () => {
      const eventData = [
        {
          id: 1,
          name: 'Fall Festival',
          description: 'Celebrate the beauty of autumn with fun activities, food, and entertainment.',
          date: 'October 21, 2024',
          startTime: '10:00 AM',
          endTime: '4:00 PM',
          location: 'Main Plaza',
          supervisor: 'John Doe'
        },
        {
          id: 2,
          name: 'Christmas Lights Spectacular',
          description: 'A magical holiday light show with festive decorations and hot cocoa.',
          date: 'December 15, 2024',
          startTime: '6:00 PM',
          endTime: '9:00 PM',
          location: 'North Park',
          supervisor: 'Jane Smith'
        },
        {
          id: 3,
          name: 'Zoo Halloween Spooktacular',
          description: 'Come in your best costume for a night of trick-or-treating and spooky fun at the zoo!',
          date: 'October 31, 2024',
          startTime: '5:00 PM',
          endTime: '8:00 PM',
          location: 'Zoo Grounds',
          supervisor: 'Emily Johnson'
        },
        {
          id: 4,
          name: 'Animal Awareness Week',
          description: 'A week-long event filled with educational talks, tours, and activities centered on endangered species.',
          date: 'November 5-11, 2024',
          startTime: '9:00 AM',
          endTime: '5:00 PM',
          location: 'Various Exhibits',
          supervisor: 'Tom Harris'
        },
        {
          id: 5,
          name: 'Zoo Summer Camp',
          description: 'Join us for a week of wildlife adventures, learning, and fun activities for kids.',
          date: 'July 10-15, 2024',
          startTime: '8:00 AM',
          endTime: '3:00 PM',
          location: 'Children’s Discovery Center',
          supervisor: 'Amanda Lee'
        },
        {
          id: 6,
          name: 'New Year’s Eve Celebration',
          description: 'Ring in the New Year with a family-friendly celebration featuring live music, games, and fireworks.',
          date: 'December 31, 2024',
          startTime: '8:00 PM',
          endTime: '12:30 AM',
          location: 'Main Plaza',
          supervisor: 'Michael Brown'
        },
      ];
      setEvents(eventData);
    };

    fetchEvents();
  }, []);

  return (
    <div className="events-container">
      <h1>Upcoming Events</h1>
      <ul>
        {events.map((event) => (
          <li key={event.id} className="event-item">
            <h2>{event.name}</h2>
            <p>{event.description}</p>
            <p>Date: {event.date}</p>
            <p>Time: {event.startTime} - {event.endTime}</p>
            <p>Location: {event.location}</p>
            <p>Supervisor: {event.supervisor}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Events;
