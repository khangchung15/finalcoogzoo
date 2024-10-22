import React, { useState } from 'react';
import './exhibits.css';

const Exhibits = () => {
  const [exhibits, setExhibits] = useState([
    {
      id: 1,
      name: 'Rainforest Aviary',
      location: 'Section A',
      hours: '9:00 AM - 5:00 PM',
      type: 'Aviary',
      is_closed: false,
      closure_reason: '',
      closure_start: '',
      closure_end: '',
      //link:https://img.freepik.com/premium-photo/tropical-rainforest-aviary-with-exotic-birds-is-immersive-journey-into-heart-tropical-paradise-generated-by-ai_727385-1970.jpg
    },
    {
      id: 2,
      name: 'Ocean World Aquarium',
      location: 'Section B',
      hours: '10:00 AM - 6:00 PM',
      type: 'Aquarium',
      is_closed: true,
      closure_reason: 'Renovation',
      closure_start: '2024-10-01',
      closure_end: '2024-12-01',
      //link:
    },
    {
      id: 3,
      name: 'Savannah Safari',
      location: 'Section C',
      hours: '8:00 AM - 7:00 PM',
      type: 'Outdoor',
      is_closed: false,
      closure_reason: '',
      closure_start: '',
      closure_end: '',
    },
    {
      id: 4,
      name: 'Reptile House',
      location: 'Section D',
      hours: '9:00 AM - 5:00 PM',
      type: 'Indoor',
      is_closed: false,
      closure_reason: '',
      closure_start: '',
      closure_end: '',
    },
    {
      id: 5,
      name: 'Polar Bear Habitat',
      location: 'Section E',
      hours: '10:00 AM - 4:00 PM',
      type: 'Outdoor',
      is_closed: true,
      closure_reason: 'Seasonal Closure',
      closure_start: '2024-11-01',
      closure_end: '2025-03-01',
    },
    {
      id: 6,
      name: 'Butterfly Garden',
      location: 'Section F',
      hours: '9:00 AM - 6:00 PM',
      type: 'Garden',
      is_closed: false,
      closure_reason: '',
      closure_start: '',
      closure_end: '',
    },
    {
      id: 7,
      name: 'Penguin Cove',
      location: 'Section G',
      hours: '10:00 AM - 5:00 PM',
      type: 'Aquarium',
      is_closed: false,
      closure_reason: '',
      closure_start: '',
      closure_end: '',
    },
    {
      id: 8,
      name: 'Petting Zoo',
      location: 'Section H',
      hours: '9:00 AM - 5:00 PM',
      type: 'Interactive',
      is_closed: false,
      closure_reason: '',
      closure_start: '',
      closure_end: '',
    },
    {
      id: 9,
      name: 'Big Cat Territory',
      location: 'Section I',
      hours: '8:00 AM - 6:00 PM',
      type: 'Outdoor',
      is_closed: true,
      closure_reason: 'Maintenance',
      closure_start: '2024-09-15',
      closure_end: '2024-10-30',
    },
    {
      id: 10,
      name: 'Insectarium',
      location: 'Section J',
      hours: '9:00 AM - 5:00 PM',
      type: 'Indoor',
      is_closed: false,
      closure_reason: '',
      closure_start: '',
      closure_end: '',
    },
    {
      id: 11,
      name: 'Monkey Island',
      location: 'Section K',
      hours: '9:00 AM - 5:00 PM',
      type: 'Outdoor',
      is_closed: false,
      closure_reason: '',
      closure_start: '',
      closure_end: '',
    },
    {
      id: 12,
      name: 'Elephant Plains',
      location: 'Section L',
      hours: '8:00 AM - 6:00 PM',
      type: 'Outdoor',
      is_closed: true,
      closure_reason: 'Event Setup',
      closure_start: '2024-10-05',
      closure_end: '2024-10-20',
    },
    {
      id: 13,
      name: 'Desert Dome',
      location: 'Section M',
      hours: '9:00 AM - 5:00 PM',
      type: 'Indoor',
      is_closed: false,
      closure_reason: '',
      closure_start: '',
      closure_end: '',
    },
    {
      id: 14,
      name: 'Koala Forest',
      location: 'Section N',
      hours: '9:00 AM - 4:00 PM',
      type: 'Outdoor',
      is_closed: false,
      closure_reason: '',
      closure_start: '',
      closure_end: '',
    },
    {
      id: 15,
      name: 'Nocturnal House',
      location: 'Section O',
      hours: '6:00 PM - 10:00 PM',
      type: 'Indoor',
      is_closed: false,
      closure_reason: '',
      closure_start: '',
      closure_end: '',
    },
  ]);

  const [filter, setFilter] = useState({
    type: '',
    status: 'all',
  });

  // Handle filter change
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilter((prevFilter) => ({
      ...prevFilter,
      [name]: value,
    }));
  };

  const filteredExhibits = exhibits.filter((exhibit) => {
    return (
      (filter.type === '' || exhibit.type === filter.type) &&
      (filter.status === 'all' ||
        (filter.status === 'open' && !exhibit.is_closed) ||
        (filter.status === 'closed' && exhibit.is_closed))
    );
  });

  return (
    <div className="exhibits-container">
      <h1>Zoo Exhibits</h1>

      {/* Filter Section */}
      <div className="filter-section">
        <h3>Filter Exhibits</h3>
        <label htmlFor="type">Exhibit Type:</label>
        <select name="type" id="type" value={filter.type} onChange={handleFilterChange}>
          <option value="">All</option>
          <option value="Aviary">Aviary</option>
          <option value="Aquarium">Aquarium</option>
          <option value="Petting Zoo">Petting Zoo</option>
          <option value="Outdoor">Outdoor</option>
          <option value="Indoor">Indoor</option>
          <option value="Garden">Garden</option>
          <option value="Interactive">Interactive</option>
        </select>

        <label htmlFor="status">Status:</label>
        <select name="status" id="status" value={filter.status} onChange={handleFilterChange}>
          <option value="all">All</option>
          <option value="open">Open</option>
          <option value="closed">Closed</option>
        </select>
      </div>

      {/* Exhibits List */}
      <div className="exhibits-list">
        {filteredExhibits.length > 0 ? (
          filteredExhibits.map((exhibit) => (
            <div className="exhibit-card" key={exhibit.id}>
              <h4>{exhibit.name}</h4>
              <p><strong>Location:</strong> {exhibit.location}</p>
              <p><strong>Hours:</strong> {exhibit.hours}</p>
              <p><strong>Type:</strong> {exhibit.type}</p>
              {exhibit.is_closed ? (
                <div className="exhibit-closed">
                  <p><strong>Closed for:</strong> {exhibit.closure_reason}</p>
                  <p><strong>From:</strong> {exhibit.closure_start}</p>
                  <p><strong>Until:</strong> {exhibit.closure_end}</p>
                </div>
              ) : (
                <p className="exhibit-open">Open Now</p>
              )}
            </div>
          ))
        ) : (
          <p>No exhibits match your filter.</p>
        )}
      </div>
    </div>
  );
};

export default Exhibits;