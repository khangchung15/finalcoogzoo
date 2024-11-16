import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../components/AuthContext';
import './Account.css';

const Account = () => {
  const { userRole, userEmail } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const displayRole = userRole === 'Customer' ? 'Customer' : 'Employee';

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const response = await fetch(
          `https://coogzootestbackend-phi.vercel.app/profile?email=${encodeURIComponent(userEmail)}&type=${encodeURIComponent(displayRole)}`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );

        if (!response.ok) {
          throw new Error('Failed to fetch profile data');
        }

        const data = await response.json();
        setProfileData(data.profile);
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

  const formatDate = (dateString) => {
    if (!dateString) return 'Not available';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="account-container">
      <div className="role-display">
        <h2>User Role: {userRole || "No role assigned"}</h2>
      </div>
      
      <div className="account-header">
        {displayRole === 'Employee' && (
          <Link to="/employee-dashboard" className="dashboard-btn">
            Employee Dashboard
          </Link>
        )}
        {userRole === 'Manager' && (
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
            <p>First Name: {profileData.First_Name}</p>
            <p>Last Name: {profileData.Last_Name}</p>
            <p>Email: {profileData.email}</p>
            <p>Phone: {profileData.phone || 'Not available'}</p>
            <p>Date of Birth: {formatDate(profileData.DateOfBirth)}</p>
          </>
        ) : (
          <p>No profile data available.</p>
        )}
      </div>
    </div>
  );
};

export default Account;