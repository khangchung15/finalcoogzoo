import React, { useState } from 'react';
import "./managerdash.css";
import ManageEmployees from './manageEmployees';
import ManageExhibits from './manageExhibits'; // Import the ManageExhibits component

function ManagerDash() {
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [activeSection, setActiveSection] = useState('dashboard');
  const [employeeData, setEmployeeData] = useState({
    name: '',
    department: '',
    exhibitId: '',
    role: '',
    phone: '',
    email: '',
    startDate: '',
    supervisorId: '',
    status: 'active'
  });

  const [exhibitData, setExhibitData] = useState({
    name: '',
    location: '',
    hours: '',
    type: '',
    is_closed: false,
    closure_reason: '',
    closure_start: '',
    closure_end: '',
    image_link: ''
  });

  const [managerEmail] = useState("manager@example.com");
  const [employeeId, setEmployeeId] = useState('');
  const [exhibitId, setExhibitId] = useState('');

  const showModalMessage = (message) => {
    setModalMessage(message);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setModalMessage('');
  };

  const handleSectionChange = (section) => {
    setActiveSection(section);
  };

  const addEmployee = async () => {
    try {
      const response = await fetch('http://localhost:5000/add-employee', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(employeeData),
      });

      if (response.ok) {
        showModalMessage('Employee added successfully!');
        setEmployeeData({
          name: '',
          department: '',
          exhibitId: '',
          role: '',
          phone: '',
          email: '',
          startDate: '',
          supervisorId: '',
          status: 'active'
        });
      } else {
        showModalMessage('Failed to add employee.');
      }
    } catch (error) {
      console.error(error);
      showModalMessage('Error adding employee.');
    }
  };

  const deleteEmployee = async () => {
    try {
      const response = await fetch(`http://localhost:5000/remove-employee?id=${employeeId}&managerEmail=${managerEmail}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        showModalMessage('Employee removed successfully!');
        setEmployeeId('');
      } else {
        showModalMessage('Failed to remove employee.');
      }
    } catch (error) {
      console.error(error);
      showModalMessage('Error removing employee.');
    }
  };

  const addExhibit = async () => {
    try {
      const response = await fetch('http://localhost:5000/add-exhibit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(exhibitData),
      });

      if (response.ok) {
        showModalMessage('Exhibit added successfully!');
        setExhibitData({
          name: '',
          location: '',
          hours: '',
          type: '',
          is_closed: false,
          closure_reason: '',
          closure_start: '',
          closure_end: '',
          image_link: ''
        });
      } else {
        showModalMessage('Failed to add exhibit.');
      }
    } catch (error) {
      console.error(error);
      showModalMessage('Error adding exhibit.');
    }
  };

  const deleteExhibit = async () => {
    try {
      const response = await fetch(`http://localhost:5000/remove-exhibit?id=${exhibitId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        showModalMessage('Exhibit removed successfully!');
        setExhibitId('');
      } else {
        showModalMessage('Failed to remove exhibit.');
      }
    } catch (error) {
      console.error(error);
      showModalMessage('Error removing exhibit.');
    }
  };

  return (
    <div className="manager-dash">
      <div className="sidebar">
        <h2>Manager Dashboard</h2>
        <ul>
          <li onClick={() => handleSectionChange('dashboard')}>Dashboard</li>
          <li onClick={() => handleSectionChange('employees')}>Manage Employees</li>
          <li onClick={() => handleSectionChange('exhibits')}>Manage Exhibits</li>
          <li onClick={() => handleSectionChange('cages')}>Manage Cages</li>
          <li onClick={() => handleSectionChange('animals')}>Manage Animals</li>
          <li onClick={() => handleSectionChange('animalShowcases')}>Manage Animal Showcases</li>
          <li onClick={() => handleSectionChange('events')}>Manage Events</li>
          <li onClick={() => handleSectionChange('reports')}>Reports</li>
        </ul>
      </div>

      <div className="content">
        {activeSection === 'dashboard' && (
          <h1>Manager Dashboard</h1>
        )}

        {activeSection === 'employees' && (
          <ManageEmployees
            employeeData={employeeData}
            setEmployeeData={setEmployeeData}
            addEmployee={addEmployee}
            employeeId={employeeId}
            setEmployeeId={setEmployeeId}
            deleteEmployee={deleteEmployee}
          />
        )}

        {activeSection === 'exhibits' && (
          <ManageExhibits
            exhibitData={exhibitData}
            setExhibitData={setExhibitData}
            addExhibit={addExhibit}
            exhibitId={exhibitId}
            setExhibitId={setExhibitId}
            deleteExhibit={deleteExhibit}
          />
        )}

        {/* Similar sections for Cages, Animals, etc. */}
      </div>

      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <span className="close" onClick={closeModal}>&times;</span>
            <p>{modalMessage}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default ManagerDash;