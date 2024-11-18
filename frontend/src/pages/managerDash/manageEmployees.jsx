import React, { useState, useEffect } from 'react';
import './manageEmployees.css';

function ManageEmployees({employeeId, setEmployeeId, showSidebar }) {
  const [employees, setEmployees] = useState([]);
  const [exhibits, setExhibits] = useState([]);
  const [employeeData, setEmployeeData] = useState({
    firstName: '',
    lastName: '',
    birthDate: '',
    email: '',
    password: '',
    phone: '',
    department: '',
    role: '',
    startDate: '',
    exhibitId: '',
    supervisorId: '',
    status: 'active',
    endDate: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [updateData, setUpdateData] = useState({});
  const [showUpdateForm, setShowUpdateForm] = useState(false);
  const [modalMessage, setModalMessage] = useState('');

  // fetch employee information from the database
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await fetch('https://coogzoobackend.vercel.app/employees');
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

  useEffect(() => {
    const fetchExhibits = async () => {
      try {
        const response = await fetch('https://coogzoobackend.vercel.app/exhibits');
        if (!response.ok) {
          throw new Error('Failed to fetch exhibits');
        }
        const data = await response.json();
        setExhibits(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchExhibits();
  }, []);

  const handleEditClick = (employee) => {
    setUpdateData(employee);
    setShowUpdateForm(true);
    console.log("Editing employee:", employee); // check if data is correct
    console.log("Show Update Form:", showUpdateForm);
  };

  const updateEmployee = async () => {
    const validationError = validateEmployeeData(updateData);
    if (validationError) {
      setModalMessage(validationError);
      return;
    }
    try {
      const response = await fetch(`https://coogzoobackend.vercel.app/update-employee?id=${updateData.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      });
      const data = await response.json();
      if (response.ok) {
        setModalMessage('Employee updated successfully.');
        setEmployees(employees.map((emp) => (emp.id === updateData.id ? { ...emp, ...updateData } : emp)));
        setShowUpdateForm(false); // close modal on success
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
      const response = await fetch(`https://coogzoobackend.vercel.app/remove-employee?id=${employeeId}`, {
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
    const namePattern = /^[A-Za-z-]+$/;
    const deptRolePattern = /^[A-Za-z\s]+$/;
    
    if (!namePattern.test(data.firstName)) {
      return "First name can only contain letters and hyphens.";
    }
    if (data.firstName.length < 2 || data.firstName.length > 50) {
      return "First name must be between 2 and 50 characters.";
    }

    if (!deptRolePattern.test(data.department)) {
      return "Department can only contain letters and spaces.";
    }
    if (data.department.trim().length < 2 || data.department.trim().length > 50) {
      return "Department must be between 2 and 50 characters.";
    }
  
    if (!deptRolePattern.test(data.role)) {
      return "Role can only contain letters and spaces.";
    }
    if (data.role.trim().length < 2 || data.role.trim().length > 50) {
      return "Role must be between 2 and 50 characters.";
    }

    const birthDate = new Date(data.birthDate);
    const today = new Date();
    
    if (isNaN(birthDate.getTime())) {
      return "Invalid birth date";
    }
  
    if (birthDate > today) {
      return "Birth date cannot be in the future";
    }
  
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    if (age < 18) {
      return "Employee must be at least 18 years old.";
    }

    if (!data.firstName || !data.lastName || !data.birthDate || !data.email || 
        !data.phone || !data.department || !data.role || !data.startDate || 
        !data.status) {
      return "Please fill out all required fields.";
    }
    
    if (!phonePattern.test(data.phone)) {
      return "Please enter a valid phone number (xxx-xxx-xxxx).";
    }
    
    if (!emailPattern.test(data.email)) {
      return "Please enter a valid email address.";
    }

    const startDate = new Date(data.startDate);
    if (isNaN(startDate.getTime())) {
      return "Invalid start date";
    }
  
    if (data.endDate) {
      const endDate = new Date(data.endDate);
      if (isNaN(endDate.getTime())) {
        return "Invalid end date";
      }
      if (endDate < startDate) {
        return "End date cannot be before start date";
      }
    }
  
    // Only validate password for new employees or if password is being changed
    if (!data.id && !data.password) { // New employee
      return "Password is required for new employees.";
    }
    
    if (data.password && data.password.length < 8) {
      return "Password must be at least 8 characters long.";
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
  const validateAndAddEmployee = async () => {
    const validationError = validateEmployeeData(employeeData);
    if (validationError) {
      setModalMessage(validationError);
      return;
    }
  
    try {
      const response = await fetch('https://coogzoobackend.vercel.app/add-employee', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(employeeData),
      });
  
      const data = await response.json();
      
      if (response.ok) {
        const credentialsMessage = `Employee added successfully!
      
        LOGIN CREDENTIALS:
        Email: ${data.loginCredentials.email}
        Password: ${data.loginCredentials.password}
        
        Please provide these credentials to the employee.
        The employee should change their password upon first login.`;
        
        setModalMessage(credentialsMessage);
        setEmployeeData({
          firstName: '',
          lastName: '',
          birthDate: '',
          email: '',
          password: '',
          phone: '',
          department: '',
          role: '',
          startDate: '',
          exhibitId: '',
          supervisorId: '',
          status: 'active',
          endDate: ''
        });
        // Refresh the employee list
        const updatedResponse = await fetch('https://coogzoobackend.vercel.app/employees');
        const updatedData = await updatedResponse.json();
        setEmployees(updatedData);
      } else {
        setModalMessage(data.message || 'Failed to add employee');
      }
    } catch (error) {
      console.error('Error:', error);
      setModalMessage('An error occurred while adding the employee');
    }
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
          <label>Birth Date (required)</label>
          <input
            type="date"
            placeholder="Birth Date (required)"
            value={employeeData.birthDate}
            onChange={(e) => setEmployeeData({ ...employeeData, birthDate: e.target.value })}
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
            type="password"
            placeholder="Password (required)"
            value={employeeData.password}
            onChange={(e) => setEmployeeData({ ...employeeData, password: e.target.value })}
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
            type="text"
            placeholder="Department (required)"
            value={employeeData.department}
            onChange={(e) => setEmployeeData({ ...employeeData, department: e.target.value })}
            required
          />
          <input
            type="text"
            placeholder="Role (required)"
            value={employeeData.role}
            onChange={(e) => setEmployeeData({ ...employeeData, role: e.target.value })}
            required
          />
          <label>Start Date (required)</label>
          <input
            type="date"
            placeholder="Start Date (required)"
            value={employeeData.startDate}
            onChange={(e) => setEmployeeData({ ...employeeData, startDate: e.target.value })}
            required
          />
          <label>Assign to Exhibit</label>
          <select
              value={employeeData.exhibitID}
              onChange={(e) => setEmployeeData({...employeeData, exhibitID: e.target.value })}
          >
              <option value="">Select Exhibit</option>
              {exhibits.map((exhibit) => (
                  <option key={exhibit.id} value={exhibit.id}>
                      {exhibit.name}
                  </option>
              ))}
          </select>
          <label>Assign to Supervisor</label>
          <select
              value={employeeData.supervisorID}
              onChange={(e) => setEmployeeData({...employeeData, supervisorID: e.target.value })}
          >
              <option value="">Select Supervisor</option>
              {employees
                .filter(emp => emp.role.toLowerCase() === "manager")
                .map((manager) => (
                  <option key={manager.id} value={manager.id}>
                    ID: {manager.id}, {manager.lastName}
                  </option>
                ))}
          </select>
          <select
            value={employeeData.status}
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
            value={employeeData.endDate}
            onChange={(e) => setEmployeeData({ ...employeeData, endDate: e.target.value })}
            required
          />
          <button onClick={validateAndAddEmployee}>Add Employee</button>
        </div>
      </div>

      {/* display employee information */}
      <div className="employee-list">
        <h2>Employee Records</h2>
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

      {/* Update Employee Modal */}
      {showUpdateForm && (
        <div className="modal">
          <div className="modal-content">
            <button className="close-button" onClick={() => setShowUpdateForm(false)}>×</button>
            <h2>Edit Employee</h2>
            <input
              type="text"
              placeholder="First Name"
              value={updateData.firstName}
              onChange={(e) => setUpdateData({ ...updateData, firstName: e.target.value })}
            />
            <input
              type="text"
              placeholder="Last Name"
              value={updateData.lastName}
              onChange={(e) => setUpdateData({ ...updateData, lastName: e.target.value })}
            />
            <input
              type="date"
              placeholder="Birth Date"
              value={updateData.birthDate}
              onChange={(e) => setUpdateData({ ...updateData, birthDate: e.target.value })}
            />
            <input
              type="email"
              placeholder="Email"
              value={updateData.email}
              onChange={(e) => setUpdateData({ ...updateData, email: e.target.value })}
            />
            <input
              type="password"
              placeholder="New Password (leave blank to keep current)"
              value={updateData.password || ''}
              onChange={(e) => setUpdateData({ ...updateData, password: e.target.value })}
            />
            <input
              type="text"
              placeholder="Phone"
              value={updateData.phone}
              onChange={(e) => setUpdateData({ ...updateData, phone: e.target.value })}
            />
            <input
              type="text"
              placeholder="Department"
              value={updateData.department}
              onChange={(e) => setUpdateData({ ...updateData, department: e.target.value })}
            />
            <input
              type="text"
              placeholder="Role"
              value={updateData.role}
              onChange={(e) => setUpdateData({ ...updateData, role: e.target.value })}
            />
            <input
              type="date"
              placeholder="Start Date"
              value={updateData.startDate}
              onChange={(e) => setUpdateData({ ...updateData, startDate: e.target.value })}
            />
            <label>Assign to Exhibit</label>
              <select
                  value={updateData.exhibitID}
                  onChange={(e) => setUpdateData({...updateData, exhibitID: e.target.value })}
              >
                  <option value="">Select Exhibit</option>
                  {exhibits.map((exhibit) => (
                      <option key={exhibit.id} value={exhibit.id}>
                          {exhibit.name}
                      </option>
                  ))}
              </select>
            <label>Assign to Supervisor</label>
            <select
                value={updateData.supervisorID}
                onChange={(e) => setEmployeeData({...updateData, supervisorID: e.target.value })}
            >
                <option value="">Select Supervisor</option>
                {employees
                  .filter(emp => emp.role.toLowerCase() === "manager")
                  .map((manager) => (
                    <option key={manager.id} value={manager.id}>
                      ID: {manager.id}, {manager.lastName}
                    </option>
                  ))}
            </select>
            <select
              value={updateData.status}
              onChange={(e) => setUpdateData({ ...updateData, status: e.target.value })}
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="vacation">Vacation</option>
            </select>
            <input
              type="date"
              placeholder="End Date"
              value={updateData.endDate || ''}
              onChange={(e) => setUpdateData({ ...updateData, endDate: e.target.value })}
            />
            <button onClick={updateEmployee}>Save Changes</button>
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
}

export default ManageEmployees;