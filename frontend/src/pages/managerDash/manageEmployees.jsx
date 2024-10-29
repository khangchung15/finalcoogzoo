import React, { useState, useEffect } from 'react';
import './manageEmployees.css';

function ManageEmployees({ employeeData, setEmployeeData, addEmployee, employeeId, setEmployeeId, deleteEmployee }) {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [updateData, setUpdateData] = useState({}); // State for storing update form data
  const [showUpdateForm, setShowUpdateForm] = useState(false); // Toggle for showing update form
  const [modalMessage, setModalMessage] = useState(''); // Modal message for feedback

  // Fetch employee information from the database
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await fetch('http://localhost:5000/employees');
        if (!response.ok) {
          throw new Error('Failed to fetch employees');
        }
        const data = await response.json();
        setEmployees(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEmployees();
  }, []);

  // Shared validation function for both entry and update forms
  const validateEmployeeData = (data) => {
    const phonePattern = /^\d{3}-\d{3}-\d{4}$/;
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!data.name || !data.department || !data.role || !data.phone || !data.email || !data.startDate || !data.status) {
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

  // Filter employees based on the search query
  const filteredEmployees = employees.filter((employee) =>
    employee.Name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    employee.Department.toLowerCase().includes(searchQuery.toLowerCase()) ||
    employee.Role.toLowerCase().includes(searchQuery.toLowerCase()) ||
    employee.Email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // In manageEmployees.jsx, update the handleUpdateEmployee function:
const handleUpdateEmployee = async () => {
  // Format the date properly
  const formattedDate = new Date(updateData.Start_Date).toISOString().split('T')[0];
  
  // Create normalized update data
  const normalizedUpdateData = {
    ...updateData,
    Start_Date: formattedDate,
    // Convert empty strings to null for optional fields
    Exhibit_ID: updateData.Exhibit_ID || null,
    Supervisor_ID: updateData.Supervisor_ID || null
  };

  try {
    const response = await fetch(`http://localhost:5000/update-employee?id=${updateData.ID}`, {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(normalizedUpdateData),
});


    const result = await response.json();
    
    if (response.ok) {
      setModalMessage('Employee updated successfully');
      // Update the local state with the new data
      setEmployees(prevEmployees => 
        prevEmployees.map(emp => 
          emp.ID === updateData.ID ? { ...emp, ...normalizedUpdateData } : emp
        )
      );
      setShowUpdateForm(false);
      
      // Refresh the employee list
      const refreshResponse = await fetch('http://localhost:5000/employees');
      if (refreshResponse.ok) {
        const refreshedData = await refreshResponse.json();
        setEmployees(refreshedData);
      }
    } else {
      setModalMessage(result.message || 'Error updating employee');
    }
  } catch (error) {
    console.error('Update error:', error);
    setModalMessage('Error updating employee');
  }
};
  // Populate update form when editing an employee
  const handleEditClick = (employee) => {
    console.log("Editing employee:", employee); // Debugging
    setUpdateData(employee);
    setShowUpdateForm(true);
  };

  // Close modal
  const closeModal = () => setModalMessage('');

  // Validate and add employee
  const validateAndAddEmployee = () => {
    const validationError = validateEmployeeData(employeeData);
    if (validationError) {
      setModalMessage(validationError);
      return;
    }
    addEmployee(); // Call your function to add the employee.
  };

  return (
    <div className="manage-employees-container">
      <div className="form-sections-wrapper">
        {/* Employee Entry Form */}
        <div className="manage-employees">
          <h2>Employee Entry Form</h2>
          <input
            type="text"
            placeholder="Name (required)"
            value={employeeData.name}
            onChange={(e) => setEmployeeData({ ...employeeData, name: e.target.value })}
            required
          />
          <input
            type="text"
            placeholder="Department (required)"
            value={employeeData.department}
            onChange={(e) => setEmployeeData({ ...employeeData, department: e.target.value })}
            required
          />
          <input
            type="number"
            placeholder="Exhibit ID (optional)"
            value={employeeData.exhibitId}
            onChange={(e) => setEmployeeData({ ...employeeData, exhibitId: e.target.value })}
          />
          <input
            type="text"
            placeholder="Role (required)"
            value={employeeData.role}
            onChange={(e) => setEmployeeData({ ...employeeData, role: e.target.value })}
            required
          />
          <input
            type="text"
            placeholder="Phone (required; xxx-xxx-xxxx)"
            value={employeeData.phone}
            onChange={(e) => setEmployeeData({ ...employeeData, phone: e.target.value })}
            required
          />
          <input
            type="email"
            placeholder="Email (required)"
            value={employeeData.email}
            onChange={(e) => setEmployeeData({ ...employeeData, email: e.target.value })}
            required
          />
          <input
            type="date"
            placeholder="Start Date (required)"
            value={employeeData.startDate}
            onChange={(e) => setEmployeeData({ ...employeeData, startDate: e.target.value })}
            required
          />
          <input
            type="number"
            placeholder="Supervisor ID (optional)"
            value={employeeData.supervisorId}
            onChange={(e) => setEmployeeData({ ...employeeData, supervisorId: e.target.value })}
          />
          <select
            value={employeeData.status}
            onChange={(e) => setEmployeeData({ ...employeeData, status: e.target.value })}
            required
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="vacation">Vacation</option>
          </select>
          <button onClick={validateAndAddEmployee}>Add Employee</button>
        </div>

        {/* Update Employee Form */}
        {showUpdateForm && (
          <div className="update-form-section">
            <h2>Update Employee</h2>
            <input
              type="text"
              placeholder="Name (required)"
              value={updateData.Name}
              onChange={(e) => setUpdateData({ ...updateData, Name: e.target.value })}
              required
            />
            <input
              type="text"
              placeholder="Department (required)"
              value={updateData.Department}
              onChange={(e) => setUpdateData({ ...updateData, Department: e.target.value })}
              required
            />
            <input
              type="number"
              placeholder="Exhibit ID (optional)"
              value={updateData.Exhibit_ID}
              onChange={(e) => setUpdateData({ ...updateData, Exhibit_ID: e.target.value })}
            />
            <input
              type="text"
              placeholder="Role (required)"
              value={updateData.Role}
              onChange={(e) => setUpdateData({ ...updateData, Role: e.target.value })}
              required
            />
            <input
              type="text"
              placeholder="Phone (required)"
              value={updateData.Phone}
              onChange={(e) => setUpdateData({ ...updateData, Phone: e.target.value })}
              required
            />
            <input
              type="email"
              placeholder="Email (required)"
              value={updateData.Email}
              onChange={(e) => setUpdateData({ ...updateData, Email: e.target.value })}
              required
            />
            <input
              type="date"
              placeholder="Start Date (required)"
              value={updateData.Start_Date}
              onChange={(e) => setUpdateData({ ...updateData, Start_Date: e.target.value })}
              required
            />
            <input
              type="number"
              placeholder="Supervisor ID (optional)"
              value={updateData.Supervisor_ID}
              onChange={(e) => setUpdateData({ ...updateData, Supervisor_ID: e.target.value })}
            />
            <select
              value={updateData.Status}
              onChange={(e) => setUpdateData({ ...updateData, Status: e.target.value })}
              required
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="vacation">Vacation</option>
            </select>
            <button onClick={handleUpdateEmployee}>Update Employee</button>
          </div>
        )}
      </div>

      {/* Display Employee Information */}
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
                  <th>Name</th>
                  <th>Department</th>
                  <th>Exhibit ID</th>
                  <th>Role</th>
                  <th>Phone</th>
                  <th>Email</th>
                  <th>Start Date</th>
                  <th>Supervisor ID</th>
                  <th>Status</th>
                  <th>Edit</th>
                </tr>
              </thead>
              <tbody>
                {filteredEmployees.map((employee) => (
                  <tr key={employee.ID}>
                    <td>{employee.ID}</td>
                    <td>{employee.Name}</td>
                    <td>{employee.Department}</td>
                    <td>{employee.Exhibit_ID || 'N/A'}</td>
                    <td>{employee.Role}</td>
                    <td>{employee.Phone}</td>
                    <td>{employee.Email}</td>
                    <td>{new Date(employee.Start_Date).toLocaleDateString()}</td>
                    <td>{employee.Supervisor_ID || 'N/A'}</td>
                    <td>{employee.Status}</td>
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
              <button onClick={deleteEmployee}>Remove Employee</button>
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