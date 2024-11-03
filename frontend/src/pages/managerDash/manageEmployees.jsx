import React, { useState, useEffect } from 'react';
import './manageEmployees.css';

function ManageEmployees({ employeeData, setEmployeeData, addEmployee, employeeId, setEmployeeId, deleteEmployee }) {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [updateData, setUpdateData] = useState({});
  const [showUpdateForm, setShowUpdateForm] = useState(false);
  const [modalMessage, setModalMessage] = useState('');

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

  // Validation function
  const validateEmployeeData = (data) => {
    const phonePattern = /^\d{3}-\d{3}-\d{4}$/;
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!data.firstName || !data.lastName || !data.department || !data.role || !data.phone || !data.email || !data.startDate || !data.status) {
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
    employee.First_Name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    employee.Last_Name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    employee.Department.toLowerCase().includes(searchQuery.toLowerCase()) ||
    employee.Role.toLowerCase().includes(searchQuery.toLowerCase()) ||
    employee.Email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Update employee data
  const handleUpdateEmployee = async () => {
    const formattedDate = new Date(updateData.Start_Date).toISOString().split('T')[0];
    const normalizedUpdateData = {
      ...updateData,
      Start_Date: formattedDate,
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
        setEmployees(prevEmployees => 
          prevEmployees.map(emp => 
            emp.ID === updateData.ID ? { ...emp, ...normalizedUpdateData } : emp
          )
        );
        setShowUpdateForm(false);
        
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

  // Edit employee
  const handleEditClick = (employee) => {
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
    addEmployee();
  };

  return (
  <div className="manage-employees-container">
    <div className="form-sections-wrapper">
      <div className="manage-employees">
        <h2>Employee Entry Form</h2>
        <input
          type="text"
          placeholder="First Name (required)"
          value={employeeData.firstName}
          onChange={(e) => setEmployeeData({ ...employeeData, firstName: e.target.value })}
          required
        />
        <input
          type="text"
          placeholder="Last Name (required)"
          value={employeeData.lastName}
          onChange={(e) => setEmployeeData({ ...employeeData, lastName: e.target.value })}
          required
        />
        {/* Additional fields and add button as above */}
      </div>

      {showUpdateForm && (
        <div className="update-form-section">
          <h2>Update Employee</h2>
          <input
            type="text"
            placeholder="First Name (required)"
            value={updateData.First_Name}
            onChange={(e) => setUpdateData({ ...updateData, First_Name: e.target.value })}
            required
          />
          <input
            type="text"
            placeholder="Last Name (required)"
            value={updateData.Last_Name}
            onChange={(e) => setUpdateData({ ...updateData, Last_Name: e.target.value })}
            required
          />
          {/* Additional fields and update button as above */}
        </div>
      )}
    </div>

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
        <table className="employee-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>First Name</th>
              <th>Last Name</th>
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
                <td>{employee.First_Name}</td>
                <td>{employee.Last_Name}</td>
                <td>{employee.Department}</td>
                <td>{employee.Exhibit_ID || 'N/A'}</td>
                <td>{employee.Role}</td>
                <td>{employee.Phone}</td>
                <td>{employee.Email}</td>
                <td>{new Date(employee.Start_Date).toLocaleDateString()}</td>
                <td>{employee.Supervisor_ID || 'N/A'}</td>
                <td>{employee.Status}</td>
                <td>
                  <button onClick={() => handleEditClick(employee)}>Edit</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>

    {modalMessage && (
      <div className="modal">
        <p>{modalMessage}</p>
        <button onClick={closeModal}>Close</button>
      </div>
    )}
  </div>
);
}

export default ManageEmployees;