import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../components/AuthContext';
import './Account.css';

const Account = () => {
  const { userRole, userEmail } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log('User Email:', userEmail); // Log userEmail
    console.log('User Role:', userRole); // Log userRole

    const fetchProfileData = async () => {
      try {
        const response = await fetch(`http://localhost:5000/profile?email=${encodeURIComponent(userEmail)}&type=${encodeURIComponent(userRole)}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          const errorText = await response.text(); // Get the error message from the response
          throw new Error(`Failed to fetch profile data: ${errorText}`);
        }

        const data = await response.json();
        setProfileData(data.profile); // Access the profile data from the response
      } catch (err) {
        console.error('Fetch error:', err); // Log the error for debugging
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (userEmail) {
      fetchProfileData();
    }
  }, [userEmail, userRole]);

  return (
    <div className="account-container">
      <div className="role-display">
        <h2>User Role: {userRole ? userRole : "No role assigned"}</h2>
      </div>

      <div className="account-header">
        {userRole && userRole !== 'Customer' && (
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
            <p>Name: {profileData.Name}</p>
            <p>Email: {profileData.email}</p>
            <p>Phone: {profileData.phone}</p>
            <p>Date of Birth: {profileData.DateOfBirth}</p>
          </>
        ) : (
          <p>No profile data available.</p>
        )}
      </div>

      <div className="account-section">
        <h2>Recent Purchases</h2>
        <ul>
          <li>Purchase 1</li>
          <li>Purchase 2</li>
        </ul>
      </div>
    </div>
  );
};

export default Account;
