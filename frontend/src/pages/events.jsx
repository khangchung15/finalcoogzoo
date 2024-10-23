import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import './events.css';

const Events = () => {
  const [events, setEvents] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());

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
          date: 'November 5, 2024',
          startTime: '9:00 AM',
          endTime: '5:00 PM',
          location: 'Various Exhibits',
          supervisor: 'Tom Harris'
        },
        {
          id: 5,
          name: 'Zoo Summer Camp',
          description: 'Join us for a week of wildlife adventures, learning, and fun activities for kids.',
          date: 'July 10, 2024',
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
        {
          id: 7,
          name: 'Earth Day Conservation Talk',
          description: 'An insightful talk on conservation efforts and how we can help the planet.',
          date: 'April 22, 2024',
          startTime: '11:00 AM',
          endTime: '2:00 PM',
          location: 'Exhibit Hall',
          supervisor: 'Susan Clark'
        },
        {
          id: 8,
          name: 'Wildlife Photography Workshop',
          description: 'A photography workshop teaching techniques to capture stunning wildlife photos.',
          date: 'August 5, 2024',
          startTime: '9:00 AM',
          endTime: '12:00 PM',
          location: 'Wildlife Exhibit',
          supervisor: 'James Cooper'
        }
      ];
      setEvents(eventData);
    };

    fetchEvents();
  }, []);

  const handleDateChange = (date) => {
    setSelectedDate(date);
  };

  const eventDates = events.map(event => new Date(event.date).toDateString());

  return (
    <div className="events-container">
      <h1>Upcoming Events</h1>
      <div className="events-layout">
        <div className="events-table">
          <table>
            <thead>
              <tr>
                <th>Event Name</th>
                <th>Date</th>
                <th>Time</th>
                <th>Location</th>
              </tr>
            </thead>
            <tbody>
              {events.map((event) => (
                <tr key={event.id}>
                  <td>{event.name}</td>
                  <td>{event.date}</td>
                  <td>{event.startTime} - {event.endTime}</td>
                  <td>{event.location}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="events-calendar">
          <Calendar
            onChange={handleDateChange}
            value={selectedDate}
            tileClassName={({ date }) => {
              return eventDates.includes(date.toDateString()) ? 'highlight' : '';
            }}
            tileContent={({ date }) => {
              const eventForDate = events.find(event => new Date(event.date).toDateString() === date.toDateString());
              return eventForDate ? <p>{eventForDate.name}</p> : null;
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default Events;
