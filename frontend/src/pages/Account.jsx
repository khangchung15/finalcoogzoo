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
      if (!userEmail) {
        setError('No user email available');
        setLoading(false);
        return;
      }

      try {
        // Fixed template string syntax by using backticks
        const response = await fetch(
          `http://localhost:5000/profile?email=${encodeURIComponent(userEmail)}&type=${encodeURIComponent(displayRole)}`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        if (!data.profile) {
          throw new Error('No profile data received');
        }

        setProfileData(data.profile);
        setError(null);
      } catch (err) {
        console.error('Profile fetch error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [userEmail, displayRole]);

  const renderNameFields = () => {
    if (!profileData) return null;
    
    const firstName = displayRole === 'Customer' 
      ? profileData.First_name 
      : profileData.First_Name;
    
    const lastName = displayRole === 'Customer' 
      ? profileData.Last_name 
      : profileData.Last_Name;

    return (
      <>
        <div className="profile-field">
          <span className="field-label">First Name:</span>
          <span className="field-value">{firstName || 'N/A'}</span>
        </div>
        <div className="profile-field">
          <span className="field-label">Last Name:</span>
          <span className="field-value">{lastName || 'N/A'}</span>
        </div>
      </>
    );
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
        
        {loading && (
          <div className="loading-indicator">Loading profile data...</div>
        )}
        
        {error && (
          <div className="error-message">{error}</div>
        )}
        
        {!loading && !error && profileData && (
          <div className="profile-info">
            <div className="profile-field">
              <span className="field-label">ID:</span>
              <span className="field-value">{profileData.ID}</span>
            </div>
            
            {renderNameFields()}
            
            <div className="profile-field">
              <span className="field-label">Email:</span>
              <span className="field-value">{profileData.email}</span>
            </div>
            
            <div className="profile-field">
              <span className="field-label">Phone:</span>
              <span className="field-value">{profileData.phone}</span>
            </div>
            
            {displayRole === 'Customer' && profileData.DateOfBirth && (
              <div className="profile-field">
                <span className="field-label">Date of Birth:</span>
                <span className="field-value">
                  {new Date(profileData.DateOfBirth).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>
        )}
        
        {!loading && !error && !profileData && (
          <div className="no-data-message">
            No profile data available.
          </div>
        )}
      </div>
    </div>
  );
};

export default Account;