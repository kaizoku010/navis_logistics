import React from 'react';
import { useDriverAuth } from '../contexts/DriverAuthContext';
import { Avatar } from 'antd'; // Import Avatar
import './driverDashboard.css'; // Reusing the CSS for general styling

function DriverProfile() {
  const { driver } = useDriverAuth();

  if (!driver) {
    return <div className="driver-profile-container">Loading driver profile...</div>;
  }

  return (
    <div className="driver-profile-container">
      <h1>Driver Profile</h1>
      <div className="profile-details">
        {driver.imageUrl && (
          <Avatar size={128} src={driver.imageUrl} alt="Driver Profile" /> // Using Ant Design Avatar
        )}
        <p><strong>Name:</strong> {driver.name}</p>
        <p><strong>Email:</strong> {driver.email}</p>
        <p><strong>Phone Number:</strong> {driver.phoneNumber}</p>
        <p><strong>Age:</strong> {driver.age}</p>
        <p><strong>Permit ID:</strong> {driver.permitId}</p>
        <p><strong>NIN Number:</strong> {driver.ninNumber}</p>
        <p><strong>Company:</strong> {driver.company}</p>
        <p><strong>Status:</strong> {driver.status}</p>
        {/* Add more driver details as needed */}
      </div>
    </div>
  );
}

export default DriverProfile;