import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const Account = ({ userRole = '', userEmail = '' }) => {
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const displayRole = userRole === 'Customer' ? 'Customer' : 'Employee';

  useEffect(() => {
    const fetchProfileData = async () => {
      if (!userEmail) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `https://coogzootestbackend-phi.vercel.app/profile?email=${encodeURIComponent(userEmail)}&type=${encodeURIComponent(displayRole.toLowerCase())}`,
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
        if (!data.profile) {
          throw new Error('No profile data received');
        }
        
        setProfileData(data.profile);
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

    // Normalize the field names to handle both cases
    const firstName = profileData.First_name || profileData.First_Name || 'N/A';
    const lastName = profileData.Last_name || profileData.Last_Name || 'N/A';

    return (
      <>
        <p className="mb-2"><strong>First Name:</strong> {firstName}</p>
        <p className="mb-2"><strong>Last Name:</strong> {lastName}</p>
      </>
    );
  };

  if (!userEmail) {
    return (
      <div className="p-4">
        <p className="text-red-500">Please log in to view your account.</p>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <div className="mb-6">
        <h2 className="text-xl font-bold mb-2">User Role: {userRole || "No role assigned"}</h2>
      </div>

      <div className="mb-6">
        {displayRole === 'Employee' && (
          <Link 
            to="/employee-dashboard"
            className="inline-block bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 mr-2"
          >
            Employee Dashboard
          </Link>
        )}
        {userRole === 'Manager' && (
          <Link 
            to="/manager-dashboard"
            className="inline-block bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            Manager Dashboard
          </Link>
        )}
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold mb-4">Profile Information</h2>
        
        {loading ? (
          <p>Loading...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : profileData ? (
          <div className="space-y-2">
            <p className="mb-2"><strong>ID:</strong> {profileData.ID}</p>
            {renderNameFields()}
            <p className="mb-2"><strong>Email:</strong> {profileData.email}</p>
            <p className="mb-2"><strong>Phone:</strong> {profileData.phone || 'N/A'}</p>
            {displayRole === 'Customer' && profileData.DateOfBirth && (
              <p className="mb-2"><strong>Date of Birth:</strong> {profileData.DateOfBirth}</p>
            )}
          </div>
        ) : (
          <p>No profile data available.</p>
        )}
      </div>
    </div>
  );
};

export default Account;