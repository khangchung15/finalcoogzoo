import React, { useState } from 'react';
import './managerdash.css';
import ManageEmployees from './manageEmployees';
import ManageExhibits from './manageExhibits';
import ManageAnimals from './manageAnimals';
import ManageCages from './manageCages';
import ManageShowcases from './manageShowcases';

function ManagerDash() {
  const [showSidebar, setShowSidebar] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [activeSection, setActiveSection] = useState('dashboard');
  const [employeeData, setEmployeeData] = useState({
    firstName: '',
    lastName: '',
    birthDate: '',
    email: '',
    phone: '',
    department: '',
    role: '',
    startDate: '',
    exhibitID: '',
    supervisorID: '',
    status: 'active'
  });

  const [exhibitData, setExhibitData] = useState({
    name: '',
    location: '',
    description: '',
    hours: '',
    type: '',
    isClosed: false,
    closureReason: '',
    closureStart: '',
    closureEnd: '',
    imageLink: ''
  });

  const [animalData, setAnimalData] = useState({
    name: '',
    scientificName: '',
    species: '',
    birthDate: '',
    height: '',
    weight: '',
    status: 'active',
    statusReason: '',
    cageID: '',
    exhibitID: ''
  });

  const [cageData, setCageData] = useState({
    size: '',
    type: '',
    inUse: false,
    exhibitID: '',
  });

  const [showcaseData, setShowcaseData] = useState({
    name: '',
    scientificName: '',
    habitat: '',
    funFact: '',
    location: '',
    imageLink: '',
  });
  
  const [managerEmail] = useState("manager@example.com");
  const [employeeId, setEmployeeId] = useState('');
  const [exhibitId, setExhibitId] = useState('');
  const [animalId, setAnimalId] = useState('');
  const [cageId, setCageId] = useState('');
  const [showcaseId, setShowcaseId] = useState('');
  
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

  const toggleSidebar = () => {
    setShowSidebar(!showSidebar); // Toggle the sidebar visibility
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
        // Reset to match initial state structure
        setEmployeeData({
          firstName: '',
          lastName: '',
          birthDate: '',
          email: '',
          phone: '',
          department: '',
          role: '',
          startDate: '',
          exhibitID: '',
          supervisorID: '',
          status: 'active',
          endDate: ''
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
          description: '',
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

  const addAnimal = async () => {
    try {
      const response = await fetch('http://localhost:5000/add-animal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(animalData),
      });

      if (response.ok) {
        showModalMessage('Animal added successfully!');
        setAnimalData({
          name: '',
          scientificName: '',
          species: '',
          birthDate: '',
          height: '',
          weight: '',
          status: 'active',
          statusReason: '',
          cageID: '',
          exhibitID: ''
        });
      } else {
        showModalMessage('Failed to add animal.');
      }
    } catch (error) {
      console.error(error);
      showModalMessage('Error adding animal.');
    }
  };

  const deleteAnimal = async () => {
    try {
      const response = await fetch(`http://localhost:5000/remove-animal?id=${animalId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        showModalMessage('Animal removed successfully!');
        setAnimalId('');
      } else {
        showModalMessage('Failed to remove animal.');
      }
    } catch (error) {
      console.error(error);
      showModalMessage('Error removing animal.');
    }
  };

  const addCage = async () => {
    try {
      const response = await fetch('http://localhost:5000/add-cage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cageData),
      });

      if (response.ok) {
        showModalMessage('Cage added successfully!');
        setCageData({
          size: '',
          type: '',
          inUse: false,
          exhibitID: '',
        });
      } else {
        showModalMessage('Failed to add cage.');
      }
    } catch (error) {
      console.error(error);
      showModalMessage('Error adding cage.');
    }
  };

  const deleteCage = async () => {
    try {
      const response = await fetch(`http://localhost:5000/remove-cage?id=${cageId}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        showModalMessage('Cage removed successfully!');
        setCageId('');
      } else {
        showModalMessage('Failed to remove cage.');
      }
    } catch (error) {
      console.error(error);
      showModalMessage('Error removing cage.');
    }
  };

  const addShowcase = async () => {
    try {
      const response = await fetch('http://localhost:5000/add-showcase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(showcaseData),
      });

      if (response.ok) {
        showModalMessage('Showcase added successfully!');
        setShowcaseData({
          name: '',
          scientificName: '',
          habitat: '',
          funFact: '',
          location: '',
          imageLink: '',
        });

      } else {
        showModalMessage('Failed to add showcase.');
      }
    } catch (error) {
      console.error(error);
      showModalMessage('Error adding showcase.');
    }
  };

  const deleteShowcase = async () => {
    try {
      const response = await fetch(`http://localhost:5000/remove-showcase?id=${showcaseId}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        showModalMessage('Showcase removed successfully!');
        setShowcaseId('');
      } else {
        showModalMessage('Failed to remove showcase.');
      }
    } catch (error) {
      console.error(error);
      showModalMessage('Error removing showcase.');
    }
  };

  return (
    <div className="manager-dash">
      <button className="toggle-sidebar" onClick={toggleSidebar}>
        {showSidebar ? 'Close sidebar' : 'Open sidebar'}
      </button>
      {showSidebar && (
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
      )}

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
            showSidebar={showSidebar}
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
            showSidebar={showSidebar}
          />
        )}

        {activeSection === 'animals' && (
          <ManageAnimals
            animalData={animalData}
            setAnimalData={setAnimalData}
            addAnimal={addAnimal}
            animalId={animalId}
            setAnimalId={setAnimalId}
            deleteAnimal={deleteAnimal}
            showSidebar={showSidebar}
          />
        )}

        {activeSection === 'cages' && (
          <ManageCages
            cageData={cageData}
            setCageData={setCageData}
            addCage={addCage}
            cageId={cageId}
            setCageId={setCageId}
            deleteCage={deleteCage}
            showSidebar={showSidebar}
          />
        )}

        {activeSection === 'showcases' && (
          <ManageShowcases
            showcaseData={showcaseData}
            setShowcaseData={setShowcaseData}
            addShowcase={addShowcase}
            showcaseId={showcaseId}
            setShowcaseId={setShowcaseId}
            deleteShowcase={deleteShowcase}
            showSidebar={showSidebar}
          />
        )}

        {/* Similar sections for Animal Showcases, etc. */}
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