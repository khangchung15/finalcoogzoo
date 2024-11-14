// manage employees jsx 

import React, { useState, useEffect } from 'react';
import './manageEmployees.css';
import showSidebar from './managerdash';

function ManageEmployees({ employeeData, setEmployeeData, addEmployee, employeeId, setEmployeeId,showSidebar}) {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [updateData, setUpdateData] = useState({}); // State for storing update form data
  const [showUpdateForm, setShowUpdateForm] = useState(false); // Toggle for showing update form
  const [modalMessage, setModalMessage] = useState(''); // Modal message for feedback

  const fetchWithTimeout = async (url, options = {}, timeout = 8000) => {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    
    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal
      });
      clearTimeout(id);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      clearTimeout(id);
      if (error.name === 'AbortError') {
        throw new Error('Request timed out');
      }
      throw error;
    }
  };
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await fetchWithTimeout('https://coogzootestbackend-phi.vercel.app/employees');
        setEmployees(data);
      } catch (err) {
        console.error('Fetch error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const handleEditClick = (employee) => {
    setUpdateData(employee);
    setShowUpdateForm(true);
  };

  // Function to handle the employee update
  const updateEmployee = async () => {
    const validationError = validateEmployeeData(updateData);
    if (validationError) {
      setModalMessage(validationError);
      return;
    }

    try {
      const response = await fetch(`https://coogzootestbackend-phi.vercel.app/update-employee?id=${updateData.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      });
      const data = await response.json();
      if (response.ok) {
        setModalMessage('Employee updated successfully.');
        setEmployees(employees.map((emp) => (emp.id === updateData.id ? { ...emp, ...updateData } : emp)));
        setShowUpdateForm(false); // Close the update modal on success
      } else {
        setModalMessage(data.message || 'Error updating employee.');
      }
    } catch (error) {
      console.error('Error:', error);
      setModalMessage('An error occurred while attempting to update the employee.');
    }
  };


  const handleDeleteEmployee = async () => {
    try {
      const response = await fetch(`https://coogzootestbackend-phi.vercel.app/remove-employee?id=${employeeId}`, {
        method: 'DELETE',
      });
  
      const data = await response.json();
      if (response.ok) {
        setModalMessage('Employee soft-deleted successfully.');
        setEmployees(employees.filter(emp => emp.id !== parseInt(employeeId, 10)));
      } else {
        setModalMessage(data.message || 'Error deleting employee.');
      }
    } catch (error) {
      console.error('Error:', error);
      setModalMessage('An error occurred while attempting to delete the employee.');
    }
  };
  
  // shared validation function for both entry and update forms
  const validateEmployeeData = (data) => {
    const phonePattern = /^\d{3}-\d{3}-\d{4}$/;
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!data.firstName || !data.lastName || !data.birthDate || !data.email || !data.phone || !data.department || !data.role || !data.startDate || !data.status) {
      return "Please fill out all required fields.";
    }
    if (!phonePattern.test(data.phone)) {
      return "Please enter a valid phone number.";
    }
    if (!emailPattern.test(data.email)) {
      return "Please enter a valid email address.";
    }
    return null;
  };

  // filter employees based on the search query
  const filteredEmployees = employees.filter((employee) =>
      employee.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      employee.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      employee.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
      employee.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      employee.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // close modal
  const closeModal = () => setModalMessage('');

  // validate and add employee
  const validateAndAddEmployee = () => {
    const validationError = validateEmployeeData(employeeData);
    if (validationError) {
      setModalMessage(validationError);
      return;
    }
    addEmployee(); // call your function to add the employee.
  };

  return (
    <div className={`manage-employees-container ${showSidebar ? '' : 'sidebar-collapsed'}`}>
      <div className="form-sections-wrapper">
        {/* employee entry form */}
        <div className="manage-employees">
          <h2>Employee Entry Form</h2>
          <input
            type="text"
            placeholder="First Name (required)"
            value={employeeData.firstName || ""}
            onChange={(e) => setEmployeeData({ ...employeeData, firstName: e.target.value })}
            required
          />
          <input
            type="text"
            placeholder="Last Name (required)"
            value={employeeData.lastName || ""}
            onChange={(e) => setEmployeeData({ ...employeeData, lastName: e.target.value })}
            required
          />
          <label>Birth Date (required)</label>
          <input
            type="date"
            placeholder="Birth Date (required)"
            value={employeeData.birthDate || ""}
            onChange={(e) => setEmployeeData({ ...employeeData, birthDate: e.target.value })}
            required
          />
          <input
            type="email"
            placeholder="Email (required)"
            value={employeeData.email || ""}
            onChange={(e) => setEmployeeData({ ...employeeData, email: e.target.value })}
            required
          />
          <input
            type="text"
            placeholder="Phone (required; xxx-xxx-xxxx)"
            value={employeeData.phone || ""}
            onChange={(e) => setEmployeeData({ ...employeeData, phone: e.target.value })}
            required
          />
          <input
            type="text"
            placeholder="Department (required)"
            value={employeeData.department || ""}
            onChange={(e) => setEmployeeData({ ...employeeData, department: e.target.value })}
            required
          />
          <input
            type="text"
            placeholder="Role (required)"
            value={employeeData.role || ""} 
            onChange={(e) => setEmployeeData({ ...employeeData, role: e.target.value })}
            required
          />
          <label>Start Date (required)</label>
          <input
            type="date"
            placeholder="Start Date (required)"
            value={employeeData.startDate || ""}
            onChange={(e) => setEmployeeData({ ...employeeData, startDate: e.target.value })}
            required
          />
          <input
            type="number"
            placeholder="Exhibit ID (optional)"
            value={employeeData.exhibitId || ""}
            onChange={(e) => setEmployeeData({ ...employeeData, exhibitId: e.target.value ? parseInt(e.target.value, 10) : null })}
          />
          <input
            type="number"
            placeholder="Supervisor ID (optional)"
            value={employeeData.supervisorId || ""}
            onChange={(e) => setEmployeeData({ ...employeeData, supervisorId: e.target.value ? parseInt(e.target.value, 10) : null })}
          />
          <select
            value={employeeData.status || ""}
            onChange={(e) => setEmployeeData({ ...employeeData, status: e.target.value })}
            required
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="vacation">Vacation</option>
          </select>
          <label>End Date (optional)</label>
          <input
            type="date"
            placeholder="End Date (optional)"
            value={employeeData.endDate || ""}
              onChange={(e) => setEmployeeData({ ...employeeData, endDate: e.target.value })}
          />
          <button onClick={validateAndAddEmployee}>Add Employee</button>
        </div>
      </div>
      {/* Update Employee Modal */}
      {showUpdateForm && (
        <div className="modal">
          <div className="modal-content">
            <div className="modal-header">
              <button className="close-button" onClick={() => setShowUpdateForm(false)}>×</button>
              <h2>Edit Employee</h2>
              {/* form fields pre-filled with updateData */}
              <label>First Name</label>
              <input
                type="text"
                placeholder="First Name"
                value={updateData.firstName}
                onChange={(e) => setUpdateData({ ...updateData, firstName: e.target.value })}
                required
              />
              <label>Last Name</label>
              <input
                type="text"
                placeholder="Last Name"
                value={updateData.lastName}
                onChange={(e) => setUpdateData({ ...updateData, lastName: e.target.value })}
              />
              <label>Birth Date</label>
              <input
                type="date"
                placeholder="Birth Date"
                value={updateData.birthDate}
                onChange={(e) => setUpdateData({ ...updateData, birthDate: e.target.value })}
              />
              <label>Email</label>
              <input
                type="email"
                placeholder="Email"
                value={updateData.email}
                onChange={(e) => setUpdateData({ ...updateData, email: e.target.value })}
              />
              <label>Phone</label>
              <input
                type="text"
                placeholder="Phone"
                value={updateData.phone}
                onChange={(e) => setUpdateData({ ...updateData, phone: e.target.value })}
              />
              <label>Department</label>
              <input
                type="text"
                placeholder="Department"
                value={updateData.department}
                onChange={(e) => setUpdateData({ ...updateData, department: e.target.value })}
              />
              <label>Role</label>
              <input
                type="text"
                placeholder="Role"
                value={updateData.role}
                onChange={(e) => setUpdateData({ ...updateData, role: e.target.value })}
              />
              <label>Start Date</label>
              <input
                type="date"
                placeholder="Start Date"
                value={updateData.startDate}
                onChange={(e) => setUpdateData({ ...updateData, startDate: e.target.value })}
              />
              <label>Exhibit ID</label>
              <input
                type="number"
                placeholder="Exhibit ID (optional)"
                value={updateData.exhibitID || ''}
                onChange={(e) => setUpdateData({ ...updateData, exhibitID: e.target.value ? parseInt(e.target.value, 10) : null })}
              />
              <label>Supervisor_ID</label>
              <input
                type="number"
                placeholder="Supervisor ID (optional)"
                value={updateData.supervisorID || ''}
                onChange={(e) => setUpdateData({ ...updateData, supervisorID: e.target.value ? parseInt(e.target.value, 10) : null })}
              />
              <label>Status</label>
              <select
                value={updateData.status}
                onChange={(e) => setUpdateData({ ...updateData, status: e.target.value })}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="vacation">Vacation</option>
              </select>
              <label>End Date</label>
              <input
                type="date"
                placeholder="End Date (optional)"
                value={updateData.endDate || ''}
                onChange={(e) => setUpdateData({ ...updateData, endDate: e.target.value })}
              />
              <button onClick={updateEmployee}>Save Changes</button>
            </div>
          </div>
        </div>
      )}
      {/* display employee information */}
      <div className="employee-list">
        <h2>Employee List</h2>
        <input
          type="text"
          placeholder="Search employees..."
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
            <table className="employee-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>First Name</th>
                  <th>Last Name</th>
                  <th>Birth Date</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Department</th>
                  <th>Role</th>
                  <th>Start Date</th>
                  <th>Exhibit ID</th>
                  <th>Supervisor ID</th>
                  <th>Status</th>
                  <th>End Date</th>
                  <th>Edit</th>
                </tr>
              </thead>
              <tbody>
                {filteredEmployees.map((employee) => (
                  <tr key={employee.id}>
                    <td>{employee.id}</td>
                    <td>{employee.firstName}</td>
                    <td>{employee.lastName}</td>
                    <td>{employee.birthDate}</td>
                    <td>{employee.email}</td>
                    <td>{employee.phone}</td>
                    <td>{employee.department}</td>
                    <td>{employee.role}</td>
                    <td>{employee.startDate}</td>
                    <td>{employee.exhibitID || 'N/A'}</td>
                    <td>{employee.supervisorID || 'N/A'}</td>
                    <td>{employee.status}</td>
                    <td>{employee.endDate || 'N/A'}</td>
                    <td><button onClick={() => handleEditClick(employee)}>Edit</button></td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Remove Employee Section */}
            <div className="remove-employee-section">
              <h2>Remove Employee</h2>
              <input
                type="number"
                placeholder="Employee ID (required)"
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                required
              />
              <button onClick={handleDeleteEmployee}>Remove Employee</button>
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

export default ManageEmployees;