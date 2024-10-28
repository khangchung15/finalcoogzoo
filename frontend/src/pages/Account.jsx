import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../components/AuthContext';
import './Account.css';

const Account = () => {
  const { userRole, userEmail } = useAuth(); // Get userRole for display
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Use displayRole derived from userRole
  const displayRole = userRole === 'Customer' ? 'Customer' : 'Employee';

  useEffect(() => {
    console.log(userEmail);
    console.log(userRole);
    console.log(displayRole);

    const fetchProfileData = async () => {
      try {
        const response = await fetch(`http://localhost:5000/profile?email=${encodeURIComponent(userEmail)}&type=${encodeURIComponent(displayRole)}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch profile data');
        }

        const data = await response.json();
        setProfileData(data.profile); // Access the profile data from the response
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (userEmail) {
      fetchProfileData();
    }
  }, [userEmail, displayRole]);

  return (
    <div className="account-container">
      <div className="role-display">
        <h2>User Role: {userRole ? userRole : "No role assigned"}</h2> {/* Display userRole here */}
      </div>

      <div className="account-header">
        {displayRole === 'Employee' && (
          <Link to="/employee-dashboard" className="dashboard-btn">
            Employee Dashboard
          </Link>
        )}
        {userRole === 'Manager' && ( // Check userRole for Manager
          <Link to="/manager-dashboard" className="dashboard-btn">
            Manager Dashboard
          </Link>
        )}
      </div>

      <div className="account-section">
        <h2>Profile Information</h2>
        {loading ? (
          <p>Loading...</p>
        ) : error ? (
          <p className="error">{error}</p>
        ) : profileData ? (
          <>
            <p>ID: {profileData.ID}</p>
            <p>First Name: {profileData.First_name}</p>
            <p>Last Name: {profileData.Last_name}</p>
            <p>Email: {profileData.email}</p>
            <p>Phone: {profileData.phone}</p>
            <p>Date of Birth: {profileData.DateOfBirth}</p>
          </>
        ) : (
          <p>No profile data available.</p>
        )}
      </div>
    </div>
  );
};

export default Account;
